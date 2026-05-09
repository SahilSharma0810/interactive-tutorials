import type { TutorialMeta } from "../types";

export const meta: TutorialMeta = {
  slug: "priority-queues-binary-heaps",
  title: "Priority Queues using Binary Heaps",
  description:
    "A guided, hands-on tour through the data structure that powers task schedulers, Dijkstra's algorithm, and every \"process the most important thing first\" system.",
  duration: "~25 min",
  topics: ["Data Structures", "Algorithms"],
  category: "Data Structures & Algorithms",
  order: 1,
  difficulty: "intermediate",
  recommendedFirst: true,
  chapters: [
    { id: "priority-queue", label: "Priority Queue", title: "Priority queues" },
    { id: "binary-heap",    label: "Heap",          title: "Binary heaps" },
    { id: "min-max",        label: "Min/Max",       title: "Min vs max" },
    { id: "array-repr",     label: "Array",         title: "Array representation" },
    { id: "operations",      label: "Operations",    title: "Operations" },
    { id: "time-complexity", label: "Complexity",    title: "Time complexity" },
    { id: "playground",      label: "Playground",    title: "Playground" },
    { id: "quiz",            label: "Quiz",          title: "Test yourself" },
  ],
};
