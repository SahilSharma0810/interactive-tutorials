"use client";

import React, { useState } from "react";
import TutorialShell from "@/components/TutorialShell";
import { meta } from "./meta";
import HeapSvg from "@/components/HeapSvg";
import MinMaxToggle from "@/components/MinMaxToggle";
import ArrayLinkingDemo from "@/components/ArrayLinkingDemo";
import StepWalkthrough from "@/components/StepWalkthrough";
import HeapPlayground from "@/components/HeapPlayground";
import Quiz, { QuizQuestion } from "@/components/Quiz";
import {
  insertSteps,
  heapifySteps,
  getMinSteps,
  extractMinSteps,
  decreaseKeySteps,
  deleteSteps,
} from "./steps";

const OPERATIONS = [
  { key: "insert",      label: "Insert" },
  { key: "heapify",     label: "Heapify" },
  { key: "getmin",      label: "getMin" },
  { key: "extractmin",  label: "ExtractMin" },
  { key: "decreasekey", label: "DecreaseKey" },
  { key: "delete",      label: "Delete" },
] as const;

type OpKey = typeof OPERATIONS[number]["key"];

const QUIZ_QUESTIONS: QuizQuestion[] = [
  {
    q: "In a min-heap, where is the smallest element always located?",
    options: [
      "At the deepest leaf, leftmost",
      "At the root (index 0)",
      "At the last index in the array",
      "It can be anywhere, you have to search for it",
    ],
    correct: 1,
    explain:
      "By definition, every parent is ≤ its children, so the chain of ≤ relationships from root to any leaf means the root must hold the smallest value. That's why getMin() is O(1).",
  },
  {
    q: "Which two properties must a binary heap satisfy?",
    options: [
      "Balanced height + sorted in-order",
      "Complete binary tree + heap property (min or max)",
      "Full binary tree + sorted left-to-right at each level",
      "Binary search tree property + balanced",
    ],
    correct: 1,
    explain:
      "A heap must be a <em>complete</em> binary tree (all levels full except possibly the last, which fills left to right) AND satisfy the heap property (every parent ≤ children for a min-heap, or ≥ for a max-heap).",
  },
  {
    q: "If a node sits at array index <strong>i</strong>, where is its left child?",
    options: ["i + 1", "2i", "2i + 1", "(i − 1) / 2"],
    correct: 2,
    explain:
      "Left child = 2i + 1, right child = 2i + 2, parent = ⌊(i−1)/2⌋. The +1 offset comes from the root sitting at index 0 (not 1) in a zero-indexed array.",
  },
  {
    q: "What is the worst-case time complexity of inserting into a heap of N elements?",
    options: ["O(1)", "O(log N)", "O(N)", "O(N log N)"],
    correct: 1,
    explain:
      "Insertion places the new element at the end and bubbles it up. The longest possible bubble-up path is from a leaf to the root — exactly the height of the tree, which for a complete tree is ⌊log₂ N⌋.",
  },
  {
    q: "When ExtractMin removes the root, how do we keep the tree complete?",
    options: [
      "Mark the root as deleted but leave it in place",
      "Shift every element down one position",
      "Replace the root with the last leaf, then heapify down",
      "Rebuild the heap from scratch",
    ],
    correct: 2,
    explain:
      "Copy the last element into the root position and decrement the size — this preserves complete-tree shape in O(1). Then heapify the (now possibly out-of-place) root downward to restore order in O(log N).",
  },
  {
    q: "Which two operations does Delete(i) compose?",
    options: [
      "Insert(−∞) followed by ExtractMin",
      "DecreaseKey(i, −∞) followed by ExtractMin",
      "Heapify(i) followed by Heapify(0)",
      "Swap(i, last) followed by pop",
    ],
    correct: 1,
    explain:
      "DecreaseKey(i, −∞) makes the target value the smallest, which forces it to bubble up to the root. Then ExtractMin pulls it off — and we've cleanly removed the value at index i.",
  },
  {
    q: "Why does Heapify <em>down</em> work even though it only checks the current node and its children?",
    options: [
      "It doesn't — Heapify must check every node in the tree",
      "Because we assume the subtrees of the violating node are already valid heaps",
      "Because heaps are sorted, so checking children is enough",
      "Because the heap property only applies to leaves",
    ],
    correct: 1,
    explain:
      "Heapify is built on a precondition: the subtrees rooted at the left and right children are already valid heaps. Only the current node may violate. Swapping it with its smaller child can only re-violate at <em>that</em> child, so we recurse there — never anywhere else.",
  },
];

export default function PriorityQueuesTutorial() {
  const [activeOp, setActiveOp] = useState<OpKey>("insert");

  return (
    <TutorialShell meta={meta}>
      <main id="main">
        {/* HERO */}
        <section className="section hero">
          <div className="hero-badge">
            <span className="num">01</span> An interactive lesson
          </div>
          <h1>
            Priority Queues, told through{" "}
            <span className="ital">Binary Heaps.</span>
          </h1>
          <p className="lede" style={{ marginTop: 28 }}>
            A guided, hands-on tour through the data structure that powers task
            schedulers, Dijkstra&rsquo;s algorithm, and every &ldquo;process the
            most important thing first&rdquo; system you&rsquo;ve ever used.
            Build intuition with live tree visualizations, step through every
            operation, then test yourself.
          </p>
          <div className="hero-meta">
            <span>~ 25 min read</span>
            <span>5 interactive demos</span>
            <span>1 playground</span>
            <span>7 quiz questions</span>
          </div>

          <div className="feature-row">
            <div className="feature">
              <div className="icon">i.</div>
              <h4>See it grow</h4>
              <p>
                Watch a heap rebuild itself node-by-node as values are inserted,
                swapped, and extracted.
              </p>
            </div>
            <div className="feature">
              <div className="icon">ii.</div>
              <h4>Step through</h4>
              <p>
                Every operation comes with a frame-by-frame walkthrough you
                control with arrow keys or buttons.
              </p>
            </div>
            <div className="feature">
              <div className="icon">iii.</div>
              <h4>Play with it</h4>
              <p>
                An open sandbox lets you insert, extract, decrease, and delete
                on a heap of your own values.
              </p>
            </div>
          </div>
        </section>

        {/* PRIORITY QUEUE */}
        <section className="section" id="priority-queue" data-chapter-id="priority-queue">
          <div className="eyebrow">Chapter 1 · The motivation</div>
          <h2>
            What is a Priority&nbsp;<em>Queue</em>?
          </h2>
          <p className="lede">
            A normal queue is fair — first in, first out. A priority queue is{" "}
            <em>strategic</em> — most important first, regardless of when it
            arrived.
          </p>

          <div className="grid-2" style={{ marginTop: 36 }}>
            <div>
              <p>
                In a regular queue, elements are served in the order they
                arrive. A priority queue replaces that rule with a single
                principle: every element carries a <strong>priority</strong>,
                and the one with the highest priority is always served next.
                Ties between equal priorities are broken by insertion order.
              </p>
              <div className="analogy">
                &ldquo;Patients in an emergency room aren&rsquo;t treated by who
                showed up first. A heart attack jumps the line ahead of a
                sprained ankle — that&rsquo;s a priority queue in real life.&rdquo;
                <span className="who">— A useful mental model</span>
              </div>
              <p>
                Priority queues power <strong>task schedulers</strong> in
                operating systems, the open-set in{" "}
                <strong>Dijkstra&rsquo;s shortest-path</strong> algorithm, the
                frontier in <strong>A* pathfinding</strong>, the merge step in{" "}
                <strong>Huffman coding</strong>, and event simulation in
                real-time systems. They&rsquo;re everywhere.
              </p>
            </div>

            <div className="card">
              <h4
                style={{
                  fontFamily: "var(--mono)",
                  fontSize: 12,
                  textTransform: "uppercase",
                  letterSpacing: ".12em",
                  color: "var(--muted)",
                  fontWeight: 500,
                }}
              >
                The Interface
              </h4>
              <p style={{ marginTop: 6, fontSize: 16 }}>
                A priority queue exposes, at minimum, two operations:
              </p>
              <pre className="code" style={{ marginTop: 14 }}>
                <span className="cm">{`// Add x with a given priority`}</span>
                {"\n"}
                <span className="kw">push</span>
                {"(x, priority)\n\n"}
                <span className="cm">{`// Remove and return the highest-priority item`}</span>
                {"\n"}
                <span className="kw">pop</span>
                {"() "}
                <span className="cm">{`// or "extract"`}</span>
              </pre>
              <p
                style={{
                  marginTop: 16,
                  fontSize: 15,
                  color: "var(--ink-2)",
                }}
              >
                Many implementations also support{" "}
                <code className="inline">peek()</code>,{" "}
                <code className="inline">decrease-key</code>, and{" "}
                <code className="inline">delete</code>. The interface is simple
                — but how it&rsquo;s <em>implemented</em> determines whether
                your program is fast or sluggish.
              </p>
            </div>
          </div>

          <div className="concept-box" style={{ marginTop: 36 }}>
            <h4>The key implementation question</h4>
            <p>
              You could build a priority queue with an unsorted array (slow
              extract) or a sorted array (slow insert). Both make at least one
              operation O(N). The <strong>binary heap</strong> elegantly makes{" "}
              <em>both</em> insert and extract O(log N) — and that&rsquo;s why
              it&rsquo;s the textbook implementation.
            </p>
          </div>
        </section>

        {/* BINARY HEAP */}
        <section className="section" id="binary-heap" data-chapter-id="binary-heap">
          <div className="eyebrow">Chapter 2 · The structure</div>
          <h2>
            The Binary&nbsp;<em>Heap.</em>
          </h2>
          <p className="lede">
            A binary heap is a binary tree with two non-negotiable rules. Get
            either wrong, and it stops being a heap.
          </p>

          <div className="grid-2" style={{ marginTop: 40 }}>
            <div className="concept-box">
              <h4>Rule 1 — Complete Binary Tree</h4>
              <p>
                Every level is fully filled, except possibly the last. The last
                level is filled <strong>from left to right</strong> with no
                gaps. This shape is what lets us store the heap in a flat
                array, no pointers required.
              </p>
            </div>
            <div className="concept-box">
              <h4>Rule 2 — The Heap Property</h4>
              <p>
                Each node stands in a fixed relationship with its children. In
                a <strong>min-heap</strong>: every parent is ≤ its children. In
                a <strong>max-heap</strong>: every parent is ≥ its children.
                The root is therefore the global min (or max).
              </p>
            </div>
          </div>

          <div style={{ marginTop: 40 }}>
            <h3 style={{ marginBottom: 18 }}>A valid min-heap, at a glance</h3>
            <div className="heap-stage">
              <div
                className="heap-svg-wrap"
                tabIndex={0}
                role="region"
                aria-label="Example min-heap diagram (scrollable)"
              >
                <HeapSvg arr={[1, 3, 2, 5, 4, 8, 6, 7, 9]} />
              </div>
              <p
                style={{
                  fontSize: 14,
                  color: "var(--muted)",
                  margin: "12px 0 0",
                  fontFamily: "var(--mono)",
                }}
              >
                Notice: every parent is ≤ its children. The root (1) is the
                minimum value in the whole tree.
              </p>
            </div>
          </div>
        </section>

        {/* MIN VS MAX */}
        <section className="section" id="min-max" data-chapter-id="min-max">
          <div className="eyebrow">Chapter 3 · Two flavors</div>
          <h2>
            Min Heap vs Max <em>Heap.</em>
          </h2>
          <p className="lede">
            Same shape, opposite ordering. Click the toggle to flip the rule
            and watch the same set of values reorganize.
          </p>
          <div style={{ marginTop: 30 }}>
            <MinMaxToggle />
          </div>
        </section>

        {/* ARRAY REPR */}
        <section className="section" id="array-repr" data-chapter-id="array-repr">
          <div className="eyebrow">Chapter 4 · A clever trick</div>
          <h2>
            Storing a tree in an&nbsp;<em>array.</em>
          </h2>
          <p className="lede">
            Because a heap is a complete binary tree, we don&rsquo;t need
            pointers. Index arithmetic alone tells us who&rsquo;s a parent and
            who&rsquo;s a child — and that makes heaps very cache-friendly.
          </p>

          <div className="grid-2" style={{ marginTop: 36 }}>
            <div>
              <p>
                The root sits at index 0. After that, walk the tree
                level-by-level, left-to-right, writing each node into the next
                array slot. The math falls out beautifully:
              </p>
              <div className="formula-card">
                <p
                  style={{
                    margin: 0,
                    fontFamily: "var(--mono)",
                    fontSize: 13,
                    textTransform: "uppercase",
                    letterSpacing: "0.1em",
                    color: "var(--muted)",
                  }}
                >
                  For a node at index{" "}
                  <span style={{ color: "var(--accent)" }}>i</span>
                </p>
                <div className="formula">
                  <span className="var">left child</span> &nbsp;=&nbsp; 2i + 1
                </div>
                <br />
                <div className="formula">
                  <span className="var">right child</span> &nbsp;=&nbsp; 2i + 2
                </div>
                <br />
                <div className="formula">
                  <span className="var">parent</span> &nbsp;=&nbsp; ⌊(i − 1) /
                  2⌋
                </div>
              </div>
              <p style={{ fontSize: 15 }}>
                Hover any node in the tree and watch its array slot light up —
                and vice versa. Indices are shown above each cell.
              </p>
            </div>

            <ArrayLinkingDemo />
          </div>
        </section>

        {/* OPERATIONS */}
        <section className="section" id="operations" data-chapter-id="operations">
          <div className="eyebrow">Chapter 5 · The six operations</div>
          <h2>
            Every operation, step by&nbsp;<em>step.</em>
          </h2>
          <p className="lede">
            Pick an operation. Step forward and backward through what actually
            happens to the tree and the array, with commentary at every move.
            All examples use a min-heap.
          </p>

          <div style={{ marginTop: 36 }}>
            <div className="tabs">
              {OPERATIONS.map((op) => (
                <button
                  key={op.key}
                  className={"tab" + (activeOp === op.key ? " active" : "")}
                  onClick={() => setActiveOp(op.key)}
                >
                  {op.label}
                </button>
              ))}
            </div>

            {activeOp === "insert" && (
              <div>
                <h3>
                  Insert <code className="inline">key = -1</code> into the heap
                </h3>
                <p>
                  We start with a valid min-heap of nine values. Watch the new
                  key bubble up from the bottom-left vacancy until the min-heap
                  property is restored.
                </p>
                <StepWalkthrough steps={insertSteps} />
                <div className="concept-box" style={{ marginTop: 22 }}>
                  <h4>The pattern: bubble up</h4>
                  <p>
                    Place the new value at the next free slot (always the
                    leftmost empty position on the bottom level). Then while
                    it&rsquo;s smaller than its parent, swap them. This is
                    sometimes called &ldquo;sift-up&rdquo; or
                    &ldquo;percolate-up&rdquo;. Worst case: we travel from a
                    leaf to the root — <strong>O(log N)</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeOp === "heapify" && (
              <div>
                <h3>Heapify a node where the heap property is violated</h3>
                <p>
                  Heapify assumes the subtrees below the bad node are valid
                  heaps. The bad value sinks down — at each step, swapping with
                  its smaller child until both children are larger than it.
                </p>
                <StepWalkthrough steps={heapifySteps} />
                <div className="concept-box">
                  <h4>The pattern: sink down</h4>
                  <p>
                    At each level, find the minimum of {`{node, leftChild, rightChild}`}.
                    If the node is already smallest, stop. Otherwise swap with
                    the smaller child and recurse on that child. Worst case:
                    from root to leaf — <strong>O(log N)</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeOp === "getmin" && (
              <div>
                <h3>getMin — peek at the minimum</h3>
                <p>
                  The cheapest operation in the whole structure. Because of the
                  heap property, the minimum element is — always, with no
                  exceptions — at the root. The root is at array index 0. So we
                  just return <code className="inline">arr[0]</code>.
                </p>
                <StepWalkthrough steps={getMinSteps} showLegend={false} />
                <div className="concept-box">
                  <h4>The pattern: trivial lookup</h4>
                  <p>
                    No traversal, no comparisons, no work. Just a single array
                    read. <strong>O(1)</strong>. This is one of the things that
                    makes heaps such a good fit for priority queues — finding
                    the next-best element is free.
                  </p>
                </div>
              </div>
            )}

            {activeOp === "extractmin" && (
              <div>
                <h3>ExtractMin — remove and return the minimum</h3>
                <p>
                  We want the root, but we can&rsquo;t just delete it without
                  breaking the tree shape. The trick: replace the root with the
                  last leaf, shrink the size, then heapify the new root
                  downward.
                </p>
                <StepWalkthrough steps={extractMinSteps} />
                <div className="concept-box">
                  <h4>The pattern: swap & sink</h4>
                  <p>
                    Save <code className="inline">arr[0]</code> as the answer.
                    Move the last leaf to the root, decrement the size by 1,
                    then call Heapify on the root. Total cost is dominated by
                    Heapify: <strong>O(log N)</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeOp === "decreasekey" && (
              <div>
                <h3>DecreaseKey — make a value smaller</h3>
                <p>
                  If we lower a value at index <code className="inline">i</code>
                  , the only invariant that could break is between{" "}
                  <code className="inline">i</code> and its <em>ancestors</em>.
                  So we bubble up — exactly like the second half of insert.
                </p>
                <StepWalkthrough steps={decreaseKeySteps} />
                <div className="concept-box">
                  <h4>The pattern: bubble up only</h4>
                  <p>
                    Subtrees below <code className="inline">i</code> are
                    unaffected — making the node smaller can only break things
                    upward. Walk toward the root, swapping with the parent
                    while the parent is larger. <strong>O(log N)</strong>.
                  </p>
                </div>
              </div>
            )}

            {activeOp === "delete" && (
              <div>
                <h3>Delete — remove the value at any index</h3>
                <p>
                  An elegant composition of two operations we already have.
                  Force the target value to be the smallest possible, push it
                  to the root, then extract.
                </p>
                <StepWalkthrough steps={deleteSteps} />
                <div className="concept-box">
                  <h4>The pattern: lower then extract</h4>
                  <p>
                    Step 1: <code className="inline">DecreaseKey(i, −∞)</code>{" "}
                    — this drives the target up to the root. Step 2:{" "}
                    <code className="inline">ExtractMin()</code> — discard it.
                    Two O(log N) operations chained, still{" "}
                    <strong>O(log N)</strong> overall.
                  </p>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* PLAYGROUND */}
        <section className="section" id="playground" data-chapter-id="playground">
          <div className="eyebrow">Chapter 6 · Free play</div>
          <h2>
            The Heap <em>Sandbox.</em>
          </h2>
          <p className="lede">
            No script, no narration. Insert your own values. Extract. Decrease
            keys. Delete arbitrary indices. Watch the structure rebalance live.
          </p>
          <div style={{ marginTop: 32 }}>
            <HeapPlayground />
          </div>
        </section>

        {/* TIME COMPLEXITY */}
        <section className="section">
          <div className="eyebrow">Chapter 7 · The bottom line</div>
          <h2>
            Time <em>complexity.</em>
          </h2>
          <p className="lede">
            Why is the binary heap the textbook answer for priority queues?
            Because every operation is either constant time or log-of-N — and
            log-of-N grows so slowly it barely moves on a graph.
          </p>

          <div style={{ marginTop: 28 }}>
            <table className="complexity">
              <thead>
                <tr>
                  <th>Operation</th>
                  <th>Worst-case</th>
                  <th>Why</th>
                </tr>
              </thead>
              <tbody>
                <tr>
                  <td><span className="op">Insert(x)</span></td>
                  <td><span className="bigO">O(log N)</span></td>
                  <td>Bubble up, at most one swap per level.</td>
                </tr>
                <tr>
                  <td><span className="op">Heapify(i)</span></td>
                  <td><span className="bigO">O(log N)</span></td>
                  <td>Sink down, at most one swap per level.</td>
                </tr>
                <tr>
                  <td><span className="op">getMin()</span></td>
                  <td><span className="bigO">O(1)</span></td>
                  <td>Just return <code className="inline">arr[0]</code>.</td>
                </tr>
                <tr>
                  <td><span className="op">ExtractMin()</span></td>
                  <td><span className="bigO">O(log N)</span></td>
                  <td>Replace root, then heapify down.</td>
                </tr>
                <tr>
                  <td><span className="op">DecreaseKey(i, v)</span></td>
                  <td><span className="bigO">O(log N)</span></td>
                  <td>Bubble up from index i.</td>
                </tr>
                <tr>
                  <td><span className="op">Delete(i)</span></td>
                  <td><span className="bigO">O(log N)</span></td>
                  <td>DecreaseKey + ExtractMin.</td>
                </tr>
                <tr>
                  <td><span className="op">Build heap (from N items)</span></td>
                  <td><span className="bigO">O(N)</span></td>
                  <td>Bottom-up Heapify — surprising but provable.</td>
                </tr>
              </tbody>
            </table>
          </div>

          <div className="concept-box" style={{ marginTop: 28 }}>
            <h4>To put log N in perspective</h4>
            <p>
              For N = 1,000,000 elements, log₂N ≈ 20. So even with a million
              items, every priority-queue operation completes in about{" "}
              <strong>twenty</strong> steps. That&rsquo;s why heap-based
              schedulers, Dijkstra implementations, and event simulators scale
              to enormous inputs without breaking a sweat.
            </p>
          </div>
        </section>

        {/* QUIZ */}
        <section className="section" id="quiz" data-chapter-id="quiz">
          <div className="eyebrow">Chapter 8 · Test yourself</div>
          <h2>
            Check your <em>understanding.</em>
          </h2>
          <p className="lede">
            Seven questions. Pick an answer and you&rsquo;ll get instant
            feedback explaining why. No grades, no pressure — just a way to see
            what stuck.
          </p>
          <div style={{ marginTop: 36 }}>
            <Quiz questions={QUIZ_QUESTIONS} tutorialSlug={meta.slug} chapterId="quiz" />
          </div>
        </section>
      </main>

      <footer>
        <div className="ornament">— fin —</div>
        <p>
          An interactive lesson on priority queues and binary heaps.
          <br />
          Built for hands, eyes, and intuition.
        </p>
      </footer>
    </TutorialShell>
  );
}
