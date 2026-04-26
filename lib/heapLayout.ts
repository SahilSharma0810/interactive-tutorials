// Layout math for rendering a heap (stored in an array) as an SVG tree.

export const HEAP_W = 800;
export const LEVEL_H = 75;
export const NODE_R = 22;

export function nodeXY(idx: number): { x: number; y: number; level: number } {
  const level = Math.floor(Math.log2(idx + 1));
  const posInLevel = idx - (Math.pow(2, level) - 1);
  const nodesAtLevel = Math.pow(2, level);
  const x = (posInLevel + 0.5) * (HEAP_W / nodesAtLevel);
  const y = 35 + level * LEVEL_H;
  return { x, y, level };
}

export function svgHeight(arrLen: number): number {
  const levels = arrLen === 0 ? 1 : Math.floor(Math.log2(arrLen)) + 1;
  return Math.max(180, 35 + levels * LEVEL_H + 20);
}
