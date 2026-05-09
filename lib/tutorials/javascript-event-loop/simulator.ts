// Pure event-loop simulator. No React, no DOM. Used by both the hand-authored
// scenarios in steps.ts AND the playground's instrumented runner.

export type Frame = { id: string; label: string; line?: number };

export type WebApi =
  | { id: string; kind: "timer"; ms: number; label: string }
  | { id: string; kind: "fetch"; url: string; label: string }
  | { id: string; kind: "raf"; label: string };

export type Task = {
  id: string;
  label: string;
  source: "timer" | "fetch" | "raf" | "task";
};

export type Microtask = {
  id: string;
  label: string;
  source: "promise" | "queueMicrotask" | "await";
};

export type Phase =
  | "idle"
  | "running-task"
  | "drain-microtasks"
  | "render"
  | "pick-next-task";

export type SimulatorState = {
  stack: Frame[];
  webApis: WebApi[];
  taskQueue: Task[];
  microtaskQueue: Microtask[];
  phase: Phase;
  currentLine?: number;
  consoleLog: string[];
};

export type ClassMap = Record<
  string,
  "enter" | "leave" | "compare" | "target" | undefined
>;

export type Step = {
  state: SimulatorState;
  classes?: ClassMap;
  narration: string;
  source: string;
};

let _idSeq = 0;
function nextId(prefix: string): string {
  _idSeq += 1;
  return `${prefix}_${_idSeq}`;
}

/** Reset the id sequence — useful at the top of each scenario for stable ids. */
export function resetIds(): void {
  _idSeq = 0;
}

export class EventLoopSimulator {
  state: SimulatorState;
  source: string;

  constructor(source: string) {
    this.source = source;
    this.state = {
      stack: [],
      webApis: [],
      taskQueue: [],
      microtaskQueue: [],
      phase: "idle",
      consoleLog: [],
    };
  }

  // ----- mutation primitives --------------------------------------------

  push(label: string, line?: number): Frame {
    const f: Frame = { id: nextId("f"), label, line };
    this.state.stack.push(f);
    this.state.currentLine = line;
    this.state.phase = "running-task";
    return f;
  }

  pop(): Frame | undefined {
    const f = this.state.stack.pop();
    const top = this.state.stack[this.state.stack.length - 1];
    this.state.currentLine = top?.line;
    if (this.state.stack.length === 0) this.state.phase = "idle";
    return f;
  }

  scheduleTimer(ms: number, label: string): WebApi {
    const w: WebApi = { id: nextId("w"), kind: "timer", ms, label };
    this.state.webApis.push(w);
    return w;
  }

  scheduleFetch(url: string, label: string): WebApi {
    const w: WebApi = { id: nextId("w"), kind: "fetch", url, label };
    this.state.webApis.push(w);
    return w;
  }

  scheduleRaf(label: string): WebApi {
    const w: WebApi = { id: nextId("w"), kind: "raf", label };
    this.state.webApis.push(w);
    return w;
  }

  /** Move a Web API entry to the task queue (timer fires, fetch resolves). */
  fireWebApi(id: string): Task | undefined {
    const idx = this.state.webApis.findIndex((w) => w.id === id);
    if (idx < 0) return undefined;
    const w = this.state.webApis[idx];
    this.state.webApis.splice(idx, 1);
    const t: Task = {
      id: nextId("t"),
      label: w.label,
      source: w.kind === "timer" ? "timer" : w.kind === "fetch" ? "fetch" : "raf",
    };
    this.state.taskQueue.push(t);
    return t;
  }

  enqueueTask(label: string, source: Task["source"] = "task"): Task {
    const t: Task = { id: nextId("t"), label, source };
    this.state.taskQueue.push(t);
    return t;
  }

  enqueueMicrotask(
    label: string,
    source: Microtask["source"] = "promise"
  ): Microtask {
    const m: Microtask = { id: nextId("m"), label, source };
    this.state.microtaskQueue.push(m);
    return m;
  }

  /** Pop the next task; returns undefined if queue empty. */
  pickNextTask(): Task | undefined {
    this.state.phase = "pick-next-task";
    return this.state.taskQueue.shift();
  }

  /** Pop the next microtask; returns undefined if queue empty. */
  pickNextMicrotask(): Microtask | undefined {
    this.state.phase = "drain-microtasks";
    return this.state.microtaskQueue.shift();
  }

  log(s: string): void {
    this.state.consoleLog.push(s);
  }

  setPhase(p: Phase): void {
    this.state.phase = p;
  }

  setLine(line: number | undefined): void {
    this.state.currentLine = line;
  }

  /** Take a deep-copied snapshot for a Step. */
  snapshot(narration: string, classes?: ClassMap): Step {
    return {
      state: {
        stack: this.state.stack.map((f) => ({ ...f })),
        webApis: this.state.webApis.map((w) => ({ ...w })),
        taskQueue: this.state.taskQueue.map((t) => ({ ...t })),
        microtaskQueue: this.state.microtaskQueue.map((m) => ({ ...m })),
        phase: this.state.phase,
        currentLine: this.state.currentLine,
        consoleLog: [...this.state.consoleLog],
      },
      classes: classes ? { ...classes } : undefined,
      narration,
      source: this.source,
    };
  }
}

// ---------------------------------------------------------------------------
// tracesToSteps — used by the playground only.
// Definition deferred to a later task (instrumenter); here we declare the type
// alias so the public surface is stable.
// ---------------------------------------------------------------------------

export type TraceEvent =
  | { op: "log"; args: string[]; line: number }
  | { op: "setTimeout"; ms: number; line: number; bodyLabel: string }
  | { op: "queueMicrotask"; line: number; bodyLabel: string }
  | { op: "thenChain"; line: number; bodyLabel: string }
  | { op: "fetch"; url: string; line: number; resolveLabel: string }
  | { op: "awaitPoint"; line: number; resumeLabel: string }
  | { op: "raf"; line: number; bodyLabel: string };
