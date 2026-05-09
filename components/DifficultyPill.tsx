import type { Difficulty } from "@/lib/tutorials/types";

const LABEL: Record<Difficulty, string> = {
  intro: "Intro",
  intermediate: "Intermediate",
  advanced: "Advanced",
};

export default function DifficultyPill({ level }: { level: Difficulty }) {
  return (
    <span className="toc-meta-pill" data-difficulty={level}>
      {LABEL[level]}
    </span>
  );
}
