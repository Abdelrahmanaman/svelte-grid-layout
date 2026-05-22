import type { Compactor, Layout, LayoutItem, Mutable } from "$lib/core";
import { cloneLayout } from "$lib/core";

/**
 * Check if two layout items collide (overlap).
 */
function collides(l1: LayoutItem, l2: LayoutItem): boolean {
  if (l1.i === l2.i) return false;
  return l1.x < l2.x + l2.w && l1.x + l1.w > l2.x && l1.y < l2.y + l2.h && l1.y + l1.h > l2.y;
}

/**
 * Fast vertical compaction using a "rising tide" algorithm.
 */
function compactVerticalFast(layout: LayoutItem[], cols: number, allowOverlap: boolean): void {
  const numItems = layout.length;

  // Sort items by position: top-to-bottom, left-to-right
  layout.sort((a, b) => {
    if (a.y < b.y) return -1;
    if (a.y > b.y) return 1;
    if (a.x < b.x) return -1;
    if (a.x > b.x) return 1;
    if (a.static && !b.static) return -1;
    if (!a.static && b.static) return 1;
    return 0;
  });

  // "Rising tide" - tracks the highest blocked row per column
  const tide: number[] = Array.from({ length: cols }, () => 0);

  // Collect static items for collision checking
  const staticItems = layout.filter((item) => item.static);
  const numStatics = staticItems.length;
  let staticOffset = 0;

  for (let i = 0; i < numItems; i++) {
    const item = layout[i] as Mutable<LayoutItem>;

    // Clamp x2 to grid bounds
    let x2 = item.x + item.w;
    if (x2 > cols) {
      x2 = cols;
    }

    if (item.static) {
      ++staticOffset;
    } else {
      // Find the minimum gap between the item and the tide
      let minGap = Infinity;
      for (let x = item.x; x < x2; ++x) {
        const tideValue = tide[x] ?? 0;
        const gap = item.y - tideValue;
        if (gap < minGap) {
          minGap = gap;
        }
      }

      // Close the gap (move item up to meet the tide)
      if (!allowOverlap || minGap > 0) {
        item.y -= minGap;
      }

      // Handle collisions with static items
      for (let j = staticOffset; !allowOverlap && j < numStatics; ++j) {
        const staticItem = staticItems[j];
        if (staticItem === undefined) continue;

        // Early exit: if static item is below current item, no more collisions possible
        if (staticItem.y >= item.y + item.h) {
          break;
        }

        if (collides(item, staticItem)) {
          // Move current item below the static item
          item.y = staticItem.y + staticItem.h;

          if (j > staticOffset) {
            j = staticOffset;
          }
        }
      }

      // Reset moved flag
      item.moved = false;
    }

    // Update tide
    const t = item.y + item.h;
    for (let x = item.x; x < x2; ++x) {
      const currentTide = tide[x] ?? 0;
      if (currentTide < t) {
        tide[x] = t;
      }
    }
  }
}

/**
 * Fast vertical compactor - optimized for large layouts.
 */
export const fastVerticalCompactor: Compactor = {
  type: "vertical",
  allowOverlap: false,

  compact(layout: Layout, cols: number): Layout {
    const out = cloneLayout(layout) as LayoutItem[];
    compactVerticalFast(out, cols, false);
    return out;
  },
};

/**
 * Fast vertical compactor that allows overlapping items.
 */
export const fastVerticalOverlapCompactor: Compactor = {
  ...fastVerticalCompactor,
  allowOverlap: true,

  compact(layout: Layout, cols: number): Layout {
    const out = cloneLayout(layout) as LayoutItem[];
    compactVerticalFast(out, cols, true);
    return out;
  },
};
