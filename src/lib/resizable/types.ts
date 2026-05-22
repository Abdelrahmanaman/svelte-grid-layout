import type { DraggableCoreProps } from "$lib/draggable";

/**
 * Valid axes for resizing.
 */
export type ResizeAxis = "both" | "x" | "y" | "none";

/**
 * Valid resize handle directions.
 */
export type ResizeHandleAxis = "s" | "w" | "e" | "n" | "sw" | "nw" | "se" | "ne";

/**
 * Data provided to resize event handlers.
 */
export interface ResizeCallbackData {
  /** The HTMLElement of the handle being dragged. */
  node: HTMLElement;
  /** The new calculated size. */
  size: { width: number; height: number };
  /** The axis of the handle being used. */
  handle: ResizeHandleAxis;
}

/**
 * Event handler for resize events.
 */
export type ResizeEventHandler = (
  e: MouseEvent | TouchEvent,
  data: ResizeCallbackData,
) => void | false;

/**
 * Base properties for the Resizable component.
 */
export interface ResizableProps {
  /**
   * Restricts resizing to a particular axis.
   * @defaultValue `'both'`
   */
  axis?: ResizeAxis;

  /**
   * These will be passed to the underlying draggable logic for handles.
   */
  draggableOpts?: DraggableCoreProps;

  /**
   * Current height of the element.
   */
  height: number;

  /**
   * Current width of the element.
   */
  width: number;

  /**
   * If you change this, be sure to update your CSS.
   * @defaultValue `[20, 20]`
   */
  handleSize?: [number, number];

  /**
   * Locks the aspect ratio based on initial width and height.
   * @defaultValue `false`
   */
  lockAspectRatio?: boolean;

  /**
   * Minimum width and height constraints.
   * @defaultValue `[20, 20]`
   */
  minConstraints?: [number, number];

  /**
   * Maximum width and height constraints.
   * @defaultValue `[Infinity, Infinity]`
   */
  maxConstraints?: [number, number];

  /**
   * Defines which resize handles should be rendered.
   * @defaultValue `['se']`
   */
  resizeHandles?: ResizeHandleAxis[];

  /**
   * If `transform: scale(n)` is set on the parent, this should be set to `n`.
   * @defaultValue `1`
   */
  transformScale?: number;

  /** Called when resizing starts. */
  onResizeStart?: ResizeEventHandler;

  /** Called while resizing. */
  onResize?: ResizeEventHandler;

  /** Called when resizing stops. */
  onResizeStop?: ResizeEventHandler;

  /** Custom class name prefix for the resize handles. Defaults to 'svelte-resizable-handle'. */
  handleClass?: string;
}

/**
 * Properties for the ResizableBox component.
 */
export interface ResizableBoxProps extends ResizableProps {
  /** Initial height. */
  height: number;
  /** Initial width. */
  width: number;
}
