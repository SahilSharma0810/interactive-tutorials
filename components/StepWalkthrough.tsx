"use client";

import React, { useEffect, useRef, useState } from "react";
import HeapSvg, { ClassMap } from "./HeapSvg";
import ArrayCells from "./ArrayCells";

export type Step = {
  arr: (number | string)[];
  classes?: ClassMap;
  /** HTML string — narration for this step */
  narration: string;
};

type Props = {
  steps: Step[];
  /** Show the colored legend? */
  showLegend?: boolean;
  /** Auto-play interval in ms (default 1400) */
  playIntervalMs?: number;
};

export default function StepWalkthrough({
  steps,
  showLegend = true,
  playIntervalMs = 1400,
}: Props) {
  const [idx, setIdx] = useState(0);
  const [playing, setPlaying] = useState(false);
  const timerRef = useRef<number | null>(null);

  // Reset when steps array changes (e.g., user switches tabs and the panel re-mounts)
  useEffect(() => {
    setIdx(0);
    setPlaying(false);
  }, [steps]);

  // Auto-play loop
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

  // Keyboard support — only when this widget has focus or the user presses
  // arrow keys after interacting with one of the buttons.
  const rootRef = useRef<HTMLDivElement | null>(null);
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
      } else if (e.key === "Home") {
        e.preventDefault();
        setIdx(0);
      } else if (e.key === "End") {
        e.preventDefault();
        setIdx(steps.length - 1);
      } else if (/^[1-9]$/.test(e.key)) {
        const target = parseInt(e.key, 10) - 1;
        if (target < steps.length) {
          e.preventDefault();
          setIdx(target);
        }
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [steps.length]);

  const step = steps[idx] ?? steps[0];

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
    <div className="heap-stage" ref={rootRef}>
      <div
        className="heap-svg-wrap"
        tabIndex={0}
        role="region"
        aria-label="Heap diagram (scrollable). Use arrow keys to step through."
      >
        <HeapSvg arr={step.arr} classes={step.classes} />
      </div>
      <ArrayCells arr={step.arr} classes={step.classes} />

      {showLegend && (
        <div className="legend">
          <span><span className="swatch normal"></span>Normal</span>
          <span><span className="swatch compare"></span>Comparing</span>
          <span><span className="swatch swap"></span>Swapping</span>
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

      <div className="step-scrubber" role="tablist" aria-label="Steps">
        {steps.map((_, i) => (
          <button
            key={i}
            type="button"
            role="tab"
            aria-label={`Step ${i + 1} of ${steps.length}`}
            aria-current={i === idx ? "step" : undefined}
            className={
              "step-dot" +
              (i === idx ? " is-active" : "") +
              (i < idx ? " is-visited" : "")
            }
            onClick={() => {
              setPlaying(false);
              setIdx(i);
            }}
          />
        ))}
      </div>

      <div className="controls">
        <button className="btn ghost" onClick={reset}>⟲ Reset</button>
        <button className="btn" onClick={prev} disabled={idx === 0}>← Prev</button>
        <button className="btn primary" onClick={next} disabled={idx >= steps.length - 1}>Next →</button>
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
