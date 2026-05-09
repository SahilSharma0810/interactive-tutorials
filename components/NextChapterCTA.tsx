"use client";

type Props = {
  nextLabel: string;
  nextHref: string;
};

export default function NextChapterCTA({ nextLabel, nextHref }: Props) {
  return (
    <div className="next-chapter-cta">
      <a href={nextHref}>
        Next: {nextLabel} <span aria-hidden>→</span>
      </a>
    </div>
  );
}
