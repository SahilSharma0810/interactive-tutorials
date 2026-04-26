import type { Step } from "@/components/StepWalkthrough";

export const insertSteps: Step[] = [
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9],
    classes: {},
    narration: `Initial min-heap of 9 values. We're going to insert <strong>-1</strong>.`,
  },
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9, -1],
    classes: { 9: "new" },
    narration: `Place -1 at the next free slot — index <strong>9</strong>, the leftmost vacancy on the bottom level. The complete-tree shape is preserved, but heap order may now be broken.`,
  },
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9, -1],
    classes: { 9: "compare", 4: "compare" },
    narration: `Compare the new node (index 9, value -1) with its parent (index 4, value 4). Since -1 < 4, the heap property is violated. <strong>Swap.</strong>`,
  },
  {
    arr: [1, 3, 2, 5, -1, 8, 6, 7, 9, 4],
    classes: { 9: "swap", 4: "swap" },
    narration: `Swapped. -1 is now at index 4, and 4 has moved down to index 9.`,
  },
  {
    arr: [1, 3, 2, 5, -1, 8, 6, 7, 9, 4],
    classes: { 4: "compare", 1: "compare" },
    narration: `Continue bubbling up. Compare index 4 (value -1) with its parent at index 1 (value 3). Since -1 < 3, swap again.`,
  },
  {
    arr: [1, -1, 2, 5, 3, 8, 6, 7, 9, 4],
    classes: { 1: "swap", 4: "swap" },
    narration: `Swapped. -1 is now at index 1.`,
  },
  {
    arr: [1, -1, 2, 5, 3, 8, 6, 7, 9, 4],
    classes: { 1: "compare", 0: "compare" },
    narration: `Compare index 1 (value -1) with parent at index 0 (value 1). Since -1 < 1, swap one more time.`,
  },
  {
    arr: [-1, 1, 2, 5, 3, 8, 6, 7, 9, 4],
    classes: { 0: "swap", 1: "swap" },
    narration: `Swapped. -1 is now the root — and since the root has no parent, we stop.`,
  },
  {
    arr: [-1, 1, 2, 5, 3, 8, 6, 7, 9, 4],
    classes: { 0: "target" },
    narration: `<strong>Done.</strong> -1 is the new minimum at the root. Three swaps total — exactly the height of the tree, which is O(log N).`,
  },
];

export const heapifySteps: Step[] = [
  {
    arr: [10, 1, 2, 5, 4, 8, 6, 7, 9],
    classes: { 0: "target" },
    narration: `The root (index 0) holds <strong>10</strong> — much larger than its children. The heap property is violated <em>at this node only</em>; the subtrees below are valid. We'll heapify it down.`,
  },
  {
    arr: [10, 1, 2, 5, 4, 8, 6, 7, 9],
    classes: { 0: "target", 1: "compare", 2: "compare" },
    narration: `Compare node (10) with its children: left child = 1, right child = 2. The smallest of {10, 1, 2} is <strong>1</strong> at index 1.`,
  },
  {
    arr: [1, 10, 2, 5, 4, 8, 6, 7, 9],
    classes: { 0: "swap", 1: "swap" },
    narration: `Swap node with its smaller child. 1 moves up to the root; 10 sinks to index 1.`,
  },
  {
    arr: [1, 10, 2, 5, 4, 8, 6, 7, 9],
    classes: { 1: "target", 3: "compare", 4: "compare" },
    narration: `Recurse on index 1 (now holding 10). Compare with children: left = 5, right = 4. The smallest of {10, 5, 4} is <strong>4</strong> at index 4.`,
  },
  {
    arr: [1, 4, 2, 5, 10, 8, 6, 7, 9],
    classes: { 1: "swap", 4: "swap" },
    narration: `Swap. 4 moves up; 10 sinks to index 4.`,
  },
  {
    arr: [1, 4, 2, 5, 10, 8, 6, 7, 9],
    classes: { 4: "target" },
    narration: `Index 4 has no children (its left child would be at index 9, but the heap only has 9 elements). We've reached a leaf — heapify stops.`,
  },
  {
    arr: [1, 4, 2, 5, 10, 8, 6, 7, 9],
    classes: {},
    narration: `<strong>Done.</strong> The heap property holds throughout. 10 has sunk to its rightful place; 1, 2, and 4 occupy the top of the tree.`,
  },
];

export const getMinSteps: Step[] = [
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9],
    classes: {},
    narration: `A valid min-heap. Where's the minimum?`,
  },
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9],
    classes: { 0: "target" },
    narration: `The minimum is always at the root — array index <strong>0</strong>. Just return <code class="inline">arr[0] = 1</code>. No comparisons. No traversal. <strong>O(1)</strong>.`,
  },
];

export const extractMinSteps: Step[] = [
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9],
    classes: {},
    narration: `We want to remove the minimum (1). But we can't just delete the root — the tree would have a hole.`,
  },
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9],
    classes: { 0: "target", 8: "compare" },
    narration: `The trick: copy the <strong>last element</strong> (9, at index 8) into the root, then shrink the heap by 1. This preserves complete-tree shape.`,
  },
  {
    arr: [9, 3, 2, 5, 4, 8, 6, 7],
    classes: { 0: "target" },
    narration: `Last element copied to root; size is now 8. The min (1) has been logically removed. But now the heap property is broken at the root — 9 is bigger than both its children.`,
  },
  {
    arr: [9, 3, 2, 5, 4, 8, 6, 7],
    classes: { 0: "target", 1: "compare", 2: "compare" },
    narration: `Heapify down. Compare 9 with its children: left = 3, right = 2. Smallest is <strong>2</strong> at index 2.`,
  },
  {
    arr: [2, 3, 9, 5, 4, 8, 6, 7],
    classes: { 0: "swap", 2: "swap" },
    narration: `Swap. 2 rises to the root; 9 sinks to index 2.`,
  },
  {
    arr: [2, 3, 9, 5, 4, 8, 6, 7],
    classes: { 2: "target", 5: "compare", 6: "compare" },
    narration: `Recurse at index 2 (value 9). Children: left = 8 (idx 5), right = 6 (idx 6). Smallest is <strong>6</strong> at index 6.`,
  },
  {
    arr: [2, 3, 6, 5, 4, 8, 9, 7],
    classes: { 2: "swap", 6: "swap" },
    narration: `Swap. 6 moves up; 9 sinks to index 6 — a leaf. Heapify is done.`,
  },
  {
    arr: [2, 3, 6, 5, 4, 8, 9, 7],
    classes: { 0: "target" },
    narration: `<strong>Done.</strong> We returned 1 (the original min), and the heap is valid again. The new minimum is 2.`,
  },
];

export const decreaseKeySteps: Step[] = [
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9],
    classes: { 7: "target" },
    narration: `We'll decrease the value at index <strong>7</strong> (currently 7) to <strong>-2</strong>.`,
  },
  {
    arr: [1, 3, 2, 5, 4, 8, 6, -2, 9],
    classes: { 7: "target" },
    narration: `Update <code class="inline">arr[7] = -2</code>. The subtree below is unaffected (no children here), but the path up to the root may now have violations.`,
  },
  {
    arr: [1, 3, 2, 5, 4, 8, 6, -2, 9],
    classes: { 7: "compare", 3: "compare" },
    narration: `Bubble up. Compare index 7 (-2) with parent at index 3 (5). Since -2 < 5, swap.`,
  },
  {
    arr: [1, 3, 2, -2, 4, 8, 6, 5, 9],
    classes: { 3: "swap", 7: "swap" },
    narration: `Swapped. -2 is now at index 3; 5 moved down to index 7.`,
  },
  {
    arr: [1, 3, 2, -2, 4, 8, 6, 5, 9],
    classes: { 3: "compare", 1: "compare" },
    narration: `Continue. Compare index 3 (-2) with parent at index 1 (3). Since -2 < 3, swap.`,
  },
  {
    arr: [1, -2, 2, 3, 4, 8, 6, 5, 9],
    classes: { 1: "swap", 3: "swap" },
    narration: `Swapped. -2 is now at index 1.`,
  },
  {
    arr: [1, -2, 2, 3, 4, 8, 6, 5, 9],
    classes: { 1: "compare", 0: "compare" },
    narration: `Compare index 1 (-2) with parent at index 0 (1). Since -2 < 1, swap one more time.`,
  },
  {
    arr: [-2, 1, 2, 3, 4, 8, 6, 5, 9],
    classes: { 0: "swap", 1: "swap" },
    narration: `Swapped. -2 has reached the root.`,
  },
  {
    arr: [-2, 1, 2, 3, 4, 8, 6, 5, 9],
    classes: { 0: "target" },
    narration: `<strong>Done.</strong> -2 is now the new minimum. The heap is valid throughout.`,
  },
];

export const deleteSteps: Step[] = [
  {
    arr: [1, 3, 2, 5, 4, 8, 6, 7, 9],
    classes: { 4: "target" },
    narration: `We'll delete the value at index <strong>4</strong> (currently 4). Strategy: lower it to -∞, then extract the min.`,
  },
  {
    arr: [1, 3, 2, 5, -Infinity, 8, 6, 7, 9],
    classes: { 4: "target" },
    narration: `Step 1: <code class="inline">DecreaseKey(4, -∞)</code>. Set the value to negative infinity so it's guaranteed to be the smallest.`,
  },
  {
    arr: [1, 3, 2, 5, -Infinity, 8, 6, 7, 9],
    classes: { 4: "compare", 1: "compare" },
    narration: `Bubble up: compare with parent at index 1 (value 3). -∞ < 3, so swap.`,
  },
  {
    arr: [1, -Infinity, 2, 5, 3, 8, 6, 7, 9],
    classes: { 1: "swap", 4: "swap" },
    narration: `Swapped. Continue.`,
  },
  {
    arr: [1, -Infinity, 2, 5, 3, 8, 6, 7, 9],
    classes: { 1: "compare", 0: "compare" },
    narration: `Compare index 1 (-∞) with root (1). -∞ < 1, so swap.`,
  },
  {
    arr: [-Infinity, 1, 2, 5, 3, 8, 6, 7, 9],
    classes: { 0: "swap", 1: "swap" },
    narration: `-∞ is now at the root. The decrease-key phase is complete.`,
  },
  {
    arr: [-Infinity, 1, 2, 5, 3, 8, 6, 7, 9],
    classes: { 0: "target", 8: "compare" },
    narration: `Step 2: <code class="inline">ExtractMin()</code>. Move the last leaf (9) to the root and shrink size.`,
  },
  {
    arr: [9, 1, 2, 5, 3, 8, 6, 7],
    classes: { 0: "target" },
    narration: `-∞ has been removed (and with it, the original 4). Now heapify down to fix the root.`,
  },
  {
    arr: [9, 1, 2, 5, 3, 8, 6, 7],
    classes: { 0: "target", 1: "compare", 2: "compare" },
    narration: `Compare 9 with children: 1, 2. Smallest is <strong>1</strong> at index 1.`,
  },
  {
    arr: [1, 9, 2, 5, 3, 8, 6, 7],
    classes: { 0: "swap", 1: "swap" },
    narration: `Swap.`,
  },
  {
    arr: [1, 9, 2, 5, 3, 8, 6, 7],
    classes: { 1: "target", 3: "compare", 4: "compare" },
    narration: `Recurse at index 1. Children: 5 (idx 3), 3 (idx 4). Smallest is <strong>3</strong>.`,
  },
  {
    arr: [1, 3, 2, 5, 9, 8, 6, 7],
    classes: { 1: "swap", 4: "swap" },
    narration: `Swap.`,
  },
  {
    arr: [1, 3, 2, 5, 9, 8, 6, 7],
    classes: { 4: "target" },
    narration: `Index 4 (value 9) has no children — heapify stops.`,
  },
  {
    arr: [1, 3, 2, 5, 9, 8, 6, 7],
    classes: {},
    narration: `<strong>Done.</strong> The original 4 has been deleted. The heap is valid and contains 8 elements.`,
  },
];
