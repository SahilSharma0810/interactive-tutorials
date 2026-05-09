"use client";

import { useEffect, useState, useCallback } from "react";

const STORAGE_KEY = "tangible:progress:v1";
const DEBOUNCE_MS = 250;

export type QuizAttempt = {
  questionIdx: number;
  selectedIdx: number;
  correct: boolean;
  attempt: number;
  ts: number;
};

export type TutorialProgress = {
  slug: string;
  visitedChapters: string[];
  completedChapters: string[];
  lastChapterId?: string;
  quizAttempts: QuizAttempt[];
  startedAt: number;
  updatedAt: number;
};

export type ProgressStore = {
  v: 1;
  tutorials: Record<string, TutorialProgress>;
};

const EMPTY_STORE: ProgressStore = { v: 1, tutorials: {} };

// --- internal cache + persistence ---

let cache: ProgressStore | undefined;
let pendingWrite: ReturnType<typeof setTimeout> | null = null;

function isBrowser(): boolean {
  return typeof window !== "undefined" && typeof window.localStorage !== "undefined";
}

function load(): ProgressStore {
  if (cache) return cache;
  if (!isBrowser()) {
    cache = structuredClone(EMPTY_STORE);
    return cache;
  }
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) {
      cache = structuredClone(EMPTY_STORE);
      return cache;
    }
    const parsed = JSON.parse(raw);
    if (!parsed || parsed.v !== 1 || typeof parsed.tutorials !== "object") {
      cache = structuredClone(EMPTY_STORE);
      return cache;
    }
    cache = parsed as ProgressStore;
    return cache;
  } catch {
    cache = structuredClone(EMPTY_STORE);
    return cache;
  }
}

function persist(): void {
  if (!isBrowser()) return;
  if (pendingWrite) clearTimeout(pendingWrite);
  pendingWrite = setTimeout(() => {
    pendingWrite = null;
    try {
      window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache ?? EMPTY_STORE));
      // Same-tab notification
      bus.dispatchEvent(new Event("progress-changed"));
    } catch (e) {
      console.warn("[progress] failed to persist", e);
    }
  }, DEBOUNCE_MS);
}

function ensureTutorial(slug: string): TutorialProgress {
  const store = load();
  let t = store.tutorials[slug];
  if (!t) {
    const now = Date.now();
    t = {
      slug,
      visitedChapters: [],
      completedChapters: [],
      quizAttempts: [],
      startedAt: now,
      updatedAt: now,
    };
    store.tutorials[slug] = t;
  }
  return t;
}

// --- public API ---

export function getProgress(slug: string): TutorialProgress | undefined {
  return load().tutorials[slug];
}

export function getAllProgress(): ProgressStore {
  return load();
}

export function hasAnyProgress(): boolean {
  return Object.keys(load().tutorials).length > 0;
}

export function markVisited(slug: string, chapterId: string): void {
  const t = ensureTutorial(slug);
  if (!t.visitedChapters.includes(chapterId)) {
    t.visitedChapters.push(chapterId);
  }
  t.lastChapterId = chapterId;
  t.updatedAt = Date.now();
  persist();
}

export function markCompleted(slug: string, chapterId: string): void {
  const t = ensureTutorial(slug);
  if (!t.completedChapters.includes(chapterId)) {
    t.completedChapters.push(chapterId);
  }
  if (!t.visitedChapters.includes(chapterId)) {
    t.visitedChapters.push(chapterId);
  }
  t.updatedAt = Date.now();
  persist();
}

export function recordQuizAttempt(slug: string, attempt: QuizAttempt): void {
  const t = ensureTutorial(slug);
  t.quizAttempts.push(attempt);
  t.updatedAt = Date.now();
  persist();
}

export function clearTutorial(slug: string): void {
  const store = load();
  delete store.tutorials[slug];
  persist();
}

export function clearAll(): void {
  cache = structuredClone(EMPTY_STORE);
  persist();
}

// --- React hook ---

const bus = isBrowser() ? new EventTarget() : ({ addEventListener: () => {}, removeEventListener: () => {}, dispatchEvent: () => true } as unknown as EventTarget);

export function useProgress(slug: string) {
  const [tick, setTick] = useState(0);

  useEffect(() => {
    const onChange = () => setTick((n) => n + 1);
    bus.addEventListener("progress-changed", onChange);
    if (isBrowser()) window.addEventListener("storage", (e) => {
      if (e.key === STORAGE_KEY) {
        cache = undefined; // force reload
        onChange();
      }
    });
    // Trigger one re-read after mount to hydrate from storage (avoids SSR mismatch).
    setTick((n) => n + 1);
    return () => {
      bus.removeEventListener("progress-changed", onChange);
    };
  }, []);

  const progress = isBrowser() ? getProgress(slug) : undefined;

  return {
    progress,
    markVisited: useCallback((chapterId: string) => markVisited(slug, chapterId), [slug]),
    markCompleted: useCallback((chapterId: string) => markCompleted(slug, chapterId), [slug]),
    recordQuizAttempt: useCallback((a: QuizAttempt) => recordQuizAttempt(slug, a), [slug]),
    reset: useCallback(() => clearTutorial(slug), [slug]),
    _tick: tick,  // referenced to keep TS happy; consumers ignore
  };
}

// --- test-only helpers ---

export function __resetForTest(opts?: { keepStorage?: boolean }): void {
  cache = undefined;
  if (pendingWrite) {
    clearTimeout(pendingWrite);
    pendingWrite = null;
  }
  if (!opts?.keepStorage && isBrowser()) {
    try { window.localStorage.removeItem(STORAGE_KEY); } catch {}
  }
}

export function __flushPendingWrites(): void {
  if (pendingWrite) {
    clearTimeout(pendingWrite);
    pendingWrite = null;
    if (isBrowser()) {
      try {
        window.localStorage.setItem(STORAGE_KEY, JSON.stringify(cache ?? EMPTY_STORE));
      } catch {}
    }
  }
}
