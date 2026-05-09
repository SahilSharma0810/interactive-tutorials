"use client";

import React, { useEffect, useState } from "react";
import { useProgress, type QuizAttempt } from "@/lib/progress";

export type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
  explain: string;
};

type Props = {
  questions: QuizQuestion[];
  /** Required for persistence; if absent, the quiz works in-memory only. */
  tutorialSlug?: string;
  /** Required for persistence; identifies the chapter that owns this quiz. */
  chapterId?: string;
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

type PerQuestionState = {
  attempts: { selectedIdx: number; correct: boolean }[];
  locked: boolean;       // true once a correct answer is selected
};

function emptyState(n: number): PerQuestionState[] {
  return Array.from({ length: n }, () => ({ attempts: [], locked: false }));
}

export default function Quiz({ questions, tutorialSlug, chapterId }: Props) {
  const [state, setState] = useState<PerQuestionState[]>(() => emptyState(questions.length));
  const { progress, recordQuizAttempt, markCompleted } = useProgress(tutorialSlug ?? "");

  // Restore from persistence on mount
  useEffect(() => {
    if (!tutorialSlug || !progress) return;
    const restored = emptyState(questions.length);
    for (const a of progress.quizAttempts) {
      if (a.questionIdx < 0 || a.questionIdx >= questions.length) continue;
      const ps = restored[a.questionIdx];
      ps.attempts.push({ selectedIdx: a.selectedIdx, correct: a.correct });
      if (a.correct) ps.locked = true;
    }
    setState(restored);
  }, [tutorialSlug, progress, questions.length]);

  const select = (qIdx: number, oIdx: number) => {
    setState((prev) => {
      const ps = prev[qIdx];
      if (ps.locked) return prev;
      // Skip duplicate clicks on an option already tried for this question
      if (ps.attempts.some((a) => a.selectedIdx === oIdx)) return prev;
      const correct = oIdx === questions[qIdx].correct;
      const nextPs: PerQuestionState = {
        attempts: [...ps.attempts, { selectedIdx: oIdx, correct }],
        locked: correct ? true : ps.locked,
      };
      const next = [...prev];
      next[qIdx] = nextPs;
      return next;
    });

    if (tutorialSlug) {
      const attemptNum = (state[qIdx]?.attempts.length ?? 0) + 1;
      const correct = oIdx === questions[qIdx].correct;
      const att: QuizAttempt = {
        questionIdx: qIdx,
        selectedIdx: oIdx,
        correct,
        attempt: attemptNum,
        ts: Date.now(),
      };
      recordQuizAttempt(att);
      if (correct && chapterId) markCompleted(chapterId);
    }
  };

  const reset = () => setState(emptyState(questions.length));

  // Running scores
  const firstTryCorrect = state.reduce((acc, ps) => {
    return acc + (ps.attempts[0]?.correct ? 1 : 0);
  }, 0);
  const eventuallyCorrect = state.filter((ps) => ps.locked).length;
  const allLocked = state.every((ps) => ps.locked);

  let scoreMessage = "";
  const pct = firstTryCorrect / questions.length;
  if (pct === 1) scoreMessage = "Perfect — you've got the whole picture.";
  else if (pct >= 0.7) scoreMessage = "Strong understanding. Review the misses and you're set.";
  else if (pct >= 0.4) scoreMessage = "A solid start. Re-skim the operation walkthroughs.";
  else scoreMessage = "Worth another pass. The visual demos are the fastest way to lock it in.";

  return (
    <div>
      <div className="quiz-running-score" role="status" aria-live="polite">
        <span className="quiz-running-score-label">Progress</span>
        <span className="quiz-running-score-value">
          {eventuallyCorrect} / {questions.length} answered · {firstTryCorrect} first-try correct
        </span>
      </div>

      {questions.map((q, qi) => {
        const ps = state[qi];
        const triedIdxs = new Set(ps.attempts.map((a) => a.selectedIdx));
        const showCorrect = ps.attempts.length > 0 && !ps.locked
          ? true   // immediately reveal correct after first wrong attempt
          : ps.locked;

        return (
          <div className="quiz-q" key={qi}>
            <h4>
              <span className="q-num">Q{qi + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: q.q }} />
            </h4>
            <div className="quiz-options">
              {q.options.map((opt, oi) => {
                let cls = "quiz-opt";
                if (triedIdxs.has(oi)) {
                  if (oi === q.correct) cls += " correct";
                  else cls += " wrong";
                }
                if (showCorrect && oi === q.correct && !triedIdxs.has(oi)) {
                  cls += " kcr-reveal";
                }
                if (ps.locked) cls += " disabled";
                return (
                  <button
                    key={oi}
                    className={cls}
                    onClick={() => select(qi, oi)}
                    aria-pressed={triedIdxs.has(oi) ? "true" : undefined}
                  >
                    <span className="marker">{LETTERS[oi]}</span>
                    <span dangerouslySetInnerHTML={{ __html: opt }} />
                  </button>
                );
              })}
            </div>
            <div
              className="quiz-feedback"
              role="status"
              aria-live="polite"
              aria-atomic="true"
              hidden={ps.attempts.length === 0}
              style={ps.attempts.length === 0 ? { display: "none" } : undefined}
            >
              {ps.attempts.length > 0 && (
                <>
                  {ps.locked ? (
                    <strong style={{ color: "var(--accent-2)" }}>✓ Correct.</strong>
                  ) : (
                    <strong style={{ color: "var(--accent)" }}>
                      ✗ Not quite — the correct answer is highlighted.
                    </strong>
                  )}{" "}
                  <span dangerouslySetInnerHTML={{ __html: q.explain }} />
                </>
              )}
            </div>
          </div>
        );
      })}

      {allLocked && (
        <div className="quiz-score">
          <div className="big">
            <span>{firstTryCorrect}</span>
            <span className="denom">/{questions.length}</span>
          </div>
          <p
            style={{
              margin: "16px 0 0",
              fontFamily: "var(--mono)",
              fontSize: 13,
              letterSpacing: ".08em",
              textTransform: "uppercase",
            }}
          >
            {scoreMessage}
          </p>
          <p style={{ margin: "8px 0 0", fontSize: 13, color: "var(--muted-on-dark)" }}>
            {firstTryCorrect} on first try · {eventuallyCorrect} after retries
          </p>
          <button
            className="btn ghost"
            onClick={reset}
            style={{
              marginTop: 22,
              background: "transparent",
              color: "var(--paper)",
              borderColor: "var(--paper)",
            }}
          >
            ⟲ Try again
          </button>
        </div>
      )}
    </div>
  );
}
