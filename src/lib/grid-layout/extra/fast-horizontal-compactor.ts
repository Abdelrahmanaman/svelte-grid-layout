import type { Compactor, Layout, LayoutItem, Mutable } from "$lib/core";
import { cloneLayout } from "$lib/core";

/**
 * Ensure the tide array has enough rows.
 */
function ensureTideRows(tide: number[], neededRows: number): void {
  while (tide.length < neededRows) {
    tide.push(0);
  }
}

/**
 * Find the maximum tide value for a range of rows.
 */
function getMaxTideForItem(tide: number[], y: number, h: number): number {
  let maxTide = 0;
  for (let row = y; row < y + h; row++) {
    const tideValue = tide[row] ?? 0;
    if (tideValue > maxTide) {
      maxTide = tideValue;
    }
  }
  return maxTide;
}

/**
 * Check if an item can be placed at a given position without colliding with static items.
 */
function canPlaceAt(
  item: LayoutItem,
  x: number,
  y: number,
  staticItems: LayoutItem[],
  cols: number,
): boolean {
  // Check grid bounds
  if (x + item.w > cols) return false;

  // Check static collisions
  for (const staticItem of staticItems) {
    if (
      x < staticItem.x + staticItem.w &&
      x + item.w > staticItem.x &&
      y < staticItem.y + staticItem.h &&
      y + item.h > staticItem.y
    ) {
      return false;
    }
  }
  return true;
}

/**
 * Fast horizontal compaction using a "sweeping tide" algorithm with row wrapping.
 */
function compactHorizontalFast(layout: LayoutItem[], cols: number, allowOverlap: boolean): void {
  const numItems = layout.length;
  if (numItems === 0) return;

  // Sort items by column then row
  layout.sort((a, b) => {
    if (a.x !== b.x) return a.x - b.x;
    if (a.y !== b.y) return a.y - b.y;
    if (a.static !== b.static) return a.static ? -1 : 1;
    return 0;
  });

  // Calculate max row extent for pre-allocation
  let maxRow = 0;
  for (let i = 0; i < numItems; i++) {
    const item = layout[i];
    if (item !== undefined) {
      const bottom = item.y + item.h;
      if (bottom > maxRow) maxRow = bottom;
    }
  }

  // "Sweeping tide" - tracks the rightmost blocked column per row
  const tide: number[] = Array.from({ length: maxRow }, () => 0);

  // Collect static items for collision checking
  const staticItems = layout.filter((item) => item.static);

  // Safety limit for row wrapping (prevents infinite loops)
  const maxRowLimit = Math.max(10_000, numItems * 100);

  for (let i = 0; i < numItems; i++) {
    const item = layout[i] as Mutable<LayoutItem>;

    if (item.static) {
      ensureTideRows(tide, item.y + item.h);
      const t = item.x + item.w;
      for (let y = item.y; y < item.y + item.h; y++) {
        if ((tide[y] ?? 0) < t) {
          tide[y] = t;
        }
      }
      continue;
    }

    // For non-static items, find the best position
    let targetY = item.y;
    let targetX = 0;
    let placed = false;

    // Try to place the item, wrapping to lower rows if needed
    while (!placed) {
      ensureTideRows(tide, targetY + item.h);

      // Find the maximum tide across the rows this item spans
      const maxTide = getMaxTideForItem(tide, targetY, item.h);

      // Try to place at the tide position
      targetX = maxTide;

      // Check if item fits within grid bounds
      if (targetX + item.w <= cols) {
        // Check for static item collisions
        if (allowOverlap || canPlaceAt(item, targetX, targetY, staticItems, cols)) {
          placed = true;
        } else {
          // Find the rightmost static collision and try past it
          let maxStaticRight = targetX;
          let foundCollision = false;
          for (const staticItem of staticItems) {
            if (
              targetX < staticItem.x + staticItem.w &&
              targetX + item.w > staticItem.x &&
              targetY < staticItem.y + staticItem.h &&
              targetY + item.h > staticItem.y
            ) {
              maxStaticRight = Math.max(maxStaticRight, staticItem.x + staticItem.w);
              foundCollision = true;
            }
          }
          if (foundCollision) {
            targetX = maxStaticRight;
          }

          // After moving past static, check if we still fit
          if (foundCollision && targetX + item.w <= cols) {
            // Verify no more collisions at new position
            if (canPlaceAt(item, targetX, targetY, staticItems, cols)) {
              placed = true;
            } else {
              targetY++;
            }
          } else if (foundCollision) {
            targetY++;
          } else {
            placed = true;
          }
        }
      } else {
        targetY++;
      }

      // Safety check to prevent infinite loops
      if (targetY > maxRowLimit) {
        if (typeof console !== "undefined" && console.warn) {
          console.warn(
            `Fast horizontal compactor: Item "${item.i}" exceeded max row limit (${targetY}). ` +
              `This may indicate a layout that cannot be compacted within grid bounds.`,
          );
        }
        targetX = 0;
        placed = true;
      }
    }

    // Update item position
    item.x = targetX;
    item.y = targetY;
    item.moved = false;

    // Update tide
    ensureTideRows(tide, targetY + item.h);
    const t = targetX + item.w;
    for (let y = targetY; y < targetY + item.h; y++) {
      if ((tide[y] ?? 0) < t) {
        tide[y] = t;
      }
    }
  }
}

/**
 * Fast horizontal compactor - optimized for large layouts.
 */
export const fastHorizontalCompactor: Compactor = {
  type: "horizontal",
  allowOverlap: false,

  compact(layout: Layout, cols: number): Layout {
    const out = cloneLayout(layout) as LayoutItem[];
    compactHorizontalFast(out, cols, false);
    return out;
  },
};

/**
 * Fast horizontal compactor that allows overlapping items.
 */
export const fastHorizontalOverlapCompactor: Compactor = {
  ...fastHorizontalCompactor,
  allowOverlap: true,

  compact(layout: Layout, cols: number): Layout {
    const out = cloneLayout(layout) as LayoutItem[];
    compactHorizontalFast(out, cols, true);
    return out;
  },
};
