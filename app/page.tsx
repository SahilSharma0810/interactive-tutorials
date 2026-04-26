import Link from "next/link";
import Nav from "@/components/Nav";
import { tutorials } from "@/lib/tutorials/registry";

const ROMAN = ["I", "II", "III", "IV", "V", "VI", "VII", "VIII", "IX", "X", "XI", "XII"];

export default function Home() {
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
            <ol className="toc-list" role="list">
              {tutorials.map((t, i) => (
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
                        </span>
                      </span>
                      <p className="toc-desc">{t.description}</p>
                      <span className="toc-meta">
                        <span className="toc-meta-pill duration">{t.duration}</span>
                        {t.topics.map((topic) => (
                          <span key={topic} className="toc-meta-pill">
                            {topic}
                          </span>
                        ))}
                        <span className="toc-cta">
                          Begin reading <span aria-hidden>→</span>
                        </span>
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ol>
          )}
        </section>

        <Asterism />

        {/* ============ COLOPHON / BUILD YOUR OWN ============ */}
        <section className="section colophon">
          <div className="colophon-grid">
            <aside className="colophon-aside" aria-hidden>
              <div className="colophon-mark">¶</div>
              <div className="colophon-aside-label">Colophon</div>
            </aside>
            <div className="colophon-body">
              <div className="eyebrow">Adding more</div>
              <h2>
                Build your own <em>lesson.</em>
              </h2>
              <p className="lede">
                Each tutorial is a single React component plus a metadata file.
                The shared visualization library — heap diagrams, step
                controllers, quizzes — is yours to compose.
              </p>

              <ol className="feature-row" role="list">
                <li className="feature">
                  <div className="feature-numeral">i.</div>
                  <h4>Author</h4>
                  <p>
                    Create{" "}
                    <code className="inline">
                      lib/tutorials/&lt;slug&gt;/Tutorial.tsx
                    </code>{" "}
                    as a React component.
                  </p>
                </li>
                <li className="feature">
                  <div className="feature-numeral">ii.</div>
                  <h4>Describe</h4>
                  <p>
                    Add a <code className="inline">meta.ts</code> with title,
                    description, duration, and topics.
                  </p>
                </li>
                <li className="feature">
                  <div className="feature-numeral">iii.</div>
                  <h4>Register</h4>
                  <p>
                    Import both into{" "}
                    <code className="inline">lib/tutorials/registry.ts</code>{" "}
                    and you&rsquo;re done.
                  </p>
                </li>
              </ol>
            </div>
          </div>
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
