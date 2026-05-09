"use client";

import { useEffect, useState } from "react";
import { getProgress } from "@/lib/progress";
import type { TutorialMeta } from "@/lib/tutorials/types";

export default function HomeResumeCta({ tutorial }: { tutorial: TutorialMeta }) {
  const [tick, setTick] = useState(0);
  useEffect(() => { setTick(1); }, []);
  const p = tick === 0 ? undefined : getProgress(tutorial.slug);
  const lastChapter = p && tutorial.chapters.find((c) => c.id === p.lastChapterId);
  const text = lastChapter ? `Resume from ${lastChapter.label}` : "Begin reading";
  return (
    <span className="toc-cta">
      {text} <span aria-hidden>→</span>
    </span>
  );
}
