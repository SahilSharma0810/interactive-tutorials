"use client";

import { useEffect, useState } from "react";
import { getProgress } from "@/lib/progress";
import type { TutorialMeta } from "@/lib/tutorials/types";

type Props = {
  tutorial: TutorialMeta;
};

export default function HomeProgressTags({ tutorial }: Props) {
  const [tick, setTick] = useState(0);
  useEffect(() => { setTick(1); }, []);
  if (tick === 0) return null;          // SSR-safe — render nothing pre-hydration
  const p = getProgress(tutorial.slug);
  if (!p) return null;
  const completed = p.completedChapters.length === tutorial.chapters.length;
  const lastChapter = tutorial.chapters.find((c) => c.id === p.lastChapterId);
  return (
    <>
      {completed && <span className="home-completed-badge" aria-label="Completed" title="Completed">●</span>}
      {!completed && lastChapter && (
        <span className="home-resume-cue">Resume from {lastChapter.label}</span>
      )}
    </>
  );
}
