import {
  EventLoopSimulator,
  resetIds,
  type Step,
} from "./simulator";

// =============================================================
// 5a — Sync only: pure call-stack trace
// =============================================================
export const syncOnlySteps: Step[] = (() => {
  const source = `function greet(name) {
  console.log("hi, " + name);
}

console.log("start");
greet("world");
console.log("end");`;
  resetIds();
  const sim = new EventLoopSimulator(source);
  const out: Step[] = [];

  out.push(
    sim.snapshot(
      `Execution begins. The call stack is empty, both queues are empty, no Web APIs are pending. JS is about to run the script as a single task.`
    )
  );

  const main = sim.push("(script)", 5);
  out.push(
    sim.snapshot(
      `The script itself enters the call stack as a single task — frame <code class="inline">(script)</code>. We're now in the <strong>running-task</strong> phase. We start at line 5, the first executable statement.`,
      { [main.id]: "enter" }
    )
  );

  sim.setLine(5);
  sim.log("start");
  out.push(
    sim.snapshot(
      `Line 5 runs synchronously. <code class="inline">console.log("start")</code> pushes a transient frame, prints, and pops — too brief to visualize. Console now shows <strong>start</strong>.`
    )
  );

  sim.setLine(6);
  out.push(
    sim.snapshot(
      `Line 6: <code class="inline">greet("world")</code>. About to invoke <code class="inline">greet</code>.`
    )
  );

  const greet = sim.push("greet(\"world\")", 1);
  out.push(
    sim.snapshot(
      `<code class="inline">greet</code> enters the stack on top of <code class="inline">(script)</code>. Control transfers to line 1.`,
      { [greet.id]: "enter" }
    )
  );

  sim.setLine(2);
  sim.log("hi, world");
  out.push(
    sim.snapshot(
      `Line 2: <code class="inline">console.log("hi, " + name)</code> runs. Console now shows <strong>start, hi, world</strong>.`
    )
  );

  sim.pop();
  out.push(
    sim.snapshot(
      `<code class="inline">greet</code> returns. Its frame pops off the stack. Control returns to the script at line 7.`,
      { [greet.id]: "leave" }
    )
  );

  sim.setLine(7);
  sim.log("end");
  out.push(
    sim.snapshot(
      `Line 7: <code class="inline">console.log("end")</code> runs. Console: <strong>start, hi, world, end</strong>.`
    )
  );

  sim.pop();
  out.push(
    sim.snapshot(
      `<code class="inline">(script)</code> returns; its frame pops. Stack is empty. The microtask queue is drained (it's already empty), no rendering opportunity is needed, no tasks are queued — the loop is <strong>idle</strong>.`,
      { [main.id]: "leave" }
    )
  );

  return out;
})();

// =============================================================
// 5b — setTimeout(0) vs sync code
// =============================================================
export const setTimeoutZeroSteps: Step[] = (() => {
  const source = `console.log("A");

setTimeout(() => {
  console.log("B");
}, 0);

console.log("C");`;
  resetIds();
  const sim = new EventLoopSimulator(source);
  const out: Step[] = [];

  out.push(sim.snapshot(`We'll see why <code class="inline">setTimeout(fn, 0)</code> doesn't fire immediately — it can't until the current task finishes and the microtask checkpoint completes.`));

  const main = sim.push("(script)", 1);
  sim.log("A");
  out.push(sim.snapshot(`Line 1: <code class="inline">console.log("A")</code>. Console: <strong>A</strong>.`, { [main.id]: "enter" }));

  sim.setLine(3);
  const timer = sim.scheduleTimer(0, "() => log(B)");
  out.push(sim.snapshot(`Line 3: <code class="inline">setTimeout(cb, 0)</code> hands the callback to the host environment with a 0ms delay. The host parks it in <strong>Web APIs</strong>. <em>The callback does NOT run now.</em>`, { [timer.id]: "enter" }));

  out.push(sim.snapshot(`Even with 0ms delay, the host immediately moves the callback to the <strong>Task Queue</strong>. But the queue won't be checked until the call stack empties.`));
  sim.fireWebApi(timer.id);
  const taskB = sim.state.taskQueue[sim.state.taskQueue.length - 1];
  out.push(sim.snapshot(`Timer fired — callback now sits in the Task Queue, waiting.`, { [taskB.id]: "enter" }));

  sim.setLine(7);
  sim.log("C");
  out.push(sim.snapshot(`Line 7: <code class="inline">console.log("C")</code>. We're <em>still</em> inside the original task. Console: <strong>A, C</strong>.`));

  sim.pop();
  out.push(sim.snapshot(`Script frame pops. Stack is empty. <strong>Now</strong> the loop checks for microtasks (none) and picks the next task.`, { [main.id]: "leave" }));

  const next = sim.pickNextTask();
  if (next) {
    const cb = sim.push(next.label, 4);
    out.push(sim.snapshot(`The setTimeout callback is dequeued and pushed. We're at line 4.`, { [cb.id]: "enter" }));
    sim.log("B");
    out.push(sim.snapshot(`<code class="inline">console.log("B")</code> runs. Console: <strong>A, C, B</strong>.`));
    sim.pop();
    out.push(sim.snapshot(`Callback returns. Stack empty. Loop is idle. <strong>Output: A, C, B</strong> — never A, B, C.`, { [cb.id]: "leave" }));
  }

  return out;
})();

// =============================================================
// 5c — Promise.then ordering vs setTimeout (the classic interview puzzle)
// =============================================================
export const promiseVsTimeoutSteps: Step[] = (() => {
  const source = `console.log("1");

setTimeout(() => console.log("2"), 0);

Promise.resolve().then(() => console.log("3"));

console.log("4");`;
  resetIds();
  const sim = new EventLoopSimulator(source);
  const out: Step[] = [];

  out.push(sim.snapshot(`Predict the output before stepping. The answer reveals the rule: <strong>microtasks always run before the next task</strong>.`));

  const main = sim.push("(script)", 1);
  sim.log("1");
  out.push(sim.snapshot(`Line 1 logs <strong>1</strong>.`, { [main.id]: "enter" }));

  sim.setLine(3);
  const timer = sim.scheduleTimer(0, "() => log(2)");
  out.push(sim.snapshot(`Line 3: setTimeout schedules a Web API timer.`, { [timer.id]: "enter" }));
  sim.fireWebApi(timer.id);
  const t2 = sim.state.taskQueue[sim.state.taskQueue.length - 1];
  out.push(sim.snapshot(`Timer immediately fires (0ms). Callback parks in the <strong>Task Queue</strong>.`, { [t2.id]: "enter" }));

  sim.setLine(5);
  const m3 = sim.enqueueMicrotask("() => log(3)", "promise");
  out.push(sim.snapshot(`Line 5: <code class="inline">Promise.resolve().then(...)</code> registers a continuation. Because the promise is already resolved, the <code class="inline">.then</code> callback enters the <strong>Microtask Queue</strong> immediately.`, { [m3.id]: "enter" }));

  sim.setLine(7);
  sim.log("4");
  out.push(sim.snapshot(`Line 7 logs <strong>4</strong>. Console: <strong>1, 4</strong>. Stack still active — the script task hasn't finished.`));

  sim.pop();
  out.push(sim.snapshot(`Script task ends. Stack empty. <strong>Microtask checkpoint</strong> runs before any task is picked.`, { [main.id]: "leave" }));

  const mt = sim.pickNextMicrotask();
  if (mt) {
    const f = sim.push(mt.label, 5);
    sim.log("3");
    out.push(sim.snapshot(`Microtask drains: logs <strong>3</strong>. Console: <strong>1, 4, 3</strong>.`, { [f.id]: "enter" }));
    sim.pop();
  }
  out.push(sim.snapshot(`Microtask queue is empty. <em>Now</em> the loop picks the next task.`));

  const nt = sim.pickNextTask();
  if (nt) {
    const f = sim.push(nt.label, 3);
    sim.log("2");
    out.push(sim.snapshot(`Task callback runs: logs <strong>2</strong>. <strong>Final output: 1, 4, 3, 2.</strong>`, { [f.id]: "enter" }));
    sim.pop();
  }
  out.push(sim.snapshot(`<strong>The takeaway:</strong> microtasks (Promises, queueMicrotask) run before any subsequent task. <code class="inline">setTimeout(fn, 0)</code> always loses to a Promise that resolved during the same task.`));

  return out;
})();

// =============================================================
// 5d — async/await unfolding
// =============================================================
export const asyncAwaitSteps: Step[] = (() => {
  const source = `async function fetchUser() {
  console.log("before await");
  await Promise.resolve();
  console.log("after await");
}

console.log("start");
fetchUser();
console.log("end");`;
  resetIds();
  const sim = new EventLoopSimulator(source);
  const out: Step[] = [];

  out.push(sim.snapshot(`<code class="inline">async</code>/<code class="inline">await</code> is sugar over Promises. The compiler splits the function at each <code class="inline">await</code> into a microtask continuation.`));

  const main = sim.push("(script)", 7);
  sim.log("start");
  out.push(sim.snapshot(`Line 7 logs <strong>start</strong>.`, { [main.id]: "enter" }));

  sim.setLine(8);
  const fu = sim.push("fetchUser()", 1);
  out.push(sim.snapshot(`Line 8 invokes <code class="inline">fetchUser</code>. Frame pushed.`, { [fu.id]: "enter" }));

  sim.setLine(2);
  sim.log("before await");
  out.push(sim.snapshot(`Line 2: logs <strong>before await</strong>.`));

  sim.setLine(3);
  const m = sim.enqueueMicrotask("resume fetchUser at line 4", "await");
  out.push(sim.snapshot(`Line 3: <code class="inline">await Promise.resolve()</code>. The function <em>suspends</em>. The continuation (everything after the await) is enqueued as a microtask.`, { [m.id]: "enter" }));

  sim.pop();
  out.push(sim.snapshot(`<code class="inline">fetchUser</code> returns control to the caller. Critically — the function isn't done; it's suspended. Its frame is gone from the call stack.`, { [fu.id]: "leave" }));

  sim.setLine(9);
  sim.log("end");
  out.push(sim.snapshot(`Line 9 logs <strong>end</strong>. Console so far: <strong>start, before await, end</strong>. Notice we got "end" before "after await" — the function suspended.`));

  sim.pop();
  out.push(sim.snapshot(`Script task done. Microtask checkpoint runs.`, { [main.id]: "leave" }));

  const mt = sim.pickNextMicrotask();
  if (mt) {
    const f = sim.push("fetchUser (resumed)", 4);
    sim.log("after await");
    out.push(sim.snapshot(`The continuation runs. Line 4 logs <strong>after await</strong>. <strong>Final: start, before await, end, after await.</strong>`, { [f.id]: "enter" }));
    sim.pop();
  }

  return out;
})();

// =============================================================
// 5e — fetch + .then + setTimeout interleaving
// =============================================================
export const fetchInterleaveSteps: Step[] = (() => {
  const source = `console.log("a");

setTimeout(() => console.log("b"), 0);

fetch("/api")
  .then(() => console.log("c"));

console.log("d");`;
  resetIds();
  const sim = new EventLoopSimulator(source);
  const out: Step[] = [];

  out.push(sim.snapshot(`<code class="inline">fetch</code> returns a Promise. Its <code class="inline">.then</code> handler runs as a microtask <em>once the response settles</em>. That settlement happens in a Web API task.`));

  const main = sim.push("(script)", 1);
  sim.log("a");
  out.push(sim.snapshot(`Line 1 logs <strong>a</strong>.`, { [main.id]: "enter" }));

  sim.setLine(3);
  const t = sim.scheduleTimer(0, "() => log(b)");
  sim.fireWebApi(t.id);
  const taskB = sim.state.taskQueue[sim.state.taskQueue.length - 1];
  out.push(sim.snapshot(`Line 3: setTimeout 0ms — Web API → Task Queue.`, { [taskB.id]: "enter" }));

  sim.setLine(5);
  const f = sim.scheduleFetch("/api", "fetch /api");
  out.push(sim.snapshot(`Line 5: <code class="inline">fetch("/api")</code> hands off to the host. The Web API will resolve later (network round-trip). The promise is pending.`, { [f.id]: "enter" }));

  sim.setLine(8);
  sim.log("d");
  out.push(sim.snapshot(`Line 8 logs <strong>d</strong>. Stack non-empty; queues being filled but nothing's running yet.`));

  sim.pop();
  out.push(sim.snapshot(`Script task ends. No microtasks yet (fetch hasn't resolved). Loop picks next task.`, { [main.id]: "leave" }));

  const nt = sim.pickNextTask();
  if (nt) {
    const fr = sim.push(nt.label, 3);
    sim.log("b");
    out.push(sim.snapshot(`setTimeout task runs: logs <strong>b</strong>. Console: <strong>a, d, b</strong>.`, { [fr.id]: "enter" }));
    sim.pop();
  }

  out.push(sim.snapshot(`Some time later — say, 200ms — the network call completes. The host fires the fetch Web API: a task is enqueued that, on running, resolves the promise.`));

  sim.fireWebApi(f.id);
  const fetchTask = sim.state.taskQueue[sim.state.taskQueue.length - 1];
  out.push(sim.snapshot(`Fetch settled. Task is queued.`, { [fetchTask.id]: "enter" }));

  const ft = sim.pickNextTask();
  if (ft) {
    const fr = sim.push(ft.label, 5);
    out.push(sim.snapshot(`Task runs: it resolves the fetch Promise. The <code class="inline">.then</code> handler is enqueued as a microtask.`, { [fr.id]: "enter" }));
    sim.enqueueMicrotask("() => log(c)", "promise");
    sim.pop();
  }

  out.push(sim.snapshot(`Stack empty. Microtask checkpoint runs.`));
  const mt = sim.pickNextMicrotask();
  if (mt) {
    const fr = sim.push(mt.label, 6);
    sim.log("c");
    out.push(sim.snapshot(`<code class="inline">.then</code> callback logs <strong>c</strong>. <strong>Final: a, d, b, c.</strong>`, { [fr.id]: "enter" }));
    sim.pop();
  }
  out.push(sim.snapshot(`Even though <code class="inline">fetch</code> appeared <em>before</em> <code class="inline">setTimeout</code> in source, its handler ran <em>after</em> — because the network took longer than the 0ms timer.`));

  return out;
})();

// =============================================================
// 5f — Microtask starvation
// =============================================================
export const starvationSteps: Step[] = (() => {
  const source = `setTimeout(() => console.log("task"), 0);

function chain() {
  Promise.resolve().then(chain);
}
chain();`;
  resetIds();
  const sim = new EventLoopSimulator(source);
  const out: Step[] = [];

  out.push(sim.snapshot(`A pathological case: a microtask that always queues another microtask. The microtask queue never drains, so the next task — and any rendering — never gets a turn.`));

  const main = sim.push("(script)", 1);
  const timer = sim.scheduleTimer(0, "() => log(task)");
  sim.fireWebApi(timer.id);
  const taskT = sim.state.taskQueue[sim.state.taskQueue.length - 1];
  out.push(sim.snapshot(`Line 1: setTimeout 0ms — task queued and waiting.`, { [main.id]: "enter", [taskT.id]: "enter" }));

  sim.setLine(6);
  const ch = sim.push("chain()", 3);
  sim.setLine(4);
  const m1 = sim.enqueueMicrotask("chain (1)", "promise");
  out.push(sim.snapshot(`Line 6 calls <code class="inline">chain</code>. Inside <code class="inline">chain</code>, <code class="inline">Promise.resolve().then(chain)</code> queues a microtask that itself calls <code class="inline">chain</code>.`, { [ch.id]: "enter", [m1.id]: "enter" }));
  sim.pop();

  sim.pop();
  out.push(sim.snapshot(`Script ends. Stack empty. <strong>Microtask checkpoint</strong> begins.`, { [main.id]: "leave" }));

  let depth = 1;
  while (depth <= 3) {
    const next = sim.pickNextMicrotask();
    if (!next) break;
    const fr = sim.push(next.label, 4);
    sim.enqueueMicrotask("chain (" + (depth + 1) + ")", "promise");
    out.push(sim.snapshot(`Microtask <strong>chain (${depth})</strong> runs. It queues <strong>chain (${depth + 1})</strong>. <em>The microtask queue is never empty.</em>`, { [fr.id]: "enter" }));
    sim.pop();
    depth += 1;
  }

  out.push(sim.snapshot(`This loop continues forever. The setTimeout task <em>never gets to run</em>. The browser never paints. The page becomes unresponsive.`));
  out.push(sim.snapshot(`<strong>The lesson:</strong> recursive microtask chains starve the loop. <code class="inline">queueMicrotask</code> and <code class="inline">.then</code> callbacks are dangerous in tight loops; for cooperative scheduling, use <code class="inline">setTimeout(0)</code> (a task) or <code class="inline">requestIdleCallback</code>.`));

  return out;
})();
