import type { TutorialMeta } from "../types";

export const meta: TutorialMeta = {
  slug: "javascript-event-loop",
  title: "The JavaScript Event Loop",
  description:
    "An advanced, hands-on tour of how JavaScript actually runs your asynchronous code. Build the model from scratch — call stack, web APIs, task queue, microtask queue — and step through the canonical scenarios.",
  duration: "~30 min",
  topics: ["JavaScript", "Concurrency"],
  category: "JavaScript",
  order: 2,
  difficulty: "advanced",
  prerequisites: [],
  chapters: [
    { id: "single-thread", label: "Single thread", title: "One thread, one stack" },
    { id: "runtime",       label: "Runtime",       title: "The runtime model" },
    { id: "loop-algo",     label: "The loop",      title: "The loop algorithm" },
    { id: "priority",      label: "Priority",      title: "Microtasks vs tasks" },
    { id: "scenarios",     label: "Scenarios",     title: "Step through scenarios" },
    { id: "rendering",     label: "Rendering",     title: "Rendering & rAF" },
    { id: "node",          label: "Node",          title: "Node.js" },
    { id: "playground",    label: "Playground",    title: "Sandbox" },
    { id: "quiz",          label: "Quiz",          title: "Test yourself" },
  ],
};
