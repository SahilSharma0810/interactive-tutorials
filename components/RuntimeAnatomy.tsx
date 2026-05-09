"use client";

import React from "react";

/**
 * Static labeled diagram of the browser JS runtime model.
 * Engine (V8/SpiderMonkey) handles the call stack + heap;
 * the host browser provides Web APIs and the queues + the loop itself.
 */
export default function RuntimeAnatomy() {
  return (
    <svg
      viewBox="0 0 800 380"
      className="el-anatomy"
      role="img"
      aria-label="Diagram of the browser JS runtime: engine on the left contains call stack and heap; host environment on the right contains Web APIs and feeds two queues into the event loop."
    >
      <defs>
        <marker
          id="el-arrow"
          viewBox="0 -5 10 10"
          refX="10"
          refY="0"
          markerWidth="10"
          markerHeight="10"
          orient="auto"
        >
          <path d="M0,-5L10,0L0,5" fill="#3a322d" />
        </marker>
      </defs>

      {/* Engine box */}
      <g>
        <rect x="20" y="40" width="240" height="300" rx="6"
              fill="#fbf6ec" stroke="#c8b9a3" strokeWidth="1.5" />
        <text x="140" y="68" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="11"
              fill="#6b5d52" letterSpacing=".15em">
          JS ENGINE — e.g. V8
        </text>
        <rect x="40" y="90" width="200" height="100" rx="4"
              fill="#fbeed2" stroke="#d8b864" />
        <text x="140" y="120" textAnchor="middle"
              fontFamily="var(--display)" fontSize="18" fill="#1c1816">
          Call Stack
        </text>
        <text x="140" y="142" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="11" fill="#6b5d52">
          one frame at a time
        </text>
        <text x="140" y="162" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="11" fill="#6b5d52">
          LIFO
        </text>

        <rect x="40" y="210" width="200" height="100" rx="4"
              fill="#efe6d2" stroke="#c8b9a3" />
        <text x="140" y="240" textAnchor="middle"
              fontFamily="var(--display)" fontSize="18" fill="#1c1816">
          Heap
        </text>
        <text x="140" y="262" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="11" fill="#6b5d52">
          objects live here
        </text>
      </g>

      {/* Host box */}
      <g>
        <rect x="320" y="40" width="460" height="300" rx="6"
              fill="#fbf6ec" stroke="#c8b9a3" strokeWidth="1.5" />
        <text x="550" y="68" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="11"
              fill="#6b5d52" letterSpacing=".15em">
          HOST — the browser
        </text>

        {/* Web APIs */}
        <rect x="340" y="90" width="200" height="100" rx="4"
              fill="#f0e1d4" stroke="#c89a76" />
        <text x="440" y="120" textAnchor="middle"
              fontFamily="var(--display)" fontSize="18" fill="#1c1816">
          Web APIs
        </text>
        <text x="440" y="142" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="11" fill="#6b5d52">
          timer, fetch, DOM, rAF
        </text>
        <text x="440" y="162" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="11" fill="#6b5d52">
          parked async work
        </text>

        {/* Task queue */}
        <rect x="340" y="210" width="200" height="60" rx="4"
              fill="#efe6d2" stroke="#c8b9a3" />
        <text x="440" y="234" textAnchor="middle"
              fontFamily="var(--display)" fontSize="14" fill="#1c1816">
          Task Queue
        </text>
        <text x="440" y="254" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="10" fill="#6b5d52">
          FIFO • one per loop tick
        </text>

        {/* Microtask queue */}
        <rect x="340" y="278" width="200" height="50" rx="4"
              fill="#d8e6dd" stroke="#98b3a2" />
        <text x="440" y="300" textAnchor="middle"
              fontFamily="var(--display)" fontSize="14" fill="#1c1816">
          Microtask Queue
        </text>
        <text x="440" y="318" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="10" fill="#6b5d52">
          drains fully each tick
        </text>

        {/* The loop */}
        <rect x="580" y="160" width="180" height="120" rx="60"
              fill="#1c1816" stroke="#1c1816" />
        <text x="670" y="200" textAnchor="middle"
              fontFamily="var(--display)" fontSize="22" fill="#fbf6ec">
          Event
        </text>
        <text x="670" y="228" textAnchor="middle"
              fontFamily="var(--display)" fontSize="22" fill="#f7d05a">
          Loop
        </text>
        <text x="670" y="252" textAnchor="middle"
              fontFamily="var(--mono)" fontSize="10" fill="#b9a99a">
          while (true)
        </text>
      </g>

      {/* Arrows */}
      <line x1="540" y1="140" x2="580" y2="200"
            stroke="#3a322d" strokeWidth="1.5"
            markerEnd="url(#el-arrow)" />
      <line x1="540" y1="240" x2="580" y2="220"
            stroke="#3a322d" strokeWidth="1.5"
            markerEnd="url(#el-arrow)" />
      <line x1="540" y1="300" x2="580" y2="240"
            stroke="#3a322d" strokeWidth="1.5"
            markerEnd="url(#el-arrow)" />
      <line x1="580" y1="200" x2="260" y2="120"
            stroke="#3a322d" strokeWidth="1.5"
            strokeDasharray="3 3"
            markerEnd="url(#el-arrow)" />
      <text x="430" y="190" fontFamily="var(--mono)" fontSize="10"
            fill="#6b5d52">
        loop pushes a frame onto the stack
      </text>
    </svg>
  );
}
