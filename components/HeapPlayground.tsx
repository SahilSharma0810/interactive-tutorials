"use client";

import React, { useState } from "react";
import { MinHeap } from "@/lib/heap";
import HeapSvg, { ClassMap } from "./HeapSvg";
import ArrayCells from "./ArrayCells";

export default function HeapPlayground({
  initialValues = [5, 2, 8, 1, 9, 3],
}: {
  initialValues?: number[];
}) {
  const [arr, setArr] = useState<number[]>(() => {
    const h = new MinHeap();
    initialValues.forEach((v) => h.insert(v));
    return [...h.a];
  });
  const [highlight, setHighlight] = useState<number | null>(null);
  const [message, setMessage] = useState<string>(
    "Sandbox ready. Try inserting some numbers, or extract the minimum."
  );

  const [insertVal, setInsertVal] = useState<string>("");
  const [idxInput, setIdxInput] = useState<string>("");
  const [newValInput, setNewValInput] = useState<string>("");

  /** Build a fresh heap from the current arr, mutate it, then commit. */
  const operate = (
    mutate: (h: MinHeap) => void,
    after: (h: MinHeap) => { highlight: number | null; message: string }
  ) => {
    const h = new MinHeap();
    h.a = [...arr];
    mutate(h);
    const result = after(h);
    setArr([...h.a]);
    setHighlight(result.highlight);
    setMessage(result.message);
  };

  const onInsert = () => {
    const v = parseInt(insertVal);
    if (Number.isNaN(v)) {
      setMessage("Please enter a number to insert.");
      return;
    }
    operate(
      (h) => h.insert(v),
      (h) => ({
        highlight: h.a.indexOf(v),
        message: `Inserted <strong>${v}</strong>. Heap size = ${h.a.length}. Min = <strong>${h.a[0]}</strong>.`,
      })
    );
    setInsertVal("");
  };

  const onExtract = () => {
    if (arr.length === 0) {
      setMessage("Heap is empty — nothing to extract.");
      return;
    }
    const removed = arr[0];
    operate(
      (h) => {
        h.extractMin();
      },
      (h) => ({
        highlight: null,
        message:
          h.a.length === 0
            ? `Extracted minimum <strong>${removed}</strong>. Heap is now empty.`
            : `Extracted minimum <strong>${removed}</strong>. New min = <strong>${h.a[0]}</strong>.`,
      })
    );
  };

  const onDecrease = () => {
    const i = parseInt(idxInput);
    const v = parseInt(newValInput);
    if (Number.isNaN(i) || Number.isNaN(v)) {
      setMessage("Please enter both an index and a new value.");
      return;
    }
    if (i < 0 || i >= arr.length) {
      setMessage(`Index ${i} is out of bounds (heap size = ${arr.length}).`);
      return;
    }
    if (v > arr[i]) {
      setMessage(
        `New value (${v}) must be ≤ current value (${arr[i]}). DecreaseKey only lowers values.`
      );
      return;
    }
    operate(
      (h) => h.decreaseKey(i, v),
      (h) => ({
        highlight: h.a.indexOf(v),
        message: `Decreased index ${i} to <strong>${v}</strong>. Min = <strong>${h.a[0]}</strong>.`,
      })
    );
  };

  const onDelete = () => {
    const i = parseInt(idxInput);
    if (Number.isNaN(i)) {
      setMessage("Enter an index to delete.");
      return;
    }
    if (i < 0 || i >= arr.length) {
      setMessage(`Index ${i} is out of bounds (heap size = ${arr.length}).`);
      return;
    }
    const removedVal = arr[i];
    operate(
      (h) => h.delete(i),
      (h) => ({
        highlight: null,
        message:
          h.a.length === 0
            ? `Deleted index ${i} (value <strong>${removedVal}</strong>). Heap is now empty.`
            : `Deleted index ${i} (value <strong>${removedVal}</strong>). Heap size = ${h.a.length}. Min = <strong>${h.a[0]}</strong>.`,
      })
    );
  };

  const onRandom = () => {
    const n = 7 + Math.floor(Math.random() * 4);
    const used = new Set<number>();
    const h = new MinHeap();
    while (h.a.length < n) {
      const v = Math.floor(Math.random() * 99) + 1;
      if (!used.has(v)) {
        h.insert(v);
        used.add(v);
      }
    }
    setArr([...h.a]);
    setHighlight(null);
    setMessage(`Generated a random heap of ${n} elements.`);
  };

  const onClear = () => {
    setArr([]);
    setHighlight(null);
    setMessage("Heap cleared. Add some values to begin again.");
  };

  const classes: ClassMap = highlight != null ? { [highlight]: "target" } : {};

  return (
    <div className="heap-stage">
      <div className="controls" style={{ marginBottom: 16, gap: 12 }}>
        <input
          className="num-input"
          type="number"
          placeholder="value"
          aria-label="Value to insert"
          value={insertVal}
          onChange={(e) => setInsertVal(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && onInsert()}
        />
        <button className="btn primary" onClick={onInsert}>
          Insert
        </button>
        <button className="btn" onClick={onExtract}>
          Extract Min
        </button>
        <span
          style={{
            width: 1,
            height: 22,
            background: "var(--line)",
            margin: "0 4px",
          }}
        />
        <input
          className="num-input"
          type="number"
          placeholder="index"
          aria-label="Heap index"
          value={idxInput}
          onChange={(e) => setIdxInput(e.target.value)}
        />
        <input
          className="num-input"
          type="number"
          placeholder="new val"
          aria-label="New value (for decrease key)"
          value={newValInput}
          onChange={(e) => setNewValInput(e.target.value)}
        />
        <button className="btn ghost" onClick={onDecrease}>
          Decrease key
        </button>
        <button className="btn ghost" onClick={onDelete}>
          Delete idx
        </button>
        <span style={{ marginLeft: "auto", display: "flex", gap: 8 }}>
          <button className="btn small ghost" onClick={onRandom}>
            ⚄ Random heap
          </button>
          <button className="btn small ghost" onClick={onClear}>
            Clear
          </button>
        </span>
      </div>

      <div
        className="heap-svg-wrap"
        tabIndex={0}
        role="region"
        aria-label="Heap diagram (scrollable)"
      >
        <HeapSvg arr={arr} classes={classes} />
      </div>
      <ArrayCells arr={arr} classes={classes} />

      <div
        className="step-info"
        style={{ marginTop: 22 }}
        role="status"
        aria-live="polite"
        aria-atomic="true"
      >
        <span className="label">Status</span>
        <span dangerouslySetInnerHTML={{ __html: message }} />
      </div>
    </div>
  );
}
