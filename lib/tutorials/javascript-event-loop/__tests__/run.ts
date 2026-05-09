// Smoke tests for the event-loop simulator. Run with: npm run test:el
// Uses node:assert. No test framework — exits 0 on success, 1 on failure.

import assert from "node:assert/strict";
import {
  EventLoopSimulator,
  resetIds,
} from "../simulator";
import { runUserCode, tracesToSteps } from "../instrumenter";
import type { TraceEvent } from "../simulator";

const tests: { name: string; fn: () => void }[] = [];
function test(name: string, fn: () => void) {
  tests.push({ name, fn });
}

test("push/pop maintains a LIFO stack", () => {
  resetIds();
  const sim = new EventLoopSimulator("// src");
  sim.push("main", 1);
  sim.push("inner", 2);
  assert.equal(sim.state.stack.length, 2);
  assert.equal(sim.state.stack[1].label, "inner");
  sim.pop();
  assert.equal(sim.state.stack.length, 1);
  assert.equal(sim.state.stack[0].label, "main");
});

test("phase becomes idle when stack drains", () => {
  resetIds();
  const sim = new EventLoopSimulator("");
  sim.push("main");
  assert.equal(sim.state.phase, "running-task");
  sim.pop();
  assert.equal(sim.state.phase, "idle");
});

test("scheduleTimer parks a Web API; fireWebApi moves it to taskQueue", () => {
  resetIds();
  const sim = new EventLoopSimulator("");
  const w = sim.scheduleTimer(0, "cb_a");
  assert.equal(sim.state.webApis.length, 1);
  assert.equal(sim.state.taskQueue.length, 0);
  sim.fireWebApi(w.id);
  assert.equal(sim.state.webApis.length, 0);
  assert.equal(sim.state.taskQueue.length, 1);
  assert.equal(sim.state.taskQueue[0].source, "timer");
});

test("microtask queue is FIFO", () => {
  resetIds();
  const sim = new EventLoopSimulator("");
  sim.enqueueMicrotask("m1");
  sim.enqueueMicrotask("m2");
  const first = sim.pickNextMicrotask();
  assert.equal(first?.label, "m1");
  const second = sim.pickNextMicrotask();
  assert.equal(second?.label, "m2");
  assert.equal(sim.pickNextMicrotask(), undefined);
});

test("snapshot deep-copies state", () => {
  resetIds();
  const sim = new EventLoopSimulator("// src");
  sim.push("main", 1);
  const step = sim.snapshot("first");
  sim.push("inner", 2);
  // Snapshot must not see the later push.
  assert.equal(step.state.stack.length, 1);
  assert.equal(step.state.stack[0].label, "main");
  // Mutating the snapshot must not affect the live state.
  step.state.stack.push({ id: "x", label: "fake" });
  assert.equal(sim.state.stack.length, 2); // main + inner, not 3
});

test("log accumulates into consoleLog and is captured by snapshot", () => {
  resetIds();
  const sim = new EventLoopSimulator("");
  sim.log("hello");
  sim.log("world");
  const s = sim.snapshot("done");
  assert.deepEqual(s.state.consoleLog, ["hello", "world"]);
});

test("tracesToSteps emits a step per trace event plus open/close + drain", () => {
  resetIds();
  const trace: TraceEvent[] = [
    { op: "log", args: ["a"], line: 1 },
    { op: "setTimeout", ms: 0, line: 2, bodyLabel: "() => log(b)" },
    { op: "log", args: ["c"], line: 3 },
  ];
  const steps = tracesToSteps(trace, "log a;\nsetTimeout 0;\nlog c;");
  // Expect: initial, push script, log a, schedule timer, fire timer,
  // log c, pop script, run task, idle. So at least 8 steps.
  assert.ok(steps.length >= 8, `expected >=8 steps, got ${steps.length}`);
  // Final consoleLog should contain a, c in that order.
  const finalLog = steps[steps.length - 1].state.consoleLog;
  // For this minimal trace tracesToSteps does NOT itself execute the timer
  // body's log — the test verifies only the queue/stack movement, since
  // playground bodies are described, not executed. So consoleLog is [a, c].
  assert.deepEqual(finalLog, ["a", "c"]);
});

test("runUserCode returns ok:true on a basic snippet", () => {
  const result = runUserCode(`console.log("ping");`);
  assert.equal(result.ok, true);
  if (result.ok) {
    assert.ok(result.steps.length > 0);
    const finalLog = result.steps[result.steps.length - 1].state.consoleLog;
    assert.deepEqual(finalLog, ["ping"]);
  }
});

test("runUserCode reports parse error", () => {
  const result = runUserCode(`this is not valid js }`);
  assert.equal(result.ok, false);
  if (!result.ok) {
    assert.match(result.error, /Parse error|Runtime error/);
  }
});

test("runUserCode handles setTimeout — schedules and fires", () => {
  const r = runUserCode(`setTimeout(() => {}, 100);`);
  assert.equal(r.ok, true);
  if (r.ok) {
    const narrations = r.steps.map((s) => s.narration);
    assert.ok(
      narrations.some((n) => /setTimeout.*100ms.*Web APIs/.test(n)),
      "expected a step describing setTimeout being parked"
    );
    assert.ok(
      narrations.some((n) => /Timer fired/.test(n)),
      "expected a step describing the timer firing"
    );
  }
});

test("runUserCode handles Promise.resolve().then — records thenChain", () => {
  const r = runUserCode(`Promise.resolve().then(() => {});`);
  assert.equal(r.ok, true);
  if (r.ok) {
    const narrations = r.steps.map((s) => s.narration);
    assert.ok(
      narrations.some((n) => /\.then.*registered/.test(n)),
      "expected a step describing .then being recorded as a microtask"
    );
  }
});

test("runUserCode handles multi-line callback bodies without syntax error", () => {
  const r = runUserCode(
    `setTimeout(() => {\n  console.log("x");\n}, 0);`
  );
  assert.equal(
    r.ok,
    true,
    r.ok ? "" : "expected ok:true, got error: " + (r as any).error
  );
});

let passed = 0;
let failed = 0;
for (const t of tests) {
  try {
    t.fn();
    console.log(`  ok  ${t.name}`);
    passed += 1;
  } catch (e: any) {
    console.error(`  FAIL ${t.name}`);
    console.error(`       ${e?.message ?? e}`);
    failed += 1;
  }
}

console.log(`\n${passed} passed, ${failed} failed`);
process.exit(failed === 0 ? 0 : 1);
