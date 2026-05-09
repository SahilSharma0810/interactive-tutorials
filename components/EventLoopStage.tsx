"use client";

import React from "react";
import type {
  ClassMap,
  Phase,
  SimulatorState,
} from "@/lib/tutorials/javascript-event-loop/simulator";

type Props = {
  state: SimulatorState;
  source: string;
  classes?: ClassMap;
};

const PHASE_LABEL: Record<Phase, string> = {
  idle: "Idle — call stack empty, queues empty",
  "running-task": "Running task — call stack non-empty",
  "drain-microtasks": "Draining microtasks",
  render: "Rendering",
  "pick-next-task": "Picking next task",
};

function displayValue(v: string | number): string {
  if (typeof v === "number" && !Number.isFinite(v))
    return v < 0 ? "−∞" : "∞";
  return String(v);
}

export default function EventLoopStage({ state, source, classes = {} }: Props) {
  const lines = source.split("\n");

  return (
    <div className="el-stage">
      {/* Source code panel */}
      <div className="el-source-wrap">
        <div className="el-panel-label">Source</div>
        <pre className="el-source">
          {lines.map((ln, i) => {
            const lineNum = i + 1;
            const isCurrent = state.currentLine === lineNum;
            return (
              <div
                key={i}
                className={"el-line" + (isCurrent ? " current" : "")}
              >
                <span className="el-lineno">{lineNum}</span>
                <span className="el-linecode">{ln || " "}</span>
              </div>
            );
          })}
        </pre>
      </div>

      {/* Four panels */}
      <div className="el-panels">
        <Panel label="Call Stack" hint="LIFO" empty={state.stack.length === 0}>
          {/* Render top-of-stack at the visual top */}
          {[...state.stack].reverse().map((f) => (
            <div
              key={f.id}
              className={"el-frame " + (classes[f.id] ?? "")}
            >
              <span className="el-item-label">{f.label}</span>
              {f.line != null && (
                <span className="el-item-meta">L{f.line}</span>
              )}
            </div>
          ))}
        </Panel>

        <Panel label="Web APIs" hint="parked" empty={state.webApis.length === 0}>
          {state.webApis.map((w) => (
            <div
              key={w.id}
              className={"el-webapi kind-" + w.kind + " " + (classes[w.id] ?? "")}
            >
              <span className="el-item-label">{w.label}</span>
              <span className="el-item-meta">
                {w.kind === "timer" && `timer ${w.ms}ms`}
                {w.kind === "fetch" && `fetch ${w.url}`}
                {w.kind === "raf" && "rAF"}
              </span>
            </div>
          ))}
        </Panel>

        <Panel label="Task Queue" hint="FIFO" empty={state.taskQueue.length === 0}>
          {state.taskQueue.map((t) => (
            <div
              key={t.id}
              className={"el-task source-" + t.source + " " + (classes[t.id] ?? "")}
            >
              <span className="el-item-label">{t.label}</span>
              <span className="el-item-meta">{t.source}</span>
            </div>
          ))}
        </Panel>

        <Panel
          label="Microtask Queue"
          hint="FIFO · drains fully"
          empty={state.microtaskQueue.length === 0}
        >
          {state.microtaskQueue.map((m) => (
            <div
              key={m.id}
              className={"el-micro source-" + m.source + " " + (classes[m.id] ?? "")}
            >
              <span className="el-item-label">{m.label}</span>
              <span className="el-item-meta">{m.source}</span>
            </div>
          ))}
        </Panel>
      </div>

      {/* Tick indicator */}
      <div className="el-tick">
        <div className="el-tick-row">
          <span className="el-tick-label">Phase</span>
          <span className={"el-tick-value phase-" + state.phase}>
            {PHASE_LABEL[state.phase]}
          </span>
        </div>
        <div className="el-tick-row">
          <span className="el-tick-label">Console</span>
          <span className="el-tick-console">
            {state.consoleLog.length === 0 ? (
              <em className="muted">— no output yet —</em>
            ) : (
              state.consoleLog.map((s, i) => (
                <span key={i} className="el-console-line">
                  {displayValue(s)}
                </span>
              ))
            )}
          </span>
        </div>
      </div>
    </div>
  );
}

function Panel({
  label,
  hint,
  empty,
  children,
}: {
  label: string;
  hint: string;
  empty: boolean;
  children: React.ReactNode;
}) {
  return (
    <div className="el-panel">
      <div className="el-panel-head">
        <span className="el-panel-label">{label}</span>
        <span className="el-panel-hint">{hint}</span>
      </div>
      <div className={"el-panel-body" + (empty ? " is-empty" : "")}>
        {empty ? <div className="el-empty">·</div> : children}
      </div>
    </div>
  );
}
