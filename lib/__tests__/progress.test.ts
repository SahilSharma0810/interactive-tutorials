// Run with: npm run test:progress
// No framework — exits 0 on success, 1 on failure.

import assert from "node:assert/strict";

// Minimal in-memory localStorage shim, attached to globalThis so
// progress.ts uses it as if it were the browser's localStorage.
class MemoryStorage {
  private store = new Map<string, string>();
  getItem(k: string) { return this.store.has(k) ? this.store.get(k)! : null; }
  setItem(k: string, v: string) { this.store.set(k, v); }
  removeItem(k: string) { this.store.delete(k); }
  clear() { this.store.clear(); }
  key(i: number) { return Array.from(this.store.keys())[i] ?? null; }
  get length() { return this.store.size; }
}

(globalThis as any).window = globalThis;
(globalThis as any).localStorage = new MemoryStorage();
// Minimal EventTarget polyfill for cross-tab event simulation
(globalThis as any).addEventListener = () => {};
(globalThis as any).removeEventListener = () => {};

// Importing AFTER the shim is installed
import {
  getProgress,
  getAllProgress,
  hasAnyProgress,
  markVisited,
  markCompleted,
  recordQuizAttempt,
  clearTutorial,
  clearAll,
  __resetForTest,
  __flushPendingWrites,
} from "../progress";

const tests: { name: string; fn: () => void | Promise<void> }[] = [];
function test(name: string, fn: () => void | Promise<void>) {
  tests.push({ name, fn });
}

test("getProgress returns undefined for unknown slug", () => {
  __resetForTest();
  assert.equal(getProgress("nope"), undefined);
});

test("hasAnyProgress is false on a fresh store", () => {
  __resetForTest();
  assert.equal(hasAnyProgress(), false);
});

test("markVisited creates a record and adds the chapter", () => {
  __resetForTest();
  markVisited("event-loop", "intro");
  __flushPendingWrites();
  const p = getProgress("event-loop")!;
  assert.equal(p.slug, "event-loop");
  assert.deepEqual(p.visitedChapters, ["intro"]);
  assert.equal(p.lastChapterId, "intro");
  assert.equal(typeof p.startedAt, "number");
});

test("markVisited is idempotent for the same chapter", () => {
  __resetForTest();
  markVisited("x", "a");
  markVisited("x", "a");
  __flushPendingWrites();
  assert.deepEqual(getProgress("x")!.visitedChapters, ["a"]);
});

test("markCompleted promotes a chapter and stays in completedChapters", () => {
  __resetForTest();
  markCompleted("x", "quiz");
  __flushPendingWrites();
  const p = getProgress("x")!;
  assert.deepEqual(p.completedChapters, ["quiz"]);
  // Re-completing is idempotent
  markCompleted("x", "quiz");
  __flushPendingWrites();
  assert.deepEqual(getProgress("x")!.completedChapters, ["quiz"]);
});

test("recordQuizAttempt appends with monotonically growing attempt counter per question", () => {
  __resetForTest();
  recordQuizAttempt("x", { questionIdx: 0, selectedIdx: 1, correct: false, attempt: 1, ts: 1 });
  recordQuizAttempt("x", { questionIdx: 0, selectedIdx: 2, correct: true, attempt: 2, ts: 2 });
  recordQuizAttempt("x", { questionIdx: 1, selectedIdx: 0, correct: true, attempt: 1, ts: 3 });
  __flushPendingWrites();
  const attempts = getProgress("x")!.quizAttempts;
  assert.equal(attempts.length, 3);
  assert.equal(attempts[0].questionIdx, 0);
  assert.equal(attempts[1].correct, true);
  assert.equal(attempts[2].questionIdx, 1);
});

test("clearTutorial removes only the named tutorial", () => {
  __resetForTest();
  markVisited("a", "ch1");
  markVisited("b", "ch1");
  __flushPendingWrites();
  clearTutorial("a");
  __flushPendingWrites();
  assert.equal(getProgress("a"), undefined);
  assert.notEqual(getProgress("b"), undefined);
});

test("clearAll wipes everything", () => {
  __resetForTest();
  markVisited("a", "ch1");
  markVisited("b", "ch1");
  __flushPendingWrites();
  clearAll();
  __flushPendingWrites();
  assert.equal(hasAnyProgress(), false);
});

test("getAllProgress returns the full store with version tag", () => {
  __resetForTest();
  markVisited("a", "ch1");
  __flushPendingWrites();
  const all = getAllProgress();
  assert.equal(all.v, 1);
  assert.equal(typeof all.tutorials, "object");
  assert.equal(all.tutorials.a.slug, "a");
});

test("on-disk JSON survives a round-trip via fresh module re-read", () => {
  __resetForTest();
  markVisited("a", "ch1");
  __flushPendingWrites();
  // Simulate a reload by re-resetting the in-memory cache (without clearing storage)
  __resetForTest({ keepStorage: true });
  const p = getProgress("a");
  assert.equal(p?.slug, "a");
  assert.deepEqual(p?.visitedChapters, ["ch1"]);
});

test("corrupt JSON in storage falls back to a fresh empty store", () => {
  __resetForTest();
  (globalThis as any).localStorage.setItem("tangible:progress:v1", "not-valid-json{");
  __resetForTest({ keepStorage: true });
  assert.equal(hasAnyProgress(), false);
  // Subsequent writes still work
  markVisited("x", "y");
  __flushPendingWrites();
  assert.notEqual(getProgress("x"), undefined);
});

test("quota-exceeded write does not throw and the in-memory state still updates", () => {
  __resetForTest();
  const real = (globalThis as any).localStorage.setItem.bind((globalThis as any).localStorage);
  (globalThis as any).localStorage.setItem = () => { throw new Error("QuotaExceeded"); };
  markVisited("a", "ch1");
  __flushPendingWrites();   // should NOT throw
  // Restore so the next test doesn't blow up
  (globalThis as any).localStorage.setItem = real;
  // In-memory write succeeded
  assert.deepEqual(getProgress("a")?.visitedChapters, ["ch1"]);
});

test("malformed inner shape entries are dropped on load, store remains usable", () => {
  __resetForTest();
  // Write a parseable but malformed entry directly to storage
  (globalThis as any).localStorage.setItem(
    "tangible:progress:v1",
    JSON.stringify({
      v: 1,
      tutorials: {
        bad: { slug: "bad", visitedChapters: "not-an-array" },
        good: {
          slug: "good",
          visitedChapters: ["ch1"],
          completedChapters: [],
          quizAttempts: [],
          startedAt: 1,
          updatedAt: 1,
        },
      },
    })
  );
  __resetForTest({ keepStorage: true });
  // The malformed entry is dropped; the good one survives.
  assert.equal(getProgress("bad"), undefined);
  assert.deepEqual(getProgress("good")?.visitedChapters, ["ch1"]);
  // Subsequent writes still work — append a new tutorial without throwing.
  markVisited("new", "ch1");
  __flushPendingWrites();
  assert.deepEqual(getProgress("new")?.visitedChapters, ["ch1"]);
});

(async () => {
  let failed = 0;
  for (const { name, fn } of tests) {
    try {
      await fn();
      console.log(`✓ ${name}`);
    } catch (e) {
      failed++;
      console.error(`✗ ${name}`);
      console.error(e);
    }
  }
  if (failed > 0) {
    console.error(`\n${failed} test(s) failed`);
    process.exit(1);
  }
  console.log(`\nAll ${tests.length} tests passed.`);
})();
