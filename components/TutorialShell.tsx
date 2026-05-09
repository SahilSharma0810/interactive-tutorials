"use client";

import { useEffect, useRef, useState, ReactNode } from "react";
import { createRoot, type Root } from "react-dom/client";
import Nav from "@/components/Nav";
import RailToc from "@/components/RailToc";
import ReadingProgressBar from "@/components/ReadingProgressBar";
import MobileChapterMenu from "@/components/MobileChapterMenu";
import NextChapterCTA from "@/components/NextChapterCTA";
import { useProgress } from "@/lib/progress";
import type { TutorialMeta } from "@/lib/tutorials/types";

type Props = {
  meta: TutorialMeta;
  children: ReactNode;
};

const VISIT_THROTTLE_MS = 2000;

export default function TutorialShell({ meta, children }: Props) {
  const [activeId, setActiveId] = useState<string | null>(meta.chapters[0]?.id ?? null);
  const lastMarkedRef = useRef<{ id: string; ts: number } | null>(null);
  const { markVisited, markCompleted } = useProgress(meta.slug);

  const navLinks = meta.chapters.map((c) => ({ href: "#" + c.id, label: c.label }));

  // Scroll-spy: observe each section[data-chapter-id]
  useEffect(() => {
    if (typeof window === "undefined") return;
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[data-chapter-id]")
    );
    if (sections.length === 0) return;

    const observer = new IntersectionObserver(
      (entries) => {
        // Choose the entry closest to the top of the upper viewport band
        const visible = entries
          .filter((e) => e.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible.length === 0) return;
        const id = visible[0].target.getAttribute("data-chapter-id");
        if (!id) return;
        setActiveId(id);
      },
      { rootMargin: "-30% 0% -65% 0%", threshold: [0, 0.1, 0.25, 0.5, 1] }
    );
    sections.forEach((s) => observer.observe(s));
    return () => observer.disconnect();
  }, [meta.slug]);

  // Mark visited (throttled per chapter)
  useEffect(() => {
    if (!activeId) return;
    const now = Date.now();
    const last = lastMarkedRef.current;
    if (last && last.id === activeId && now - last.ts < VISIT_THROTTLE_MS) return;
    const t = setTimeout(() => {
      markVisited(activeId);
      lastMarkedRef.current = { id: activeId, ts: Date.now() };
      // Auto-complete chapters with no interactives: any chapter that is NOT the quiz/playground
      // is completed once the reader has paused on it (the 2s dwell already proven).
      const isInteractive = activeId === "quiz" || activeId === "playground";
      if (!isInteractive) markCompleted(activeId);
    }, VISIT_THROTTLE_MS);
    return () => clearTimeout(t);
  }, [activeId, markVisited, markCompleted]);

  // Click handler from rail/mobile that updates active immediately (avoid 1-frame flicker)
  const handleJump = (id: string) => setActiveId(id);

  // Inject NextChapterCTA at the end of each section[data-chapter-id]
  useEffect(() => {
    const sections = Array.from(
      document.querySelectorAll<HTMLElement>("section[data-chapter-id]")
    );
    const roots: Root[] = [];
    sections.forEach((section, i) => {
      // Avoid double-injecting on hot reload
      const existing = section.querySelector(":scope > .next-chapter-mount");
      let mount: HTMLElement;
      if (existing) {
        mount = existing as HTMLElement;
      } else {
        mount = document.createElement("div");
        mount.className = "next-chapter-mount";
        section.appendChild(mount);
      }
      const next = meta.chapters[i + 1];
      const root = createRoot(mount);
      roots.push(root);
      if (next) {
        root.render(
          <NextChapterCTA nextLabel={next.title ?? next.label} nextHref={"#" + next.id} />
        );
      } else {
        root.render(
          <div className="next-chapter-cta">
            <a href="#main">Back to top <span aria-hidden>↑</span></a>
          </div>
        );
      }
    });
    return () => {
      roots.forEach((r) => r.unmount());
    };
  }, [meta.chapters]);

  // Heading anchor link click → copy URL with hash
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      const target = e.target as HTMLElement;
      const link = target.closest<HTMLAnchorElement>("a.heading-anchor");
      if (!link) return;
      e.preventDefault();
      const href = link.getAttribute("href") || "";
      const url = window.location.origin + window.location.pathname + href;
      try { navigator.clipboard?.writeText(url); } catch {}
      window.history.replaceState(null, "", href);
      const id = href.replace(/^#/, "");
      const target2 = document.getElementById(id);
      if (target2) target2.scrollIntoView({ behavior: "smooth", block: "start" });
    };
    document.addEventListener("click", onClick);
    return () => document.removeEventListener("click", onClick);
  }, []);

  return (
    <>
      <Nav links={navLinks} activeAnchor={activeId} />
      <ReadingProgressBar />
      <div className="tutorial-shell">
        <aside className="tutorial-shell-rail">
          <RailToc
            slug={meta.slug}
            chapters={meta.chapters}
            activeId={activeId}
            onJump={handleJump}
          />
        </aside>
        <div className="tutorial-shell-main">
          {children}
        </div>
      </div>
      <MobileChapterMenu
        slug={meta.slug}
        chapters={meta.chapters}
        activeId={activeId}
        onJump={handleJump}
      />
    </>
  );
}
