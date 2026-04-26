"use client";

import React, { useState } from "react";

export type QuizQuestion = {
  q: string;
  options: string[];
  correct: number;
  explain: string;
};

type Props = {
  questions: QuizQuestion[];
};

const LETTERS = ["A", "B", "C", "D", "E", "F"];

export default function Quiz({ questions }: Props) {
  // Per-question selected answer (or null if unanswered)
  const [answers, setAnswers] = useState<(number | null)[]>(
    () => questions.map(() => null)
  );

  const score = answers.reduce(
    (acc, ans, i) => acc + (ans === questions[i].correct ? 1 : 0),
    0
  );
  const allAnswered = answers.every((a) => a !== null);

  const select = (qIdx: number, oIdx: number) => {
    if (answers[qIdx] != null) return; // already answered
    setAnswers((prev) => {
      const next = [...prev];
      next[qIdx] = oIdx;
      return next;
    });
  };

  const reset = () => setAnswers(questions.map(() => null));

  let scoreMessage = "";
  const pct = score / questions.length;
  if (pct === 1) scoreMessage = "Perfect — you've got the whole picture.";
  else if (pct >= 0.7) scoreMessage = "Strong understanding. Review the misses and you're set.";
  else if (pct >= 0.4) scoreMessage = "A solid start. Re-skim the operation walkthroughs.";
  else scoreMessage = "Worth another pass. The visual demos are the fastest way to lock it in.";

  return (
    <div>
      {questions.map((q, qi) => {
        const ans = answers[qi];
        return (
          <div className="quiz-q" key={qi}>
            <h4>
              <span className="q-num">Q{qi + 1}.</span>
              <span dangerouslySetInnerHTML={{ __html: q.q }} />
            </h4>
            <div className="quiz-options">
              {q.options.map((opt, oi) => {
                let cls = "quiz-opt";
                if (ans != null) cls += " disabled";
                if (ans != null) {
                  if (oi === q.correct) cls += " correct";
                  else if (oi === ans) cls += " wrong";
                }
                return (
                  <button
                    key={oi}
                    className={cls}
                    onClick={() => select(qi, oi)}
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
              hidden={ans == null}
              style={ans == null ? { display: "none" } : undefined}
            >
              {ans != null && (
                <>
                  {ans === q.correct ? (
                    <strong style={{ color: "var(--accent-2)" }}>✓ Correct.</strong>
                  ) : (
                    <strong style={{ color: "var(--accent)" }}>✗ Not quite.</strong>
                  )}{" "}
                  <span dangerouslySetInnerHTML={{ __html: q.explain }} />
                </>
              )}
            </div>
          </div>
        );
      })}

      {allAnswered && (
        <div className="quiz-score">
          <div className="big">
            <span>{score}</span>
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
