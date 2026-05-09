"use client";

import React, { useEffect, useRef, useState } from "react";
import EventLoopStage from "./EventLoopStage";
import type { Step } from "@/lib/tutorials/javascript-event-loop/simulator";

type Props = {
  steps: Step[];
  showLegend?: boolean;
  playIntervalMs?: number;
};

export default function EventLoopWalkthrough({
  steps,
  showLegend = true,
  playIntervalMs = 1600,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);
  const rootRef = useRef<HTMLDivElement | null>(null);

  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [steps]);

  useEffect(() => {
    if (!playing) {
      if (timerRef.current) {
        window.clearTimeout(timerRef.current);
        timerRef.current = null;
      }
      return;
    }
    if (idx >= steps.length - 1) {
      setPlaying(false);
      return;
    }
    timerRef.current = window.setTimeout(() => {
      setIdx((i) => Math.min(i + 1, steps.length - 1));
    }, playIntervalMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [playing, idx, steps.length, playIntervalMs]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (!rootRef.current) return;
      const rect = rootRef.current.getBoundingClientRect();
      const inView = rect.top < window.innerHeight && rect.bottom > 0;
      if (!inView) return;
      const active = document.activeElement;
      const insideThis = active && rootRef.current.contains(active);
      if (!insideThis) return;
      if (e.key === "ArrowRight") {
        e.preventDefault();
        setIdx((i) => Math.min(i + 1, steps.length - 1));
      } else if (e.key === "ArrowLeft") {
        e.preventDefault();
        setIdx((i) => Math.max(i - 1, 0));
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  if (steps.length === 0) {
    return (
      <div className="heap-stage">
        <em>No steps to display.</em>
      </div>
    );
  }

  const step = steps[idx];

  const next = () => {
    setPlaying(false);
    setIdx((i) => Math.min(i + 1, steps.length - 1));
  };
  const prev = () => {
    setPlaying(false);
    setIdx((i) => Math.max(i - 1, 0));
  };
  const reset = () => {
    setPlaying(false);
    setIdx(0);
  };
  const togglePlay = () => {
    if (idx >= steps.length - 1) setIdx(0);
    setPlaying((p) => !p);
  };

  return (
    <div className="heap-stage el-walkthrough" ref={rootRef}>
      <div
        className="el-stage-wrap"
        tabIndex={0}
        role="region"
        aria-label="Event loop snapshot. Use arrow keys to step."
      >
        <EventLoopStage
          state={step.state}
          source={step.source}
          classes={step.classes}
        />
      </div>

      {showLegend && (
        <div className="legend">
          <span><span className="swatch normal"></span>Idle</span>
          <span><span className="swatch compare"></span>Entering</span>
          <span><span className="swatch swap"></span>Leaving</span>
          <span><span className="swatch target"></span>Focus</span>
        </div>
      )}

      <div
        className="step-info"
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="label">Narration</span>
        <span className="sr-only">Step {idx + 1} of {steps.length}. </span>
        <span dangerouslySetInnerHTML={{ __html: step.narration }} />
      </div>

      <div className="controls">
        <button className="btn ghost" onClick={reset}>⟲ Reset</button>
        <button className="btn" onClick={prev} disabled={idx === 0}>← Prev</button>
        <button
          className="btn primary"
          onClick={next}
          disabled={idx >= steps.length - 1}
        >
          Next →
        </button>
        <button
          className="btn ghost"
          onClick={togglePlay}
          aria-pressed={playing}
          aria-label={playing ? "Pause auto-play" : "Start auto-play"}
        >
          {playing ? "❙❙ Pause" : "▶ Auto-play"}
        </button>
        <span className="step-counter">Step {idx + 1} / {steps.length}</span>
      </div>
    </div>
  );
}
