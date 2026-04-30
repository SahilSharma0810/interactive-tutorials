import type { Tutorial } from "./types";
import { meta as priorityQueuesMeta } from "./priority-queues/meta";
import PriorityQueuesTutorial from "./priority-queues/Tutorial";
import { meta as eventLoopMeta } from "./javascript-event-loop/meta";
import EventLoopTutorial from "./javascript-event-loop/Tutorial";

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
