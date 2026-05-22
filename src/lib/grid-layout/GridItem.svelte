<script lang="ts">
  /**
   * Single positioned, draggable, and resizable item inside a Svelte grid layout.
   *
   * @remarks
   * `GridItem` intentionally renders a snippet instead of cloning child
   * elements. The parent layout remains the source of truth; drag and resize
   * callbacks report grid-unit changes back to the owning `GridLayout`.
   */
  import type { Snippet } from "svelte";
  import type { HTMLAttributes, ClassValue } from "svelte/elements";
  import { draggable, type DraggableData } from "$lib/draggable";
  import Resizable from "$lib/resizable/Resizable.svelte";
  import type { ResizeCallbackData } from "$lib/resizable";
  import {
    applyPositionConstraints,
    applySizeConstraints,
    calcGridColWidth,
    calcGridItemPosition,
    calcGridItemWHPx,
    calcWHRaw,
    calcXYRaw,
    clamp,
    defaultConstraints,
    resizeItemInDirection,
    type ConstraintContext,
    type DroppingPosition,
    type GridDragEvent,
    type GridResizeEvent,
    type Layout,
    type LayoutConstraint,
    type LayoutItem,
    type Position,
    type PositionParams,
    type PositionStrategy,
    type ResizeHandleAxis,
  } from "$lib/core";

  type GridItemCallback<Data extends GridDragEvent | GridResizeEvent> = (
    i: string,
    wOrX: number,
    hOrY: number,
    data: Data,
  ) => void;

  /**
   * Properties for {@link GridItem}.
   */
  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "children" | "class" | "style"> {
    /** Item content. Receives the current layout item. */
    children?: Snippet<[item: LayoutItem]>;
    /** Number of grid columns. */
    cols: number;
    /** Container width in pixels. */
    containerWidth: number;
    /** Margin between items in pixels. */
    margin: readonly [number, number];
    /** Padding inside the container in pixels. */
    containerPadding: readonly [number, number];
    /** Row height in pixels. */
    rowHeight: number;
    /** Maximum row count. */
    maxRows: number;
    /** Whether this item is draggable. */
    isDraggable: boolean;
    /** Whether this item is resizable. */
    isResizable: boolean;
    /** Whether drag movement is bounded to the container. */
    isBounded: boolean;
    /** Whether this item is static. */
    static?: boolean;
    /** Whether to position with CSS transforms. */
    useCSSTransforms?: boolean;
    /** Whether to emit percentage left/width values. */
    usePercentages?: boolean;
    /** Scale applied by a parent transform. */
    transformScale?: number;
    /** Optional custom positioning strategy. */
    positionStrategy?: PositionStrategy;
    /** Minimum pointer distance before drag callbacks start. */
    dragThreshold?: number;
    /** Current position of an external dropping placeholder. */
    droppingPosition?: DroppingPosition;
    /** CSS class for the item shell. */
    class?: ClassValue;
    /** Inline style text for the item shell. */
    style?: string;
    /** CSS selector that starts drag. */
    handle?: string;
    /** CSS selector that cancels drag. */
    cancel?: string;
    /** X position in grid units. */
    x: number;
    /** Y position in grid units. */
    y: number;
    /** Width in grid units. */
    w: number;
    /** Height in grid units. */
    h: number;
    /** Minimum width in grid units. */
    minW?: number;
    /** Maximum width in grid units. */
    maxW?: number;
    /** Minimum height in grid units. */
    minH?: number;
    /** Maximum height in grid units. */
    maxH?: number;
    /** Stable item identifier. */
    i: string;
    /** Resize handles to render. */
    resizeHandles?: ResizeHandleAxis[];
    /** Grid-level constraints. */
    constraints?: LayoutConstraint[];
    /** Full layout item, including custom metadata. */
    layoutItem?: LayoutItem;
    /** Current layout used by constraints. */
    layout?: Layout;
    /** Called when drag starts. */
    onDragStart?: GridItemCallback<GridDragEvent>;
    /** Called while dragging. */
    onDrag?: GridItemCallback<GridDragEvent>;
    /** Called when drag stops. */
    onDragStop?: GridItemCallback<GridDragEvent>;
    /** Called when resize starts. */
    onResizeStart?: GridItemCallback<GridResizeEvent>;
    /** Called while resizing. */
    onResize?: GridItemCallback<GridResizeEvent>;
    /** Called when resize stops. */
    onResizeStop?: GridItemCallback<GridResizeEvent>;
  }

  let {
    children,
    cols,
    containerWidth,
    margin,
    containerPadding,
    rowHeight,
    maxRows,
    isDraggable,
    isResizable,
    isBounded,
    static: isStatic = false,
    useCSSTransforms = true,
    usePercentages = false,
    transformScale = 1,
    positionStrategy,
    dragThreshold = 0,
    droppingPosition,
    class: className,
    style: styleProp,
    handle = "",
    cancel = "",
    x,
    y,
    w,
    h,
    minW = 1,
    maxW = Infinity,
    minH = 1,
    maxH = Infinity,
    i,
    resizeHandles = ["se"],
    constraints = defaultConstraints,
    layoutItem,
    layout = [],
    onDragStart,
    onDrag,
    onDragStop,
    onResizeStart,
    onResize,
    onResizeStop,
    ...restProps
  }: Props = $props();

  let dragging = $state(false);
  let resizing = $state(false);
  let dragPosition = $state<{ left: number; top: number } | null>(null);
  let resizePosition = $state<Position | null>(null);

  let dragSession = $state({
    pending: false,
    thresholdExceeded: false,
    initialClient: { x: 0, y: 0 },
  });

  const positionParams: PositionParams = $derived({
    cols,
    containerPadding,
    containerWidth,
    margin,
    maxRows,
    rowHeight,
  });

  const effectiveLayoutItem: LayoutItem = $derived(
    layoutItem ?? {
      i,
      x,
      y,
      w,
      h,
      minW,
      maxW,
      minH,
      maxH,
      static: isStatic,
    },
  );

  const constraintContext: ConstraintContext = $derived({
    cols,
    maxRows,
    containerWidth,
    containerHeight: 0,
    rowHeight,
    margin,
    layout,
  });

  const pos = $derived(
    calcGridItemPosition(
      positionParams,
      x,
      y,
      w,
      h,
      dragging ? dragPosition : null,
      resizing ? resizePosition : null,
    ),
  );

  const colWidth = $derived(calcGridColWidth(positionParams));
  const minConstraints = $derived<[number, number]>([
    calcGridItemWHPx(minW, colWidth, margin[0]),
    calcGridItemWHPx(minH, rowHeight, margin[1]),
  ]);
  const maxConstraints = $derived<[number, number]>([
    calcGridItemWHPx(maxW, colWidth, margin[0]),
    calcGridItemWHPx(maxH, rowHeight, margin[1]),
  ]);

  const positionStyle = $derived(createStyle(pos));
  const itemStyle = $derived(toStyleText(styleProp, positionStyle));

  const dragAttachment = draggable(() => ({
    disabled: !isDraggable,
    handle,
    cancel: `.svelte-resizable-handle${cancel ? `,${cancel}` : ""}`,
    scale: transformScale,
    onStart: handleDragStart,
    onDrag: handleDrag,
    onStop: handleDragStop,
  }));

  function createStyle(position: Position): Record<string, string> {
    if (positionStrategy?.calcStyle) {
      return normalizeStyle(positionStrategy.calcStyle(position));
    }

    if (useCSSTransforms) {
      const translate = `translate(${position.left}px,${position.top}px)`;
      return {
        transform: translate,
        width: `${position.width}px`,
        height: `${position.height}px`,
        position: "absolute",
      };
    }

    return {
      top: `${position.top}px`,
      left: usePercentages ? `${(position.left / containerWidth) * 100}%` : `${position.left}px`,
      width: usePercentages ? `${(position.width / containerWidth) * 100}%` : `${position.width}px`,
      height: `${position.height}px`,
      position: "absolute",
    };
  }

  function normalizeStyle(style: Record<string, string | number>): Record<string, string> {
    const normalized: Record<string, string> = {};
    for (const [key, value] of Object.entries(style)) {
      normalized[key] = typeof value === "number" ? `${value}px` : value;
    }
    return normalized;
  }

  function toKebabCase(value: string): string {
    return value.replace(/[A-Z]/g, (match) => `-${match.toLowerCase()}`);
  }

  function toStyleText(base: string | undefined, style: Record<string, string>): string {
    const generated = Object.entries(style)
      .map(([key, value]) => `${toKebabCase(key)}: ${value}`)
      .join("; ");
    return [base, generated].filter(Boolean).join("; ");
  }

  function eventPoint(e: MouseEvent | TouchEvent): { x: number; y: number } {
    if (e instanceof MouseEvent) return { x: e.clientX, y: e.clientY };
    const touch = e.touches[0] ?? e.changedTouches[0];
    return { x: touch?.clientX ?? 0, y: touch?.clientY ?? 0 };
  }

  function constrainedPosition(top: number, left: number): { x: number; y: number } {
    const raw = calcXYRaw(positionParams, top, left);
    return applyPositionConstraints(
      constraints,
      effectiveLayoutItem,
      raw.x,
      raw.y,
      constraintContext,
    );
  }

  function handleDragStart(e: MouseEvent | TouchEvent, data: DraggableData): void {
    const { node } = data;
    const offsetParent = node.offsetParent;
    if (!(offsetParent instanceof HTMLElement)) return;

    const parentRect = offsetParent.getBoundingClientRect();
    const clientRect = node.getBoundingClientRect();
    const point = eventPoint(e);

    const newPosition = positionStrategy?.calcDragPosition
      ? positionStrategy.calcDragPosition(
          point.x,
          point.y,
          point.x - clientRect.left,
          point.y - clientRect.top,
        )
      : {
          left: clientRect.left / transformScale - parentRect.left / transformScale + offsetParent.scrollLeft,
          top: clientRect.top / transformScale - parentRect.top / transformScale + offsetParent.scrollTop,
        };

    dragPosition = newPosition;
    dragging = true;

    if (dragThreshold > 0) {
      dragSession.initialClient = point;
      dragSession.pending = true;
      dragSession.thresholdExceeded = false;
      return;
    }

    const next = constrainedPosition(newPosition.top, newPosition.left);
    onDragStart?.(i, next.x, next.y, { e, node, newPosition });
  }

  function handleDrag(e: MouseEvent | TouchEvent, data: DraggableData): void {
    if (!dragging || !dragPosition) return;

    if (dragSession.pending && !dragSession.thresholdExceeded) {
      const point = eventPoint(e);
      const distance = Math.hypot(
        point.x - dragSession.initialClient.x,
        point.y - dragSession.initialClient.y,
      );
      if (distance < dragThreshold) return;

      dragSession.thresholdExceeded = true;
      dragSession.pending = false;
      const start = constrainedPosition(dragPosition.top, dragPosition.left);
      onDragStart?.(i, start.x, start.y, {
        e,
        node: data.node,
        newPosition: dragPosition,
      });
    }

    let top = dragPosition.top + data.deltaY;
    let left = dragPosition.left + data.deltaX;

    if (isBounded) {
      const bottomBoundary = data.node.offsetParent
        ? data.node.offsetParent.clientHeight - calcGridItemWHPx(h, rowHeight, margin[1])
        : Infinity;
      top = clamp(top, 0, bottomBoundary);

      const rightBoundary = containerWidth - calcGridItemWHPx(w, colWidth, margin[0]);
      left = clamp(left, 0, rightBoundary);
    }

    const newPosition = { top, left };
    dragPosition = newPosition;
    const next = constrainedPosition(top, left);
    onDrag?.(i, next.x, next.y, { e, node: data.node, newPosition });
  }

  function handleDragStop(e: MouseEvent | TouchEvent, data: DraggableData): void {
    if (!dragging || !dragPosition) return;

    const wasPending = dragSession.pending;
    dragSession.pending = false;
    dragSession.thresholdExceeded = false;
    dragSession.initialClient = { x: 0, y: 0 };

    const finalPosition = dragPosition;
    dragging = false;
    dragPosition = null;

    if (wasPending) return;

    const next = constrainedPosition(finalPosition.top, finalPosition.left);
    onDragStop?.(i, next.x, next.y, {
      e,
      node: data.node,
      newPosition: finalPosition,
    });
  }

  function emitResize(
    e: MouseEvent | TouchEvent,
    data: ResizeCallbackData,
    handlerName: "onResizeStart" | "onResize" | "onResizeStop",
  ): void {
    const current = calcGridItemPosition(positionParams, x, y, w, h);
    const updatedSize = resizeItemInDirection(
      data.handle,
      current,
      { ...current, ...data.size },
      containerWidth,
    );
    resizePosition = updatedSize;

    const rawSize = calcWHRaw(positionParams, updatedSize.width, updatedSize.height);
    const next = applySizeConstraints(
      constraints,
      effectiveLayoutItem,
      rawSize.w,
      rawSize.h,
      data.handle,
      constraintContext,
    );

    const eventData: GridResizeEvent = {
      e,
      node: data.node,
      size: updatedSize,
      handle: data.handle,
    };

    if (handlerName === "onResizeStart") onResizeStart?.(i, next.w, next.h, eventData);
    if (handlerName === "onResize") onResize?.(i, next.w, next.h, eventData);
    if (handlerName === "onResizeStop") onResizeStop?.(i, next.w, next.h, eventData);
  }

  function handleResizeStart(e: MouseEvent | TouchEvent, data: ResizeCallbackData): void {
    resizing = true;
    emitResize(e, data, "onResizeStart");
  }

  function handleResize(e: MouseEvent | TouchEvent, data: ResizeCallbackData): void {
    emitResize(e, data, "onResize");
  }

  function handleResizeStop(e: MouseEvent | TouchEvent, data: ResizeCallbackData): void {
    emitResize(e, data, "onResizeStop");
    resizing = false;
    resizePosition = null;
  }
</script>

<Resizable
  {@attach dragAttachment}
  class={[
    "svelte-grid-item",
    className,
    isStatic && "static",
    resizing && "resizing",
    isDraggable && "svelte-draggable",
    dragging && "svelte-draggable-dragging",
    droppingPosition && "dropping",
    useCSSTransforms && "cssTransforms",
    !isResizable && "svelte-resizable-hide",
  ]}
  style={itemStyle}
  width={pos.width}
  height={pos.height}
  minConstraints={minConstraints}
  maxConstraints={maxConstraints}
  resizeHandles={resizeHandles}
  transformScale={transformScale}
  draggableOpts={{ disabled: !isResizable }}
  onResizeStart={handleResizeStart}
  onResize={handleResize}
  onResizeStop={handleResizeStop}
  {...restProps}
>
  {@render children?.(effectiveLayoutItem)}
</Resizable>
