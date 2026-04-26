"use client";

import React, { useState } from "react";
import HeapSvg from "./HeapSvg";

const MIN_HEAP = [1, 2, 5, 3, 4, 7, 6, 8];
const MAX_HEAP = [8, 7, 6, 3, 4, 5, 2, 1];

export default function MinMaxToggle() {
  const [isMin, setIsMin] = useState(true);
  const arr = isMin ? MIN_HEAP : MAX_HEAP;

  return (
    <div>
      <div className="controls" style={{ marginBottom: 24 }}>
        <button className="btn primary" onClick={() => setIsMin((v) => !v)}>
          {isMin
            ? "Currently: Min-Heap → switch to Max"
            : "Currently: Max-Heap → switch to Min"}
        </button>
        <span
          style={{
            fontFamily: "var(--mono)",
            fontSize: 12,
            color: "var(--muted)",
            marginLeft: "auto",
          }}
        >
          Same values: 1, 2, 3, 4, 5, 6, 7, 8
        </span>
      </div>

      <div className="heap-compare">
        <div>
          <h4>
            Current view:{" "}
            <span className="label-val">{isMin ? "MIN-HEAP" : "MAX-HEAP"}</span>
          </h4>
          <div className="heap-stage">
            <div
              className="heap-svg-wrap"
              tabIndex={0}
              role="region"
              aria-label="Heap diagram (scrollable)"
            >
              <HeapSvg arr={arr} />
            </div>
          </div>
        </div>
        <div>
          <h4>The Rule</h4>
          <div
            className="card"
            style={{
              background: "var(--ink)",
              color: "var(--paper)",
              borderColor: "var(--ink)",
            }}
          >
            <p
              style={{
                fontFamily: "var(--display)",
                fontSize: 28,
                lineHeight: 1.25,
                margin: 0,
              }}
            >
              For every node N: <br />
              <em style={{ color: "var(--highlight)" }}>
                value(N) {isMin ? "≤" : "≥"} value(child)
              </em>
            </p>
            <hr
              style={{
                border: "none",
                borderTop: "1px solid #3a322d",
                margin: "20px 0",
              }}
            />
            <p style={{ margin: 0, color: "#c8b9a3", fontSize: 15 }}>
              {isMin ? (
                <>
                  The root holds the{" "}
                  <strong style={{ color: "var(--highlight)" }}>smallest</strong>{" "}
                  value. Useful for &ldquo;give me the next-most-urgent task&rdquo;
                  scheduling.
                </>
              ) : (
                <>
                  The root holds the{" "}
                  <strong style={{ color: "var(--highlight)" }}>largest</strong>{" "}
                  value. Useful for top-k queries and heap-sort in descending
                  order.
                </>
              )}
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
