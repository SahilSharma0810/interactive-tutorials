"use client";

import { useEffect, useRef, useState } from "react";

export default function ReadingProgressBar() {
  const [pct, setPct] = useState(0);
  const ticking = useRef(false);

  useEffect(() => {
    const onScroll = () => {
      if (ticking.current) return;
      ticking.current = true;
      requestAnimationFrame(() => {
        const max = document.documentElement.scrollHeight - window.innerHeight;
        const next = max > 0 ? Math.min(1, Math.max(0, window.scrollY / max)) : 0;
        setPct(next);
        ticking.current = false;
      });
    };
    onScroll();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
    };
  }, []);

  // Hide the bar over the hero (cleaner first impression)
  const hidden = pct === 0;

  return (
    <div
      className={"reading-progress" + (hidden ? " is-hidden" : "")}
      role="progressbar"
      aria-label="Reading progress"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct * 100)}
    >
      <div className="reading-progress-fill" style={{ transform: `scaleX(${pct})` }} />
    </div>
  );
}
