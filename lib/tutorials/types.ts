import type { ComponentType } from "react";

export type ChapterMeta = {
  /** Anchor id used in the URL hash and `data-chapter-id` attribute. */
  id: string;
  /** Short label shown in nav, rail TOC, and mobile menu. */
  label: string;
  /** Long title (used in the "Next chapter" CTA). Falls back to label. */
  title?: string;
};

export type Difficulty = "intro" | "intermediate" | "advanced";

export type TutorialMeta = {
  slug: string;
  title: string;
  /** Used on tutorial card and meta tags */
  description: string;
  /** "~25 min" */
  duration: string;
  /** Tags shown on the card */
  topics: string[];
  /** Group heading on the home page TOC */
  category: string;
  /** Order of appearance in the home page (lower = first) */
  order?: number;

  /** Ordered list of in-tutorial chapters. Drives nav, rail, mobile menu. */
  chapters: ChapterMeta[];
  /** Difficulty pill on the home TOC. */
  difficulty: Difficulty;
  /** Slugs of prior tutorials the reader should finish first. */
  prerequisites?: string[];
  /** If true, this tutorial appears in the "Start here" hero on the home page. */
  recommendedFirst?: boolean;
};

export type Tutorial = TutorialMeta & {
  /** The full tutorial page — typically a client component */
  Component: ComponentType;
};
