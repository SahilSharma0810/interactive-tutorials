"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import HomeProgressTags from "./HomeProgressTags";
import HomeResumeCta from "./HomeResumeCta";
import DifficultyPill from "./DifficultyPill";
import type { Tutorial } from "@/lib/tutorials/types";

const ROMAN = ["I","II","III","IV","V","VI","VII","VIII","IX","X","XI","XII"];

type Props = { tutorials: Tutorial[] };

export default function HomeTopicFilter({ tutorials }: Props) {
  const allTopics = useMemo(() => {
    const s = new Set<string>();
    tutorials.forEach((t) => t.topics.forEach((tp) => s.add(tp)));
    return ["All", ...Array.from(s).sort()];
  }, [tutorials]);

  const [active, setActive] = useState<string>("All");
  const filtered = active === "All"
    ? tutorials
    : tutorials.filter((t) => t.topics.includes(active));

  // Hide the filter chip row when the library is small (≤3 tutorials).
  const showFilter = tutorials.length > 3;

  // Group filtered by category
  const groups = new Map<string, Tutorial[]>();
  for (const t of filtered) {
    const list = groups.get(t.category) ?? [];
    list.push(t);
    groups.set(t.category, list);
  }
  const grouped = Array.from(groups, ([category, items]) => ({ category, items }));

  let pageIndex = 0;

  return (
    <>
      {showFilter && (
        <div className="topic-filter-row" role="tablist" aria-label="Filter by topic">
          {allTopics.map((tp) => (
            <button
              key={tp}
              role="tab"
              aria-selected={active === tp}
              className={"topic-filter-chip" + (active === tp ? " is-active" : "")}
              onClick={() => setActive(tp)}
            >
              {tp}
            </button>
          ))}
        </div>
      )}
      {grouped.map(({ category, items }) => (
        <div key={category} className="toc-category">
          <h3 className="toc-category-heading">{category}</h3>
          <ol className="toc-list" role="list">
            {items.map((t) => {
              const i = pageIndex++;
              return (
                <li key={t.slug} className="toc-item" style={{ ['--i' as never]: i }}>
                  <Link href={`/tutorials/${t.slug}`} className="toc-link">
                    <span className="toc-numeral" aria-hidden>{ROMAN[i] ?? String(i + 1)}.</span>
                    <span className="toc-body">
                      <span className="toc-title-row">
                        <h3 className="toc-title">{t.title}</h3>
                        <span className="toc-leader" aria-hidden />
                        <span className="toc-page">
                          p.&nbsp;{String((i + 1) * 7).padStart(3, "0")}
                          <HomeProgressTags tutorial={t} />
                        </span>
                      </span>
                      <p className="toc-desc">{t.description}</p>
                      {t.prerequisites && t.prerequisites.length > 0 && (
                        <p className="toc-prereq">
                          Reads after:{" "}
                          {t.prerequisites.map((slug, idx) => {
                            const prev = tutorials.find((x) => x.slug === slug);
                            if (!prev) return null;
                            return (
                              <span key={slug}>
                                {idx > 0 && ", "}
                                <Link href={`/tutorials/${prev.slug}`}>{prev.title}</Link>
                              </span>
                            );
                          })}
                        </p>
                      )}
                      <span className="toc-meta">
                        <span className="toc-meta-pill duration">{t.duration}</span>
                        <DifficultyPill level={t.difficulty} />
                        {t.topics.map((topic) => (
                          <span key={topic} className="toc-meta-pill">{topic}</span>
                        ))}
                        <HomeResumeCta tutorial={t} />
                      </span>
                    </span>
                  </Link>
                </li>
              );
            })}
          </ol>
        </div>
      ))}
    </>
  );
}
