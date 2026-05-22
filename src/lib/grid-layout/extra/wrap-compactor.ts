import type { Compactor, Layout, LayoutItem, Mutable } from "$lib/core";
import { cloneLayout, cloneLayoutItem } from "$lib/core";

/**
 * Sort items in wrap order: left-to-right, top-to-bottom.
 */
function sortByWrapOrder(layout: Layout): LayoutItem[] {
  return [...layout].sort((a, b) => {
    if (a.y !== b.y) return a.y - b.y;
    return a.x - b.x;
  });
}

/**
 * Convert a linear wrap position back to x,y coordinates.
 */
function fromWrapPosition(pos: number, cols: number): { x: number; y: number } {
  return {
    x: pos % cols,
    y: Math.floor(pos / cols),
  };
}

/**
 * Compact items in wrap order, filling gaps from left-to-right, top-to-bottom.
 */
function compactWrap(layout: Layout, cols: number): LayoutItem[] {
  if (layout.length === 0) return [];

  const sorted = sortByWrapOrder(layout);
  const out: LayoutItem[] = Array.from({ length: layout.length });
  const statics = sorted.filter((item) => item.static);

  // Track which positions are occupied by static items
  const staticPositions = new Set<number>();
  for (const s of statics) {
    for (let dy = 0; dy < s.h; dy++) {
      for (let dx = 0; dx < s.w; dx++) {
        staticPositions.add((s.y + dy) * cols + (s.x + dx));
      }
    }
  }

  let nextPos = 0;

  for (let i = 0; i < sorted.length; i++) {
    const sortedItem = sorted[i];
    if (sortedItem === undefined) continue;

    const l = cloneLayoutItem(sortedItem);

    if (l.static) {
      const originalIndex = layout.indexOf(sortedItem);
      out[originalIndex] = l;
      l.moved = false;
      continue;
    }

    // Find next available position that doesn't conflict with statics
    while (staticPositions.has(nextPos)) {
      nextPos++;
    }

    const { x, y } = fromWrapPosition(nextPos, cols);

    // Check if item would overflow the row
    if (x + l.w > cols) {
      nextPos = (y + 1) * cols;
      while (staticPositions.has(nextPos)) {
        nextPos++;
      }
    }

    const newCoords = fromWrapPosition(nextPos, cols);
    (l as Mutable<LayoutItem>).x = newCoords.x;
    (l as Mutable<LayoutItem>).y = newCoords.y;

    nextPos += l.w;

    const originalIndex = layout.indexOf(sortedItem);
    out[originalIndex] = l;
    l.moved = false;
  }

  return out;
}

/**
 * Wrap compactor - arranges items like words in a paragraph.
 */
export const wrapCompactor: Compactor = {
  type: "wrap",
  allowOverlap: false,

  compact(layout: Layout, cols: number): Layout {
    return compactWrap(layout, cols);
  },
};

/**
 * Wrap compactor that allows overlapping items.
 */
export const wrapOverlapCompactor: Compactor = {
  ...wrapCompactor,
  allowOverlap: true,

  compact(layout: Layout, _cols: number): Layout {
    return cloneLayout(layout);
  },
};
