import Link from "next/link";
import Nav from "@/components/Nav";
import { tutorials } from "@/lib/tutorials/registry";
import type { Tutorial } from "@/lib/tutorials/types";
import DifficultyPill from "@/components/DifficultyPill";
import HomeProgressTags from "@/components/HomeProgressTags";
import HomeResumeCta from "@/components/HomeResumeCta";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

function groupByCategory(items: Tutorial[]): { category: string; items: Tutorial[] }[] {
  const groups = new Map<string, Tutorial[]>();
  for (const t of items) {
    const list = groups.get(t.category) ?? [];
    list.push(t);
    groups.set(t.category, list);
  }
  return Array.from(groups, ([category, items]) => ({ category, items }));
}

export default function Home() {
  const grouped = groupByCategory(tutorials);
  let pageIndex = 0;
  return (
    <>
      <Nav />
      <main id="main">
        {/* ============ HERO / COVER ============ */}
        <section className="section hero cover">
          <div className="cover-meta">
            <span className="cover-meta-l">Vol.&nbsp;I · № 01</span>
            <span className="cover-meta-r">MMXXVI</span>
          </div>

          <div className="cover-rule" aria-hidden />

          <div className="cover-eyebrow">
            Periodicals on Computation
          </div>

          <h1 className="cover-title">
            <span className="line line-1">Computer&nbsp;science</span>
            <span className="line line-2">you&nbsp;can <span className="ital">touch.</span></span>
          </h1>

          <p className="lede cover-lede">
            Step-through visualizations, hands-on sandboxes, and short quizzes —
            built so the abstract bits become unmistakably concrete. Pick a
            tutorial and dig in.
          </p>

          <div className="cover-foot" aria-hidden>
            <span>A library of interactive lessons</span>
          </div>
        </section>

        <Asterism />

        {(() => {
          const recommended = tutorials.find((t) => t.recommendedFirst);
          if (!recommended) return null;
          return (
            <section className="section start-here">
              <div className="eyebrow">Start here</div>
              <Link href={`/tutorials/${recommended.slug}`} className="card start-here-card">
                <div>
                  <h3>{recommended.title}</h3>
                  <p>{recommended.description}</p>
                </div>
                <div className="start-here-cta">
                  Begin reading <span aria-hidden>→</span>
                </div>
              </Link>
            </section>
          );
        })()}

        {/* ============ TABLE OF CONTENTS ============ */}
        <section className="section toc-section">
          <div className="section-header">
            <div className="eyebrow">The library</div>
            <h2>
              Table of <em>contents.</em>
            </h2>
            <p className="lede section-lede">
              {tutorials.length === 0
                ? "Nothing has been set in type yet."
                : `${String(tutorials.length).padStart(2, "0")} ${tutorials.length === 1 ? "lesson" : "lessons"} bound into this edition.`}
            </p>
          </div>

          {tutorials.length === 0 ? (
            <div className="empty-state">
              <h3>No tutorials yet.</h3>
              <p>
                Add one in <code className="inline">lib/tutorials/registry.ts</code>.
              </p>
            </div>
          ) : (
            grouped.map(({ category, items }) => (
              <div key={category} className="toc-category">
                <h3 className="toc-category-heading">{category}</h3>
                <ol className="toc-list" role="list">
                  {items.map((t) => {
                    const i = pageIndex++;
                    return (
                      <li key={t.slug} className="toc-item" style={{ ['--i' as never]: i }}>
                        <Link href={`/tutorials/${t.slug}`} className="toc-link">
                          <span className="toc-numeral" aria-hidden>
                            {ROMAN[i] ?? String(i + 1)}.
                          </span>
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
                                {t.prerequisites.map((slug, i) => {
                                  const prev = tutorials.find((x) => x.slug === slug);
                                  if (!prev) return null;
                                  return (
                                    <span key={slug}>
                                      {i > 0 && ", "}
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
                                <span key={topic} className="toc-meta-pill">
                                  {topic}
                                </span>
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
            ))
          )}
        </section>

      </main>

      <footer>
        <div className="ornament">— fin —</div>
        <p>An interactive learning library.</p>
        <p className="footer-imprint">
          Set in Fraunces &amp; Newsreader · Printed in the browser, MMXXVI
        </p>
      </footer>
    </>
  );
}

function Asterism() {
  return (
    <div className="asterism" role="separator" aria-hidden>
      <span>✦</span>
      <span>✦</span>
      <span>✦</span>
    </div>
  );
}
