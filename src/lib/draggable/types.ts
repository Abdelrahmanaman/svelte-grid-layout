/**
 * Event handler for draggable events.
 *
 * @param e - The native mouse or touch event.
 * @param data - The current drag data.
 * @returns If `false` is returned, the current drag operation will be cancelled.
 */
export type DraggableEventHandler = (
  e: MouseEvent | TouchEvent,
  data: DraggableData,
) => void | false;

/**
 * Data provided to drag event handlers.
 */
export interface DraggableData {
  /** The HTMLElement being dragged. */
  node: HTMLElement;
  /** Current x position. */
  x: number;
  /** Current y position. */
  y: number;
  /** Change in x position since last drag. */
  deltaX: number;
  /** Change in y position since last drag. */
  deltaY: number;
  /** Previous x position. */
  lastX: number;
  /** Previous y position. */
  lastY: number;
}

/**
 * Movement boundaries in pixels.
 */
export interface Bounds {
  /** Left boundary offset. */
  left?: number;
  /** Top boundary offset. */
  top?: number;
  /** Bottom boundary offset. */
  bottom?: number;
  /** Bottom boundary offset. */
  right?: number;
}

/**
 * A simple coordinate pair.
 */
export interface ControlPosition {
  x: number;
  y: number;
}

/**
 * A coordinate pair that can include CSS units like % or rem.
 */
export interface PositionOffsetControlPosition {
  x: number | string;
  y: number | string;
}

/**
 * Allowed axes for movement.
 */
export type Axis = "both" | "x" | "y" | "none";

/**
 * A CSS selector string used to identify elements (e.g., '.handle', '#header', 'strong').
 */
export type CssSelector = string;

/**
 * A helper type that prevents TypeScript from collapsing literal unions into a generic string.
 * This preserves autocomplete for specific values like 'parent' or 'body'.
 */
type AnyString = string & {};

/**
 * Core configuration for draggable behavior.
 */
export interface DraggableCoreProps {
  /**
   * Allows dragging using any mouse button.
   * @defaultValue `false` (only left-click)
   */
  allowAnyClick?: boolean;

  /**
   * Prevents cancellation of the 'touchstart' event on mobile devices.
   * @remarks
   * Useful if you're having trouble with click events on mobile.
   * @defaultValue `false`
   */
  allowMobileScroll?: boolean;

  /**
   * If true, stops the component from being dragged.
   * @defaultValue `false`
   */
  disabled?: boolean;

  /**
   * Adds 'user-select: none' styles to the document body during drag.
   * @defaultValue `true`
   */
  enableUserSelectHack?: boolean;

  /**
   * Specifies the x and y increments that dragging should snap to.
   * @example `[25, 25]`
   */
  grid?: [number, number];

  /**
   * A CSS selector to be used as the handle that initiates drag.
   * @remarks
   * Only elements matching this selector will respond to drag starts.
   */
  handle?: CssSelector;

  /**
   * A CSS selector used to prevent drag initialization.
   * @remarks
   * Dragging will not start if the event target matches this selector.
   */
  cancel?: CssSelector;

  /**
   * Uses the passed DOM node to compute drag offsets instead of the parent node.
   */
  offsetParent?: HTMLElement;

  /**
   * Applies scaling while dragging an element.
   * @defaultValue `1`
   */
  scale?: number;

  /** Called when dragging starts. Return `false` to cancel. */
  onStart?: DraggableEventHandler;

  /** Called while dragging. Return `false` to cancel. */
  onDrag?: DraggableEventHandler;

  /** Called when dragging stops. */
  onStop?: DraggableEventHandler;

  /** A workaround for accessing the initial mousedown event. */
  onMouseDown?: (e: MouseEvent) => void;
}

/**
 * High-level configuration for the Draggable component.
 */
export interface DraggableProps extends DraggableCoreProps {
  /**
   * Determines which axis the element can move on.
   * @defaultValue `'both'`
   */
  axis?: Axis;

  /**
   * Determines the range of movement.
   * @remarks
   * - `'parent'`: restricts to parent node.
   * - `'body'`: restricts to document body.
   * - `string`: restricts to a specific element matching the selector.
   * - `Bounds`: object `{ left, top, right, bottom }` in pixels.
   * @defaultValue `false` (unbounded)
   */
  bounds?: Bounds | "parent" | "body" | AnyString | false;

  /** The class name applied to the draggable container. */
  defaultClassName?: string;

  /** The class name applied while dragging. */
  defaultClassNameDragging?: string;

  /** The class name applied after an element has been dragged. */
  defaultClassNameDragged?: string;

  /**
   * The initial x and y position.
   * @remarks Only used during component initialization.
   * @defaultValue `{ x: 0, y: 0 }`
   */
  defaultPosition?: ControlPosition;

  /**
   * The current x and y position.
   * @remarks Use this for controlled components.
   */
  position?: ControlPosition;

  /**
   * An initial offset from the position.
   * @example `{ x: '10%', y: '10%' }`
   */
  positionOffset?: PositionOffsetControlPosition;
}
