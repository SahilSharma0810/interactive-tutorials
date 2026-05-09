"use client";

import React, { useState } from "react";

type Mode = "promise-then-timer" | "timer-then-promise";

const SCRIPTS: Record<Mode, { code: string; output: string[] }> = {
  "promise-then-timer": {
    code: `Promise.resolve().then(() => log("micro"));
setTimeout(() => log("task"), 0);`,
    output: ["micro", "task"],
  },
  "timer-then-promise": {
    code: `setTimeout(() => log("task"), 0);
Promise.resolve().then(() => log("micro"));`,
    output: ["micro", "task"],
  },
};

export default function PriorityRace() {
  const [mode, setMode] = useState<Mode>("promise-then-timer");
  const { code, output } = SCRIPTS[mode];

  return (
    <div className="card" style={{ padding: 24 }}>
      <div className="controls" style={{ marginBottom: 16 }}>
        <button
          className={"tab" + (mode === "promise-then-timer" ? " active" : "")}
          onClick={() => setMode("promise-then-timer")}
        >
          Promise first
        </button>
        <button
          className={"tab" + (mode === "timer-then-promise" ? " active" : "")}
          onClick={() => setMode("timer-then-promise")}
        >
          Timer first
        </button>
        <span style={{ marginLeft: "auto", fontFamily: "var(--mono)",
                       fontSize: 12, color: "var(--muted)" }}>
          Source order swapped — output stays the same.
        </span>
      </div>
      <pre className="code">{code}</pre>
      <div style={{ marginTop: 18, display: "flex", gap: 12,
                    alignItems: "center", flexWrap: "wrap" }}>
        <span style={{ fontFamily: "var(--mono)", fontSize: 12,
                       color: "var(--muted)", textTransform: "uppercase",
                       letterSpacing: ".1em" }}>
          Output
        </span>
        {output.map((line, i) => (
          <span
            key={i}
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              padding: "3px 10px",
              borderRadius: 3,
              fontFamily: "var(--mono)",
              fontSize: 13,
            }}
          >
            {line}
          </span>
        ))}
      </div>
      <p style={{ marginTop: 18, fontSize: 15, color: "var(--ink-2)" }}>
        No matter the source order, <strong>microtasks always win</strong>{" "}
        against tasks queued during the same script. The microtask queue is
        drained before the next task is picked.
      </p>
    </div>
  );
}
