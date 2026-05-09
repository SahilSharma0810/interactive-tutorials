// Playground instrumenter: takes user JS source, runs it inside a sandboxed
// Function with shadowed globals that record intent into a TraceEvent[].
// Then converts the trace into Step[] via the simulator.

import {
  EventLoopSimulator,
  resetIds,
  type Step,
  type TraceEvent,
} from "./simulator";

// ---------- Recording shadows ---------------------------------------------

type Recording = TraceEvent[];

function makeShadows(rec: Recording) {
  // Line tracking: we wrap the user code with `__line(N)` markers between
  // statements (see `wrapAndCount` below) and the user code calls __line()
  // when it crosses a line. This is a simple approximation of source line
  // tracking without a real parser.
  let _line = 0;
  const __line = (n: number) => {
    _line = n;
  };

  const console = {
    log: (...args: any[]) => {
      rec.push({
        op: "log",
        args: args.map((a) => String(a)),
        line: _line,
      });
    },
  };

  const setTimeoutShim = (fn: () => void, ms: number) => {
    rec.push({
      op: "setTimeout",
      ms,
      line: _line,
      bodyLabel: describeFn(fn),
    });
    // Defer the call — we don't actually run user fn here, simulator handles it.
  };

  const queueMicrotaskShim = (fn: () => void) => {
    rec.push({
      op: "queueMicrotask",
      line: _line,
      bodyLabel: describeFn(fn),
    });
  };

  // Promise shim: a real Promise subclass that records .then registrations.
  // We do NOT delegate to super.then — user callback bodies are described in
  // the trace, never executed. This keeps the recording fully synchronous,
  // matches the behavior of the setTimeout/queueMicrotask shadows, and prevents
  // microtasks from leaking past runUserCode's return.
  class TracedPromise<T> extends Promise<T> {
    then<U, V>(
      onFulfilled?: ((v: T) => U | PromiseLike<U>) | null,
      onRejected?: ((r: any) => V | PromiseLike<V>) | null
    ): Promise<U | V> {
      if (onFulfilled) {
        rec.push({
          op: "thenChain",
          line: _line,
          bodyLabel: ".then(" + describeFn(onFulfilled) + ")",
        });
      }
      if (onRejected) {
        rec.push({
          op: "thenChain",
          line: _line,
          bodyLabel: ".catch(" + describeFn(onRejected) + ")",
        });
      }
      // Return a resolved TracedPromise — chained .then/.catch calls go through
      // this same overridden method, so they're recorded too.
      return TracedPromise.resolve(undefined as unknown as U);
    }
  }

  const fetchShim = (url: string) => {
    rec.push({
      op: "fetch",
      url,
      line: _line,
      resolveLabel: "fetch(" + url + ")",
    });
    return TracedPromise.resolve({ ok: true, json: () => ({}) });
  };

  const requestAnimationFrameShim = (fn: () => void) => {
    rec.push({
      op: "raf",
      line: _line,
      bodyLabel: "raf(" + describeFn(fn) + ")",
    });
  };

  return {
    __line,
    console,
    setTimeout: setTimeoutShim,
    setInterval: setTimeoutShim, // good enough for v1
    clearTimeout: () => {},
    clearInterval: () => {},
    queueMicrotask: queueMicrotaskShim,
    Promise: TracedPromise,
    fetch: fetchShim,
    requestAnimationFrame: requestAnimationFrameShim,
  };
}

function describeFn(fn: any): string {
  try {
    let src = String(fn);
    // Strip our injected line markers from the displayed source.
    src = src.replace(/__line\(\d+\);\s*/g, "");
    // Collapse runs of whitespace (including newlines).
    src = src.replace(/\s+/g, " ").trim();
    if (src.length < 60) return src;
    return src.slice(0, 57) + "...";
  } catch {
    return "<fn>";
  }
}

// ---------- Wrap user source with line markers ----------------------------

/**
 * Prepends `__line(N);` before each non-empty source line. Crude but
 * sufficient for the supported subset (no JSX, no inline ASI gotchas).
 */
function wrapWithLineMarkers(src: string): string {
  return src
    .split("\n")
    .map((line, i) => {
      const lineNum = i + 1;
      if (/^\s*(\/\/|\/\*|\*|[\)\}\].]|$)/.test(line)) return line;
      return `__line(${lineNum}); ${line}`;
    })
    .join("\n");
}

// ---------- Public API ----------------------------------------------------

export type RunResult =
  | { ok: true; steps: Step[] }
  | { ok: false; error: string };

export function runUserCode(source: string): RunResult {
  const rec: Recording = [];
  const shadows = makeShadows(rec);
  const wrapped = wrapWithLineMarkers(source);

  // Build a Function with shadow names as parameters.
  // Top-level await is supported by wrapping in async IIFE.
  const body = `
    "use strict";
    return (async () => {
      ${wrapped}
    })();
  `;

  let fn: Function;
  try {
    fn = new Function(
      "__line",
      "console",
      "setTimeout",
      "setInterval",
      "clearTimeout",
      "clearInterval",
      "queueMicrotask",
      "Promise",
      "fetch",
      "requestAnimationFrame",
      body
    );
  } catch (e: any) {
    return { ok: false, error: "Parse error: " + (e?.message ?? e) };
  }

  try {
    const promise = fn(
      shadows.__line,
      shadows.console,
      shadows.setTimeout,
      shadows.setInterval,
      shadows.clearTimeout,
      shadows.clearInterval,
      shadows.queueMicrotask,
      shadows.Promise,
      shadows.fetch,
      shadows.requestAnimationFrame
    );
    // Wait for the wrapped IIFE — but synchronously is impossible. Trick:
    // since all our shadows are synchronous-recording (they don't actually
    // do async work), the inner async IIFE resolves on the next microtask.
    // For the playground v1 we accept this: the user must click "Run" and
    // we return the trace from the synchronously-recorded portion.
    // Top-level awaits resolve on next microtask too — but TracedPromise
    // records the .then immediately, so the trace is captured.
    void promise;
  } catch (e: any) {
    return { ok: false, error: "Runtime error: " + (e?.message ?? e) };
  }

  const steps = tracesToSteps(rec, source);
  return { ok: true, steps };
}

// ---------- tracesToSteps -------------------------------------------------

export function tracesToSteps(trace: TraceEvent[], source: string): Step[] {
  resetIds();
  const sim = new EventLoopSimulator(source);
  const out: Step[] = [];

  out.push(sim.snapshot(`Initial state — script about to run.`));

  const main = sim.push("(script)", trace[0]?.line ?? 1);
  out.push(
    sim.snapshot(
      `Script enters the call stack as a single task.`,
      { [main.id]: "enter" }
    )
  );

  // Walk the trace, mutating sim state and snapshotting after each event.
  for (const ev of trace) {
    sim.setLine(ev.line);
    if (ev.op === "log") {
      for (const a of ev.args) sim.log(a);
      out.push(
        sim.snapshot(
          `Line ${ev.line}: <code class="inline">console.log(${ev.args.join(", ")})</code>.`
        )
      );
    } else if (ev.op === "setTimeout") {
      const w = sim.scheduleTimer(ev.ms, ev.bodyLabel);
      out.push(
        sim.snapshot(
          `Line ${ev.line}: setTimeout (${ev.ms}ms) parked in Web APIs.`,
          { [w.id]: "enter" }
        )
      );
      // Immediate fire for ms=0; otherwise still fire (simulated time)
      sim.fireWebApi(w.id);
      const t = sim.state.taskQueue[sim.state.taskQueue.length - 1];
      out.push(
        sim.snapshot(
          `Timer fired — moved to Task Queue.`,
          { [t.id]: "enter" }
        )
      );
    } else if (ev.op === "queueMicrotask") {
      const m = sim.enqueueMicrotask(ev.bodyLabel, "queueMicrotask");
      out.push(
        sim.snapshot(
          `Line ${ev.line}: <code class="inline">queueMicrotask(...)</code>.`,
          { [m.id]: "enter" }
        )
      );
    } else if (ev.op === "thenChain") {
      const m = sim.enqueueMicrotask(ev.bodyLabel, "promise");
      out.push(
        sim.snapshot(
          `Line ${ev.line}: <code class="inline">.then</code> registered. Microtask queued (resolved promise).`,
          { [m.id]: "enter" }
        )
      );
    } else if (ev.op === "fetch") {
      const w = sim.scheduleFetch(ev.url, ev.resolveLabel);
      out.push(
        sim.snapshot(
          `Line ${ev.line}: <code class="inline">fetch(${ev.url})</code> parked in Web APIs.`,
          { [w.id]: "enter" }
        )
      );
    } else if (ev.op === "raf") {
      const w = sim.scheduleRaf(ev.bodyLabel);
      out.push(
        sim.snapshot(
          `Line ${ev.line}: <code class="inline">requestAnimationFrame(...)</code> parked.`,
          { [w.id]: "enter" }
        )
      );
    } else if (ev.op === "awaitPoint") {
      const m = sim.enqueueMicrotask(ev.resumeLabel, "await");
      out.push(
        sim.snapshot(
          `Line ${ev.line}: <code class="inline">await</code> suspends; continuation queued as microtask.`,
          { [m.id]: "enter" }
        )
      );
    }
  }

  // Script ends.
  sim.pop();
  out.push(
    sim.snapshot(
      `Script task ends. Stack empty. Microtask checkpoint runs.`,
      { [main.id]: "leave" }
    )
  );

  // Drain microtasks.
  while (sim.state.microtaskQueue.length > 0) {
    const m = sim.pickNextMicrotask();
    if (!m) break;
    const f = sim.push(m.label);
    out.push(
      sim.snapshot(
        `Microtask <code class="inline">${escapeHtml(m.label)}</code> runs.`,
        { [f.id]: "enter" }
      )
    );
    sim.pop();
  }

  // Drain task queue (one task at a time + microtask drain after).
  while (sim.state.taskQueue.length > 0) {
    const t = sim.pickNextTask();
    if (!t) break;
    const f = sim.push(t.label);
    out.push(
      sim.snapshot(
        `Task <code class="inline">${escapeHtml(t.label)}</code> runs.`,
        { [f.id]: "enter" }
      )
    );
    sim.pop();
    while (sim.state.microtaskQueue.length > 0) {
      const m = sim.pickNextMicrotask();
      if (!m) break;
      const fm = sim.push(m.label);
      out.push(
        sim.snapshot(
          `Microtask <code class="inline">${escapeHtml(m.label)}</code> runs.`,
          { [fm.id]: "enter" }
        )
      );
      sim.pop();
    }
  }

  sim.setPhase("idle");
  out.push(sim.snapshot(`All queues empty. Loop is idle.`));
  return out;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"]/g, (c) =>
    c === "&" ? "&amp;" : c === "<" ? "&lt;" : c === ">" ? "&gt;" : "&quot;"
  );
}
