"use client";

import React, { useState } from "react";
import TutorialShell from "@/components/TutorialShell";
import { meta } from "./meta";
import EventLoopWalkthrough from "@/components/EventLoopWalkthrough";
import RuntimeAnatomy from "@/components/RuntimeAnatomy";
import PriorityRace from "@/components/PriorityRace";
import Quiz, { QuizQuestion } from "@/components/Quiz";
import EventLoopPlayground from "@/components/EventLoopPlayground";
import {
  syncOnlySteps,
  setTimeoutZeroSteps,
  promiseVsTimeoutSteps,
  asyncAwaitSteps,
  fetchInterleaveSteps,
  starvationSteps,
} from "./steps";

const SCENARIOS = [
  { key: "sync",      label: "Sync only",          steps: syncOnlySteps },
  { key: "timer0",    label: "setTimeout(0)",      steps: setTimeoutZeroSteps },
  { key: "promise",   label: "Promise vs timer",   steps: promiseVsTimeoutSteps },
  { key: "await",     label: "async/await",        steps: asyncAwaitSteps },
  { key: "fetch",     label: "fetch + timer",      steps: fetchInterleaveSteps },
  { key: "starve",    label: "Starvation",         steps: starvationSteps },
] as const;

type ScenarioKey = typeof SCENARIOS[number]["key"];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    q: "What does the spec guarantee about microtask ordering relative to a single task?",
    options: [
      "Microtasks may interleave with tasks freely",
      "After each task, the entire microtask queue drains before the next task or render",
      "Microtasks run only at the start of each event loop iteration",
      "<code class='inline'>setTimeout(0)</code> callbacks count as microtasks",
    ],
    correct: 1,
    explain:
      "The HTML spec mandates that after a task completes (and the call stack empties), the microtask checkpoint drains the queue completely — including microtasks queued during draining — before any next task or rendering opportunity.",
  },
  {
    q: "What is the output of: <code class='inline'>console.log(1); setTimeout(()=>console.log(2),0); Promise.resolve().then(()=>console.log(3)); console.log(4);</code>",
    options: ["1 2 3 4", "1 4 3 2", "1 4 2 3", "1 3 4 2"],
    correct: 1,
    explain:
      "Synchronous code runs first: <strong>1, 4</strong>. Then the microtask checkpoint drains: <strong>3</strong>. Then the loop picks the next task (the timer): <strong>2</strong>. Final order: 1, 4, 3, 2.",
  },
  {
    q: "An <code class='inline'>async</code> function pauses at <code class='inline'>await x</code>. Where does the continuation (the code after await) end up?",
    options: [
      "On the call stack, immediately resumed",
      "In the task queue",
      "In the microtask queue, scheduled when <code class='inline'>x</code> settles",
      "Discarded — await throws if the promise isn't already resolved",
    ],
    correct: 2,
    explain:
      "<code class='inline'>await</code> is sugar for <code class='inline'>.then</code>. The continuation becomes a microtask that runs when the awaited promise settles. The function frame leaves the stack at the await point.",
  },
  {
    q: "What's the relationship between <code class='inline'>requestAnimationFrame</code> callbacks and the microtask queue?",
    options: [
      "rAF callbacks are microtasks — they run between every task",
      "rAF callbacks run as part of the rendering step, after microtasks have drained",
      "rAF callbacks run before microtasks each tick",
      "They run at the same priority and may interleave",
    ],
    correct: 1,
    explain:
      "The rendering step happens after microtasks drain. rAF callbacks fire <em>during</em> the rendering opportunity, just before style/layout/paint — never interleaved with microtasks.",
  },
  {
    q: "A microtask schedules another microtask before it returns. When does the new microtask run?",
    options: [
      "On the next event loop iteration",
      "After the next task completes",
      "Immediately, in the same microtask drain",
      "It throws — you can't queue a microtask from a microtask",
    ],
    correct: 2,
    explain:
      "Microtasks queued during a drain are appended to the same drain. This is exactly why infinite microtask chains (a microtask that always queues another) starve the loop and prevent rendering.",
  },
  {
    q: "In Node.js, when does <code class='inline'>process.nextTick(fn)</code> run relative to a Promise's <code class='inline'>.then</code> handler?",
    options: [
      "<code class='inline'>nextTick</code> runs after Promise microtasks",
      "<code class='inline'>nextTick</code> runs <em>before</em> Promise microtasks — it has higher priority",
      "Both queues drain together in registration order",
      "<code class='inline'>nextTick</code> runs only between phases, not after individual operations",
    ],
    correct: 1,
    explain:
      "Node drains the <code class='inline'>nextTick</code> queue before the microtask queue between every operation. This makes <code class='inline'>process.nextTick</code> the highest-priority callback in Node — and a footgun if abused.",
  },
  {
    q: "Why does a 200ms synchronous loop block animation, even if you call <code class='inline'>requestAnimationFrame</code> inside it?",
    options: [
      "rAF callbacks don't fire when the page is in focus",
      "The loop is one task; the rendering step (and rAF callbacks) can only happen between tasks",
      "rAF is throttled to 60fps maximum",
      "You'd need to also call <code class='inline'>setTimeout(0)</code> alongside it",
    ],
    correct: 1,
    explain:
      "Tasks run to completion. Rendering — including rAF callbacks and paint — only happens between tasks. A long-running synchronous task blocks every render opportunity until it finishes. This is why frame-budget-aware code chunks work with <code class='inline'>setTimeout(0)</code> or <code class='inline'>scheduler.postTask</code>.",
  },
];

export default function EventLoopTutorial() {
  const [scenario, setScenario] = useState<ScenarioKey>(SCENARIOS[0].key);
  const active = SCENARIOS.find((s) => s.key === scenario)!;

  return (
    <TutorialShell meta={meta}>
      <main id="main">
        {/* HERO */}
        <section className="section hero">
          <div className="hero-badge">
            <span className="num">02</span> An interactive lesson
          </div>
          <h1>
            The JavaScript Event Loop, told through{" "}
            <span className="ital">Stacks &amp; Queues.</span>
          </h1>
          <p className="lede" style={{ marginTop: 28 }}>
            JavaScript is single-threaded. And yet it handles network requests,
            timers, animations, and user input <em>concurrently</em>. The trick
            is the event loop — a small algorithm that orchestrates the call
            stack, the host environment, and two queues. Build the model from
            scratch, step through the canonical scenarios, then run your own
            code through it.
          </p>
          <div className="hero-meta">
            <span>~ 30 min read</span>
            <span>6 step-through scenarios</span>
            <span>1 code playground</span>
            <span>7 quiz questions</span>
          </div>
        </section>

        {/* CHAPTER 1 — single thread */}
        <section className="section" id="single-thread" data-chapter-id="single-thread">
          <div className="eyebrow">Chapter 1 · The constraint</div>
          <h2>One <em>thread,</em> one stack.</h2>
          <p className="lede">
            JavaScript runs on exactly one thread. There is exactly one call
            stack. Two functions cannot run at the same time. Anything else you
            see — fetch, setTimeout, animations — is delegation.
          </p>
          <div className="grid-2" style={{ marginTop: 36 }}>
            <div>
              <p>
                When the engine runs <code className="inline">f()</code>, it
                pushes a frame for <code className="inline">f</code> onto the
                call stack. If <code className="inline">f</code> calls{" "}
                <code className="inline">g</code>,{" "}
                <code className="inline">g</code>'s frame goes on top. When{" "}
                <code className="inline">g</code> returns, its frame pops. When{" "}
                <code className="inline">f</code> returns, the stack is empty
                — the engine has nothing to do.
              </p>
              <p>
                <strong>Crucially</strong>, while a frame is on the stack,{" "}
                <em>nothing else can run</em>. Not your click handler, not
                a timer callback, not a Promise resolution. They wait.
              </p>
              <div className="analogy">
                "If you write <code className="inline">while(true){`{}`}</code>,
                the page is dead. No paint, no input. The stack is jammed and
                the loop is starved."
                <span className="who">— a useful debugging instinct</span>
              </div>
            </div>
            <div className="card">
              <h4 style={{ fontFamily: "var(--mono)", fontSize: 12,
                          textTransform: "uppercase", letterSpacing: ".12em",
                          color: "var(--muted)", fontWeight: 500 }}>
                Synchronous trace
              </h4>
              <pre className="code" style={{ marginTop: 14 }}>
{`function greet(name) {
  console.log("hi, " + name);
}

console.log("start");
greet("world");
console.log("end");`}
              </pre>
              <p style={{ marginTop: 14, fontSize: 14, color: "var(--ink-2)" }}>
                Output: <code className="inline">start</code>,{" "}
                <code className="inline">hi, world</code>,{" "}
                <code className="inline">end</code>. No surprises — yet.
              </p>
            </div>
          </div>
        </section>

        {/* CHAPTER 2 — runtime model */}
        <section className="section" id="runtime" data-chapter-id="runtime">
          <div className="eyebrow">Chapter 2 · The cast of characters</div>
          <h2>The <em>runtime</em> model.</h2>
          <p className="lede">
            The engine (V8, SpiderMonkey, JavaScriptCore) is just the part that
            executes JS — call stack, heap. The async machinery — timers,
            network, the loop itself — lives in the <em>host environment</em>.
            In a browser, that's the browser. In Node, it's libuv.
          </p>

          <div style={{ marginTop: 32, padding: 24,
                        background: "var(--paper)",
                        border: "1px solid var(--line)",
                        borderRadius: 6, overflowX: "auto" }}>
            <RuntimeAnatomy />
          </div>

          <div className="grid-2" style={{ marginTop: 32 }}>
            <div className="concept-box">
              <h4>The four boxes you must know</h4>
              <p>
                <strong>Call Stack</strong> — current frames. LIFO.<br />
                <strong>Web APIs</strong> — host-managed pending work
                (timers, fetches, DOM events).<br />
                <strong>Task Queue</strong> — callbacks waiting to run as a
                fresh task. FIFO.<br />
                <strong>Microtask Queue</strong> — Promise continuations,{" "}
                <code className="inline">queueMicrotask</code> callbacks.
                Special: drains fully every tick.
              </p>
            </div>
            <div className="concept-box">
              <h4>What the engine actually owns</h4>
              <p>
                Only the call stack and the heap. Everything else — including
                "the event loop" — is provided by the host. That's why
                <code className="inline"> setTimeout</code> isn't part of the
                language spec; it's a Web API.
              </p>
            </div>
          </div>
        </section>

        {/* CHAPTER 3 — loop algorithm */}
        <section className="section" id="loop-algo" data-chapter-id="loop-algo">
          <div className="eyebrow">Chapter 3 · The algorithm</div>
          <h2>The loop, in <em>twelve lines.</em></h2>
          <p className="lede">
            Once you've internalized this pseudocode, every async behavior in
            JavaScript becomes deducible.
          </p>
          <pre className="code" style={{ marginTop: 26 }}>
{`while (true) {
  // 1. Pick one task
  task = taskQueue.shift();
  if (task) {
    push(task);            // call stack receives a frame
    while (stack.nonEmpty()) execute();   // run to completion
  }

  // 2. Drain microtasks (FULLY — including new ones queued during draining)
  while (microtaskQueue.nonEmpty()) {
    push(microtaskQueue.shift());
    while (stack.nonEmpty()) execute();
  }

  // 3. Maybe render (browser decides — typically ~once per 16ms)
  if (shouldRender()) paint();
}`}
          </pre>
          <div className="concept-box" style={{ marginTop: 22 }}>
            <h4>The three rules that explain everything</h4>
            <p>
              <strong>1.</strong> A task runs to completion before any other
              task. No preemption.<br />
              <strong>2.</strong> The microtask queue drains fully after every
              task and before the next task or paint.<br />
              <strong>3.</strong> Microtasks queued <em>during</em> the drain
              run in the same drain. (This is how starvation is possible.)
            </p>
          </div>
        </section>

        {/* CHAPTER 4 — priority */}
        <section className="section" id="priority" data-chapter-id="priority">
          <div className="eyebrow">Chapter 4 · The ordering rule</div>
          <h2>Microtasks &gt; <em>Tasks.</em></h2>
          <p className="lede">
            The single rule that surprises people most: the microtask queue
            drains <em>completely</em> after every task — before the next task
            and before any rendering. Promises, <code className="inline">queueMicrotask</code>,
            and <code className="inline">await</code> continuations all use it.
          </p>
          <div style={{ marginTop: 32 }}>
            <PriorityRace />
          </div>
        </section>

        {/* CHAPTER 5 — scenarios */}
        <section className="section" id="scenarios" data-chapter-id="scenarios">
          <div className="eyebrow">Chapter 5 · The canonical traces</div>
          <h2>Step through, <em>frame by frame.</em></h2>
          <p className="lede">
            Pick a scenario. Step forward and back. The narration explains what
            each move corresponds to in the loop algorithm.
          </p>

          <div style={{ marginTop: 28 }}>
            <div className="tabs">
              {SCENARIOS.map((s) => (
                <button
                  key={s.key}
                  className={"tab" + (scenario === s.key ? " active" : "")}
                  onClick={() => setScenario(s.key)}
                >
                  {s.label}
                </button>
              ))}
            </div>
            <div style={{ marginTop: 18 }}>
              <EventLoopWalkthrough steps={active.steps} />
            </div>
          </div>
        </section>

        {/* CHAPTER 6 — rendering */}
        <section className="section" id="rendering" data-chapter-id="rendering">
          <div className="eyebrow">Chapter 6 · Where paint fits</div>
          <h2>Rendering &amp; <em>requestAnimationFrame.</em></h2>
          <p className="lede">
            The browser tries to paint roughly every 16ms (60fps). Paint can
            only happen <em>between tasks</em> — not while one is executing.
            That's why a 200ms synchronous loop blocks the frame.
          </p>
          <div className="grid-2" style={{ marginTop: 32 }}>
            <div className="concept-box">
              <h4>The render slot</h4>
              <p>
                After a task completes and microtasks drain, the loop checks
                whether it's time to paint. If yes, it runs all queued{" "}
                <code className="inline">requestAnimationFrame</code> callbacks
                first (so JS can mutate the DOM right before paint), then
                style → layout → paint, then back to picking the next task.
              </p>
            </div>
            <div className="concept-box">
              <h4>Why it matters</h4>
              <p>
                <strong>Long synchronous task = dropped frame.</strong> If your
                click handler runs for 50ms, the user feels it. The fix is to
                break work into chunks (each its own task via{" "}
                <code className="inline">setTimeout(0)</code> or{" "}
                <code className="inline">scheduler.postTask</code>) so the loop
                gets a chance to paint between them.
              </p>
            </div>
          </div>
          <div className="concept-box" style={{ marginTop: 28 }}>
            <h4>rAF vs setTimeout vs microtask</h4>
            <p>
              <code className="inline">requestAnimationFrame(fn)</code> runs{" "}
              <em>just before</em> paint — perfect for visual updates that
              should be coherent with the next frame. <code className="inline">setTimeout(fn, 0)</code>{" "}
              runs as a future task and may or may not get to run before the
              next paint. A microtask runs between this task and the next, so
              it always blocks the very next render.
            </p>
          </div>
        </section>

        {/* CHAPTER 7 — Node */}
        <section className="section" id="node" data-chapter-id="node">
          <div className="eyebrow">Chapter 7 · The other runtime</div>
          <h2>Node.js — same idea, <em>more phases.</em></h2>
          <p className="lede">
            Node uses libuv, which structures the loop into ordered <em>phases</em>.
            The browser model is a special case of this; if you understand the
            browser model, the Node phases are an extension, not a contradiction.
          </p>

          <div className="card" style={{ marginTop: 28 }}>
            <h4>Phases of a Node tick</h4>
            <ol style={{ marginTop: 12, paddingLeft: 22, fontSize: 16,
                         lineHeight: 1.8 }}>
              <li><strong>Timers</strong> — callbacks for{" "}
                  <code className="inline">setTimeout</code> /{" "}
                  <code className="inline">setInterval</code> whose time has elapsed</li>
              <li><strong>Pending callbacks</strong> — deferred system errors</li>
              <li><strong>Idle, prepare</strong> — internal</li>
              <li><strong>Poll</strong> — retrieve new I/O events; execute their callbacks (this is where most async work runs)</li>
              <li><strong>Check</strong> — <code className="inline">setImmediate</code> callbacks</li>
              <li><strong>Close callbacks</strong> — e.g. <code className="inline">socket.on('close', ...)</code></li>
            </ol>
            <hr style={{ border: "none", borderTop: "1px solid var(--line)",
                         margin: "20px 0" }} />
            <p style={{ margin: 0, fontSize: 16 }}>
              <strong>Two queues drain between every phase:</strong> the
              <code className="inline"> process.nextTick</code> queue first
              (highest priority — even higher than microtasks), then the
              microtask queue.
            </p>
          </div>

          <div className="concept-box" style={{ marginTop: 28 }}>
            <h4>The classic Node puzzle</h4>
            <p>
              <code className="inline">setTimeout(fn, 0)</code> vs{" "}
              <code className="inline">setImmediate(fn)</code>: in the main
              module their order is non-deterministic (depends on whether the
              loop has already entered the timers phase). But if both are
              scheduled inside an I/O callback, <code className="inline">setImmediate</code>{" "}
              always wins — because the loop is in the poll phase and will
              reach <em>check</em> (setImmediate) before circling back to{" "}
              <em>timers</em>.
            </p>
          </div>
        </section>

        {/* CHAPTER 8 — playground */}
        <section className="section" id="playground" data-chapter-id="playground">
          <div className="eyebrow">Chapter 8 · Free play</div>
          <h2>The Event Loop <em>Sandbox.</em></h2>
          <p className="lede">
            Type code, click Run, step through. The sandbox traces a useful
            subset of async APIs — supported features are listed below.
          </p>
          <div style={{ marginTop: 32 }}>
            <EventLoopPlayground />
          </div>
        </section>

        {/* CHAPTER 9 — quiz */}
        <section className="section" id="quiz" data-chapter-id="quiz">
          <div className="eyebrow">Chapter 9 · Test yourself</div>
          <h2>Check your <em>understanding.</em></h2>
          <p className="lede">
            Seven questions, written for an interview-grade reader. Pick an
            answer to see the explanation.
          </p>
          <div style={{ marginTop: 36 }}>
            <Quiz questions={QUIZ_QUESTIONS} />
          </div>
        </section>
      </main>

      <footer>
        <div className="ornament">— fin —</div>
        <p>
          An interactive lesson on the JavaScript event loop.<br />
          Built for hands, eyes, and intuition.
        </p>
      </footer>
    </TutorialShell>
  );
}
