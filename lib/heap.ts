// A simple zero-indexed min-heap — the same algorithm used in the
// interactive playground.

export class MinHeap {
  a: number[] = [];

  size(): number {
    return this.a.length;
  }

  parent(i: number): number {
    return Math.floor((i - 1) / 2);
  }

  left(i: number): number {
    return 2 * i + 1;
  }

  right(i: number): number {
    return 2 * i + 2;
  }

  insert(x: number): void {
    this.a.push(x);
    let k = this.a.length - 1;
    while (k !== 0 && this.a[this.parent(k)] > this.a[k]) {
      const p = this.parent(k);
      [this.a[k], this.a[p]] = [this.a[p], this.a[k]];
      k = p;
    }
  }

  heapify(i: number): void {
    const n = this.a.length;
    let smallest = i;
    const l = this.left(i);
    const r = this.right(i);
    if (l < n && this.a[l] < this.a[smallest]) smallest = l;
    if (r < n && this.a[r] < this.a[smallest]) smallest = r;
    if (smallest !== i) {
      [this.a[i], this.a[smallest]] = [this.a[smallest], this.a[i]];
      this.heapify(smallest);
    }
  }

  extractMin(): number | null {
    if (this.a.length === 0) return null;
    const m = this.a[0];
    if (this.a.length === 1) {
      this.a.pop();
      return m;
    }
    this.a[0] = this.a.pop() as number;
    this.heapify(0);
    return m;
  }

  decreaseKey(i: number, val: number): boolean {
    if (i < 0 || i >= this.a.length) return false;
    if (val > this.a[i]) return false;
    this.a[i] = val;
    while (i !== 0 && this.a[this.parent(i)] > this.a[i]) {
      const p = this.parent(i);
      [this.a[i], this.a[p]] = [this.a[p], this.a[i]];
      i = p;
    }
    return true;
  }

  delete(i: number): boolean {
    if (i < 0 || i >= this.a.length) return false;
    this.decreaseKey(i, -Infinity);
    this.extractMin();
    return true;
  }
}
