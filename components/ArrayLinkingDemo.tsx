"use client";

import React, { useState } from "react";
import HeapSvg, { ClassMap } from "./HeapSvg";
import ArrayCells from "./ArrayCells";

const ARR = [1, 3, 2, 5, 4, 8, 6, 7, 9];

export default function ArrayLinkingDemo() {
  const [hoverIdx, setHoverIdx] = useState<number | null>(null);

  // Build classes — target the hover node, mark its parent and children
  const classes: ClassMap = {};
  if (hoverIdx != null && hoverIdx >= 0 && hoverIdx < ARR.length) {
    classes[hoverIdx] = "target";
    const left = 2 * hoverIdx + 1;
    const right = 2 * hoverIdx + 2;
    if (left < ARR.length) classes[left] = "compare";
    if (right < ARR.length) classes[right] = "compare";
    // We don't highlight parent visually so the focus stays on the children relation,
    // but we mention it in the relation panel.
  }

  // For the array, also mark the linked cell with a ring (linked) class
  const arrayClasses: ClassMap = { ...classes };
  if (hoverIdx != null) {
    // override with "linked" outline on the focused cell
    arrayClasses[hoverIdx] = "target";
  }

  let info: React.ReactNode;
  if (hoverIdx == null || hoverIdx < 0 || hoverIdx >= ARR.length) {
    info = (
      <span style={{ color: "var(--muted)" }}>
        Hover a node or array cell to see its index relationships…
      </span>
    );
  } else {
    const left = 2 * hoverIdx + 1;
    const right = 2 * hoverIdx + 2;
    const parent = Math.floor((hoverIdx - 1) / 2);
    info = (
      <>
        <strong style={{ color: "var(--accent)" }}>Index {hoverIdx}</strong> →
        value {ARR[hoverIdx]}
        <br />
        {hoverIdx === 0 ? (
          <span style={{ color: "var(--muted)" }}>root (no parent)</span>
        ) : (
          <>
            parent at ⌊({hoverIdx}−1)/2⌋ = <strong>{parent}</strong> (value{" "}
            {ARR[parent]})
          </>
        )}
        <br />
        {left < ARR.length ? (
          <>
            left child at 2·{hoverIdx}+1 = <strong>{left}</strong> (value{" "}
            {ARR[left]})
          </>
        ) : (
          <span style={{ color: "var(--muted)" }}>no left child</span>
        )}
        <br />
        {right < ARR.length ? (
          <>
            right child at 2·{hoverIdx}+2 = <strong>{right}</strong> (value{" "}
            {ARR[right]})
          </>
        ) : (
          <span style={{ color: "var(--muted)" }}>no right child</span>
        )}
      </>
    );
  }

  return (
    <div>
      <h4 style={{ marginBottom: 14 }}>Tree view</h4>
      <div className="heap-stage">
        <div
          className="heap-svg-wrap"
          tabIndex={0}
          role="region"
          aria-label="Heap diagram (scrollable)"
        >
          <HeapSvg arr={ARR} classes={classes} onNodeHover={setHoverIdx} />
        </div>
        <h4 style={{ margin: "24px 0 6px" }}>Array view</h4>
        <ArrayCells
          arr={ARR}
          classes={arrayClasses}
          onCellHover={setHoverIdx}
        />
        <div
          style={{
            marginTop: 24,
            fontFamily: "var(--mono)",
            fontSize: 13,
            color: "var(--ink-2)",
            minHeight: 50,
            padding: "12px 14px",
            background: "var(--bg)",
            borderRadius: 4,
            lineHeight: 1.6,
          }}
        >
          {info}
        </div>
      </div>
    </div>
  );
}
