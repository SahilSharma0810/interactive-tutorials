import Link from "next/link";
import Nav from "@/components/Nav";
import { tutorials } from "@/lib/tutorials/registry";
import HomeTopicFilter from "@/components/HomeTopicFilter";
import ResetProgressLink from "@/components/ResetProgressLink";

export default function Home() {
  return (
    <>
      <Nav />
      <main id="main">
        {/* ============ HERO / COVER ============ */}
        <section className="section hero cover">
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
            <HomeTopicFilter tutorials={tutorials} />
          )}
        </section>

      </main>

      <footer>
        <div className="ornament">— fin —</div>
        <p>An interactive learning library.</p>
        <p className="footer-imprint">
          Set in Fraunces &amp; Newsreader · Printed in the browser, MMXXVI
        </p>
        <div style={{ marginTop: 14 }}>
          <ResetProgressLink />
        </div>
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
