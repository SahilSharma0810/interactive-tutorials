"use client";

import React from "react";
import { nodeXY, HEAP_W, NODE_R, svgHeight } from "@/lib/heapLayout";

export type NodeClass = "compare" | "swap" | "target" | "fade" | "new";
export type ClassMap = Record<number, NodeClass | undefined>;

type Props = {
  /** Heap array. Use `-Infinity` if you want to render "−∞" sentinel values. */
  arr: (number | string)[];
  /** Optional per-index style classes */
  classes?: ClassMap;
  /** Optional click handler on a node, by index */
  onNodeHover?: (idx: number | null) => void;
  /** Accessible name for the SVG (defaults to a generic description). */
  title?: string;
};

function displayValue(v: number | string): string {
  if (v === -Infinity) return "−∞";
  if (v === Infinity) return "∞";
  return String(v);
}

export default function HeapSvg({ arr, classes = {}, onNodeHover, title }: Props) {
  const n = arr.length;
  const height = svgHeight(n);

  // Pre-compute node positions and edge geometry
  const positions = arr.map((_, i) => nodeXY(i));

  const accessibleTitle =
    title ??
    (n === 0
      ? "Empty binary heap."
      : `Binary heap with ${n} node${n === 1 ? "" : "s"}. Root value ${arr[0]}.`);

  return (
    <svg
      className="heap-svg"
      viewBox={`0 0 ${HEAP_W} ${height}`}
      preserveAspectRatio="xMidYMid meet"
      role={onNodeHover ? "group" : "img"}
      aria-label={accessibleTitle}
    >
      <title>{accessibleTitle}</title>
      {/* Edges (drawn first, behind nodes) */}
      <g className="edges">
        {arr.map((_, i) => {
          if (i === 0) return null;
          const parent = Math.floor((i - 1) / 2);
          const p = positions[parent];
          const c = positions[i];
          return (
            <line
              key={`e-${i}`}
              x1={p.x}
              y1={p.y}
              x2={c.x}
              y2={c.y}
              className="heap-edge"
            />
          );
        })}
      </g>

      {/* Nodes — keyed so React reuses them across re-renders, enabling smooth transition */}
      {arr.map((value, i) => {
        const cls = classes[i];
        const { x, y } = positions[i];
        const className = "heap-node" + (cls ? " " + cls : "");
        const interactive = !!onNodeHover;
        return (
          <g
            key={`n-${i}`}
            className={className}
            style={{ cursor: interactive ? "pointer" : "default" }}
            onMouseEnter={interactive ? () => onNodeHover!(i) : undefined}
            onMouseLeave={interactive ? () => onNodeHover!(null) : undefined}
            onFocus={interactive ? () => onNodeHover!(i) : undefined}
            onBlur={interactive ? () => onNodeHover!(null) : undefined}
            tabIndex={interactive ? 0 : undefined}
            role={interactive ? "button" : undefined}
            aria-label={
              interactive ? `Node at index ${i}, value ${displayValue(value)}` : undefined
            }
          >
            <g className="group" transform={`translate(${x}, ${y})`}>
              <circle r={NODE_R} />
              <text>{displayValue(value)}</text>
            </g>
          </g>
        );
      })}
    </svg>
  );
}
