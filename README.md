# Interactive Tutorials

A Next.js app for hosting visualization-driven, hands-on lessons. Each tutorial is a React component that composes a shared library of interactive building blocks — heap diagrams, step controllers, sandboxes, and quizzes.

## Getting started

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

To build for production:

```bash
npm run build
npm run start
```

## Project structure

```
.
├── app/
│   ├── layout.tsx              Root layout (fonts, html shell)
│   ├── page.tsx                Home — tutorial listing
│   ├── globals.css             All design tokens & component styles
│   ├── not-found.tsx           404 page
│   └── tutorials/[slug]/page.tsx   Dynamic tutorial route
│
├── components/                 Reusable UI / visualization library
│   ├── Nav.tsx                   Top nav with optional in-page anchors
│   ├── HeapSvg.tsx               Animated SVG heap renderer
│   ├── ArrayCells.tsx            Array view with per-index classes
│   ├── StepWalkthrough.tsx       Generic prev/next/play step controller
│   ├── HeapPlayground.tsx        Interactive heap sandbox
│   ├── MinMaxToggle.tsx          Min vs max heap comparison
│   ├── ArrayLinkingDemo.tsx      Hover-to-link tree ↔ array demo
│   └── Quiz.tsx                  Multiple-choice quiz with feedback
│
├── lib/
│   ├── heap.ts                 MinHeap class
│   ├── heapLayout.ts           SVG layout math (index → x,y)
│   └── tutorials/
│       ├── types.ts            Tutorial / TutorialMeta types
│       ├── registry.ts         ⭐ The list of all tutorials
│       └── priority-queues/    Example tutorial
│           ├── meta.ts
│           ├── steps.ts
│           └── Tutorial.tsx
│
├── package.json
├── tsconfig.json
└── next.config.mjs
```

## Adding a new tutorial

The whole system is wired around `lib/tutorials/registry.ts`. To add a new lesson:

### 1. Create the folder

```
lib/tutorials/<your-slug>/
├── meta.ts
└── Tutorial.tsx
```

### 2. Write `meta.ts`

```ts
import type { TutorialMeta } from "../types";

export const meta: TutorialMeta = {
  slug: "graph-traversal",
  title: "Graph Traversal — BFS & DFS",
  description:
    "Step through breadth-first and depth-first search on the same graph and see how the order changes everything.",
  duration: "~20 min",
  topics: ["Graphs", "Algorithms"],
  order: 2,
};
```

### 3. Write `Tutorial.tsx`

Mark it as a client component if you use state, effects, or any of the
interactive components from `components/`.

```tsx
"use client";

import Nav from "@/components/Nav";
import StepWalkthrough from "@/components/StepWalkthrough";
import Quiz from "@/components/Quiz";

export default function GraphTraversalTutorial() {
  return (
    <>
      <Nav links={[{ href: "#intro", label: "Intro" }]} />
      <main>
        <section className="section hero">
          <h1>Graph Traversal</h1>
          {/* ... */}
        </section>
        {/* Compose the rest from the shared components */}
      </main>
    </>
  );
}
```

### 4. Register it

Open `lib/tutorials/registry.ts` and add two lines:

```ts
import { meta as graphTraversalMeta } from "./graph-traversal/meta";
import GraphTraversalTutorial from "./graph-traversal/Tutorial";

export const tutorials: Tutorial[] = [
  // ...existing entries...
  {
    ...graphTraversalMeta,
    Component: GraphTraversalTutorial,
  },
];
```

That&rsquo;s it. The home page will pick it up automatically, the route
`/tutorials/graph-traversal` will work, and the build will pre-render it.

## Reusable components, at a glance

| Component | Purpose |
|---|---|
| `<HeapSvg arr classes>` | Render an array as a tree, with smooth transitions |
| `<ArrayCells arr classes>` | Render an array with index labels and color states |
| `<StepWalkthrough steps>` | Generic prev/next/play controller — pass a list of `{arr, classes, narration}` |
| `<HeapPlayground />` | Fully interactive min-heap sandbox |
| `<MinMaxToggle />` | Min vs max comparison toggle |
| `<ArrayLinkingDemo />` | Hover any node/cell to highlight its parent and children |
| `<Quiz questions />` | MCQ quiz with per-question feedback and final score |
| `<Nav links?>` | Top navigation with optional in-page anchors |

The CSS classes used throughout (`.section`, `.hero`, `.eyebrow`, `.lede`,
`.concept-box`, `.card`, `.btn`, etc.) are defined in `app/globals.css`. They
form a small design system you can compose to match the editorial aesthetic.

## Color palette / visualization legend

The heap visualizations use four highlight states you can apply via the
`classes` prop (`Record<index, "compare" | "swap" | "target" | "fade" | "new">`):

- **compare** — yellow, used while inspecting nodes
- **swap** — red, used during a swap
- **target** — green, used to draw attention
- **fade** — dimmed, used for nodes about to be removed
- **new** — red with pop animation, used for freshly inserted nodes

## Stack

- Next.js 14 (App Router)
- React 18
- TypeScript
- Plain CSS (no Tailwind, no CSS-in-JS) — all styles live in `app/globals.css`

## License

MIT.
# interactive-tutorials
