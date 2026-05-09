"use client";

import { useEffect, useRef, useState } from "react";
import { useProgress } from "@/lib/progress";
import type { ChapterMeta } from "@/lib/tutorials/types";

type Props = {
  slug: string;
  chapters: ChapterMeta[];
  activeId: string | null;
  onJump?: (chapterId: string) => void;
};

export default function MobileChapterMenu({ slug, chapters, activeId, onJump }: Props) {
  const [open, setOpen] = useState(false);
  const sheetRef = useRef<HTMLDivElement | null>(null);
  const triggerRef = useRef<HTMLButtonElement | null>(null);
  const { progress } = useProgress(slug);
  const visited = new Set(progress?.visitedChapters ?? []);
  const completed = new Set(progress?.completedChapters ?? []);

  // Esc closes; focus trap on open; restore focus on close
  useEffect(() => {
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("keydown", onKey);
    sheetRef.current?.focus();
    return () => document.removeEventListener("keydown", onKey);
  }, [open]);

  useEffect(() => {
    if (!open) triggerRef.current?.focus();
  }, [open]);

  const handleJump = (id: string) => {
    onJump?.(id);
    setOpen(false);
  };

  return (
    <>
      <button
        ref={triggerRef}
        className="mobile-chapter-trigger"
        type="button"
        aria-expanded={open}
        aria-controls="mobile-chapter-sheet"
        aria-label="Open chapter menu"
        onClick={() => setOpen(true)}
      >
        ☰
      </button>

      {open && (
        <div className="mobile-chapter-backdrop" onClick={() => setOpen(false)} />
      )}

      <div
        id="mobile-chapter-sheet"
        ref={sheetRef}
        className={"mobile-chapter-sheet" + (open ? " is-open" : "")}
        role="dialog"
        aria-modal="true"
        aria-label="Chapters"
        tabIndex={-1}
      >
        <div className="mobile-chapter-sheet-head">
          <span>Chapters</span>
          <button type="button" className="btn small ghost" onClick={() => setOpen(false)}>Close</button>
        </div>
        <ol className="mobile-chapter-list">
          {chapters.map((c, i) => {
            const isActive = c.id === activeId;
            const status = completed.has(c.id) ? "is-completed" : visited.has(c.id) ? "is-visited" : "is-unvisited";
            return (
              <li key={c.id} className={"mobile-chapter-item " + (isActive ? "is-active " : "") + status}>
                <a
                  href={"#" + c.id}
                  onClick={() => handleJump(c.id)}
                  aria-current={isActive ? "true" : undefined}
                >
                  <span className="mobile-chapter-num">{String(i + 1).padStart(2, "0")}</span>
                  <span className="mobile-chapter-text">{c.label}</span>
                  <span className="mobile-chapter-glyph" aria-hidden />
                </a>
              </li>
            );
          })}
        </ol>
      </div>
    </>
  );
}
