import type { ComponentType } from "react";

export type TutorialMeta = {
  slug: string;
  title: string;
  /** Used on tutorial card and meta tags */
  description: string;
  /** "~25 min" */
  duration: string;
  /** Tags shown on the card */
  topics: string[];
  /** Order of appearance in the home page (lower = first) */
  order?: number;
};

export type Tutorial = TutorialMeta & {
  /** The full tutorial page — typically a client component */
  Component: ComponentType;
};
