"use client";

import React, { useRef, useState } from "react";
import EventLoopWalkthrough from "./EventLoopWalkthrough";
import { runUserCode } from "@/lib/tutorials/javascript-event-loop/instrumenter";
import type { Step } from "@/lib/tutorials/javascript-event-loop/simulator";

const PRESETS: { label: string; code: string }[] = [
  {
    label: "Promise vs Timer",
    code: `console.log("1");
setTimeout(() => console.log("2"), 0);
Promise.resolve().then(() => console.log("3"));
console.log("4");`,
  },
  {
    label: ".then chain",
    code: `console.log("start");
Promise.resolve()
  .then(() => console.log("then-1"))
  .then(() => console.log("then-2"));
console.log("end");`,
  },
  {
    label: "fetch interleave",
    code: `console.log("a");
setTimeout(() => console.log("b"), 0);
fetch("/api").then(() => console.log("c"));
console.log("d");`,
  },
];

type Props = {
  /** Called the first time the user successfully runs code. */
  onFirstRun?: () => void;
};

export default function EventLoopPlayground({ onFirstRun }: Props = {}) {
  const [code, setCode] = useState<string>(PRESETS[0].code);
  const [steps, setSteps] = useState<Step[] | null>(null);
  const [error, setError] = useState<string | null>(null);

  const firedFirstRunRef = useRef(false);

  const onRun = () => {
    const result = runUserCode(code);
    if (result.ok) {
      setSteps(result.steps);
      setError(null);
      if (!firedFirstRunRef.current) {
        firedFirstRunRef.current = true;
        onFirstRun?.();
      }
    } else {
      setSteps(null);
      setError(result.error);
    }
  };

  const onPreset = (presetCode: string) => {
    setCode(presetCode);
    setSteps(null);
    setError(null);
  };

  return (
    <div>
      <div
        className="concept-box"
        style={{ marginBottom: 22, fontSize: 14 }}
      >
        <strong>Sandbox subset.</strong> Supported:{" "}
        <code className="inline">console.log</code>,{" "}
        <code className="inline">setTimeout</code>,{" "}
        <code className="inline">setInterval</code>,{" "}
        <code className="inline">Promise.resolve()/reject().then().catch()</code>
        ,{" "}
        <code className="inline">queueMicrotask</code>,{" "}
        <code className="inline">requestAnimationFrame</code>,{" "}
        <code className="inline">fetch(url)</code> (mocked). Other globals
        (DOM, XHR, generators, top-level <code className="inline">await</code>)
        are not modeled.
        <br />
        <br />
        <em>One important caveat:</em> the trace shows the{" "}
        <strong>scheduling</strong> of async work — not the execution of
        callback bodies. So <code className="inline">setTimeout(() =&gt; console.log("hi"), 0)</code>{" "}
        records the timer being parked and fired, but won&apos;t print{" "}
        <code className="inline">"hi"</code> to the Console panel. For the
        full output of canonical scenarios (including the bodies), see the
        hand-authored walkthroughs in Chapter 5.
      </div>

      <div className="el-playground">
        <div className="el-editor">
          <div className="controls" style={{ marginBottom: 10, gap: 8 }}>
            <span style={{ fontFamily: "var(--mono)", fontSize: 11,
                           color: "var(--muted)", textTransform: "uppercase",
                           letterSpacing: ".1em", marginRight: 6 }}>
              Presets
            </span>
            {PRESETS.map((p) => (
              <button
                key={p.label}
                className="btn small ghost"
                onClick={() => onPreset(p.code)}
              >
                {p.label}
              </button>
            ))}
          </div>
          <textarea
            className="el-code-input"
            value={code}
            onChange={(e) => setCode(e.target.value)}
            spellCheck={false}
            rows={14}
          />
          <div className="controls" style={{ marginTop: 10 }}>
            <button className="btn primary" onClick={onRun}>
              ▶ Run &amp; trace
            </button>
            <button
              className="btn ghost"
              onClick={() => {
                setSteps(null);
                setError(null);
              }}
              disabled={steps === null && error === null}
            >
              Clear
            </button>
          </div>
        </div>

        {error && (
          <div
            className="concept-box"
            style={{ marginTop: 16, borderColor: "var(--accent)" }}
            role="alert"
          >
            <strong style={{ color: "var(--accent)" }}>Error.</strong>{" "}
            <code className="inline">{error}</code>
          </div>
        )}

        {steps && (
          <div style={{ marginTop: 22 }}>
            <EventLoopWalkthrough steps={steps} />
          </div>
        )}
      </div>
    </div>
  );
}
