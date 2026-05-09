import type { Tutorial } from "./types";
import { meta as priorityQueuesMeta } from "./priority-queues/meta";
import PriorityQueuesTutorial from "./priority-queues/Tutorial";
import { meta as eventLoopMeta } from "./javascript-event-loop/meta";
import EventLoopTutorial from "./javascript-event-loop/Tutorial";

// =============================================================
// REGISTRY OF TUTORIALS
// =============================================================
// To add a new tutorial:
//   1. Create a folder: lib/tutorials/<your-slug>/
//   2. Add a `meta.ts`     exporting `meta: TutorialMeta`
//   3. Add a `Tutorial.tsx` exporting a default React component
//      (mark it `'use client'` if it uses state/effects)
//   4. Import them below and add an entry to `tutorials`.
// =============================================================

export const tutorials: Tutorial[] = [
  {
    ...priorityQueuesMeta,
    Component: PriorityQueuesTutorial,
  },
  {
    ...eventLoopMeta,
    Component: EventLoopTutorial,
  },
];

tutorials.sort((a, b) => (a.order ?? 999) - (b.order ?? 999));

export function getTutorial(slug: string): Tutorial | undefined {
  return tutorials.find((t) => t.slug === slug);
}

export function getAllSlugs(): string[] {
  return tutorials.map((t) => t.slug);
}
