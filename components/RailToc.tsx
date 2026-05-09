"use client";

import { useProgress } from "@/lib/progress";
import type { ChapterMeta } from "@/lib/tutorials/types";

type Props = {
  slug: string;
  chapters: ChapterMeta[];
  activeId: string | null;
  onJump?: (chapterId: string) => void;
};

export default function RailToc({ slug, chapters, activeId, onJump }: Props) {
  const { progress } = useProgress(slug);
  const visited = new Set(progress?.visitedChapters ?? []);
  const completed = new Set(progress?.completedChapters ?? []);

  return (
    <nav className="rail-toc" aria-label="Tutorial chapters">
      <div className="rail-toc-label">In this lesson</div>
      <ol className="rail-toc-list">
        {chapters.map((c, i) => {
          const isActive = c.id === activeId;
          const status = completed.has(c.id) ? "completed" : visited.has(c.id) ? "visited" : "unvisited";
          return (
            <li
              key={c.id}
              className={"rail-toc-item " + (isActive ? "is-active " : "") + "is-" + status}
            >
              <a
                href={"#" + c.id}
                aria-current={isActive ? "true" : undefined}
                onClick={(e) => {
                  if (!onJump) return;
                  // Let the browser handle hash-scroll, but tell the shell so it can mark active immediately.
                  onJump(c.id);
                }}
              >
                <span className="rail-toc-num">{String(i + 1).padStart(2, "0")}</span>
                <span className="rail-toc-text">{c.label}</span>
                <span className={"rail-toc-glyph"} aria-hidden />
              </a>
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
