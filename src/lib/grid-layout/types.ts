import type {
  Compactor,
  CompactType,
  ConstraintContext,
  DragConfig,
  DropConfig,
  DroppingPosition,
  EventCallback,
  GridConfig,
  GridDragEvent,
  GridResizeEvent,
  Layout,
  LayoutConstraint,
  LayoutItem,
  Mutable,
  Position,
  PositionStrategy,
  ResizeConfig,
  ResizeHandleAxis,
} from "$lib/core";
import type { Snippet } from "svelte";
import type { ClassValue } from "svelte/elements";

export type {
  Compactor,
  CompactType,
  ConstraintContext,
  DragConfig,
  DropConfig,
  DroppingPosition,
  EventCallback,
  GridConfig,
  GridDragEvent,
  GridResizeEvent,
  Layout,
  LayoutConstraint,
  LayoutItem,
  Mutable,
  Position,
  PositionStrategy,
  ResizeConfig,
  ResizeHandleAxis,
};

/**
 * Layouts indexed by breakpoint name.
 */
export type ResponsiveLayouts = Partial<Record<string, Layout>>;

/**
 * Breakpoint widths indexed by breakpoint name.
 */
export interface Breakpoints {
  [key: string]: number;
}

/**
 * Data provided to grid item event callbacks.
 */
export interface GridItemCallbackData {
  /** Item identifier. */
  i: string;
  /** New x position in grid units. */
  x: number;
  /** New y position in grid units. */
  y: number;
  /** New width in grid units. */
  w: number;
  /** New height in grid units. */
  h: number;
  /** Native event. */
  e: Event;
  /** DOM node of the item. */
  node: HTMLElement;
}

/**
 * Callback function for grid item events.
 */
export type GridItemCallback = (data: GridItemCallbackData) => void;

/**
 * Snippet used by grid components to render an item.
 *
 * @remarks
 * Svelte cannot clone children the way React Grid Layout does. Passing the
 * current {@link LayoutItem} into a snippet keeps the item/layout relationship
 * explicit and type-safe.
 */
export type GridItemSnippet = Snippet<[item: LayoutItem]>;

/**
 * CSS class value accepted by grid-layout components.
 */
export type GridClassValue = ClassValue;
