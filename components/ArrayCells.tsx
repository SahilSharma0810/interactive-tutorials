"use client";

import React from "react";
import type { ClassMap } from "./HeapSvg";

type Props = {
  arr: (number | string)[];
  classes?: ClassMap;
  /** Optional capacity to show empty trailing cells */
  capacity?: number;
  onCellHover?: (idx: number | null) => void;
};

function displayValue(v: number | string): string {
  if (v === -Infinity) return "−∞";
  if (v === Infinity) return "∞";
  return String(v);
}

export default function ArrayCells({
  arr,
  classes = {},
  capacity,
  onCellHover,
}: Props) {
  const len = capacity ? Math.max(arr.length, capacity) : arr.length;
  const cells = [];
  for (let i = 0; i < len; i++) {
    const isEmpty = i >= arr.length;
    const cls = classes[i];
    const className =
      "array-cell" +
      (isEmpty ? " empty" : "") +
      (cls ? " " + cls : "");
    cells.push(
      <div
        key={i}
        className={className}
        onMouseEnter={onCellHover ? () => onCellHover(i) : undefined}
        onMouseLeave={onCellHover ? () => onCellHover(null) : undefined}
        style={{ cursor: onCellHover ? "pointer" : "default" }}
      >
        {isEmpty ? "·" : displayValue(arr[i])}
        <span className="idx">{i}</span>
      </div>
    );
  }
  return <div className="array-row">{cells}</div>;
}
