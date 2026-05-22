<script lang="ts">
  /**
   * Svelte 5 grid layout component.
   *
   * @remarks
   * This is the Svelte-native counterpart to React Grid Layout. It uses an
   * explicit `layout` array and a typed `children(item)` snippet instead of
   * cloning keyed child elements.
   */
  import { deepEqual } from "fast-equals";
  import type { Snippet } from "svelte";
  import type { Attachment } from "svelte/attachments";
  import type { HTMLAttributes, ClassValue } from "svelte/elements";
  import GridItem from "./GridItem.svelte";
  import {
    bottom,
    calcGridColWidth,
    calcGridItemPosition,
    calcGridItemWHPx,
    calcXY,
    cloneLayout,
    cloneLayoutItem,
    correctBounds,
    defaultConstraints,
    defaultDragConfig,
    defaultDropConfig,
    defaultGridConfig,
    defaultPositionStrategy,
    defaultResizeConfig,
    getAllCollisions,
    getCompactor,
    getLayoutItem,
    moveElement,
    withLayoutItem,
    type Compactor,
    type DragConfig,
    type DropConfig,
    type DroppingPosition,
    type EventCallback,
    type GridConfig,
    type GridDragEvent,
    type GridResizeEvent,
    type Layout,
    type LayoutConstraint,
    type LayoutItem,
    type Mutable,
    type PositionParams,
    type PositionStrategy,
    type ResizeConfig,
  } from "$lib/core";
  import "./grid-layout.css";

  /**
   * Properties for {@link GridLayout}.
   */
  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "class" | "style" | "children"> {
    /** Snippet rendered for each layout item. */
    children?: Snippet<[item: LayoutItem]>;
    /** Container width in pixels. */
    width: number;
    /** Current layout. Use `bind:layout` for controlled Svelte state. */
    layout?: Layout;
    /** Grid measurement configuration. */
    gridConfig?: Partial<GridConfig>;
    /** Drag behavior configuration. */
    dragConfig?: Partial<DragConfig>;
    /** Resize behavior configuration. */
    resizeConfig?: Partial<ResizeConfig>;
    /** External drop behavior configuration. */
    dropConfig?: Partial<DropConfig>;
    /** CSS positioning strategy. */
    positionStrategy?: PositionStrategy;
    /** Layout compaction strategy. */
    compactor?: Compactor;
    /** Layout constraints applied during drag and resize. */
    constraints?: LayoutConstraint[];
    /** Item used for external drop previews. */
    droppingItem?: LayoutItem;
    /** Whether the container height follows the layout bottom. */
    autoSize?: boolean;
    /** CSS classes for the layout container. */
    class?: ClassValue;
    /** Inline style text for the layout container. */
    style?: string;
    /** Bindable container node. */
    node?: HTMLDivElement | null;
    /** Called when the public layout changes. */
    onLayoutChange?: (layout: Layout) => void;
    /** Called when drag starts. */
    onDragStart?: EventCallback;
    /** Called while dragging. */
    onDrag?: EventCallback;
    /** Called when drag stops. */
    onDragStop?: EventCallback;
    /** Called when resize starts. */
    onResizeStart?: EventCallback;
    /** Called while resizing. */
    onResize?: EventCallback;
    /** Called when resize stops. */
    onResizeStop?: EventCallback;
    /** Called when an external item is dropped. */
    onDrop?: (layout: Layout, item: LayoutItem | undefined, e: Event) => void;
    /** Called while an external item is dragged over the grid. */
    onDropDragOver?: (
      e: DragEvent,
    ) => { w?: number; h?: number; dragOffsetX?: number; dragOffsetY?: number } | false | void;
  }

  let {
    children,
    width,
    layout = $bindable([]),
    gridConfig: gridConfigProp = {},
    dragConfig: dragConfigProp = {},
    resizeConfig: resizeConfigProp = {},
    dropConfig: dropConfigProp = {},
    positionStrategy = defaultPositionStrategy,
    compactor: compactorProp,
    constraints = defaultConstraints,
    droppingItem: droppingItemProp,
    autoSize = true,
    class: className,
    style: styleProp,
    node = $bindable(null),
    onLayoutChange,
    onDragStart,
    onDrag,
    onDragStop,
    onResizeStart,
    onResize,
    onResizeStop,
    onDrop,
    onDropDragOver,
    ...restProps
  }: Props = $props();

  let activeDrag = $state<LayoutItem | null>(null);
  let resizing = $state(false);
  let droppingPosition = $state<DroppingPosition | undefined>();
  let hasDroppingNode = $state(false);

  let interaction = $state<{
    oldDragItem: LayoutItem | null;
    oldResizeItem: LayoutItem | null;
    oldLayout: Layout | null;
    dragEnterCounter: number;
  }>({
    oldDragItem: null,
    oldResizeItem: null,
    oldLayout: null,
    dragEnterCounter: 0,
  });

  const {
    dropConfig,
    compactor,
    cols,
    rowHeight,
    maxRows,
    margin,
    containerPadding,
    isDraggable,
    isBounded,
    draggableHandle,
    draggableCancel,
    dragThreshold,
    collisionThreshold,
    isResizable,
    resizeHandles,
    isDroppable,
    defaultDropItem,
    compactType,
    allowOverlap,
    preventCollision,
    useCSSTransforms,
    transformScale,
  } = $derived.by(() => {
    const resolvedGridConfig: GridConfig = { ...defaultGridConfig, ...gridConfigProp };
    const resolvedDragConfig: DragConfig = { ...defaultDragConfig, ...dragConfigProp };
    const resolvedResizeConfig: ResizeConfig = { ...defaultResizeConfig, ...resizeConfigProp };
    const resolvedDropConfig: DropConfig = { ...defaultDropConfig, ...dropConfigProp };
    const resolvedCompactor = compactorProp ?? getCompactor("vertical", false, false);
    const resolvedMargin = resolvedGridConfig.margin;

    return {
      dropConfig: resolvedDropConfig,
      compactor: resolvedCompactor,
      cols: resolvedGridConfig.cols,
      rowHeight: resolvedGridConfig.rowHeight,
      maxRows: resolvedGridConfig.maxRows,
      margin: resolvedMargin,
      containerPadding: resolvedGridConfig.containerPadding ?? resolvedMargin,
      isDraggable: resolvedDragConfig.enabled,
      isBounded: resolvedDragConfig.bounded,
      draggableHandle: resolvedDragConfig.handle,
      draggableCancel: resolvedDragConfig.cancel,
      dragThreshold: resolvedDragConfig.threshold,
      collisionThreshold: clamp01(resolvedDragConfig.collisionThreshold),
      isResizable: resolvedResizeConfig.enabled,
      resizeHandles: resolvedResizeConfig.handles,
      isDroppable: resolvedDropConfig.enabled,
      defaultDropItem: resolvedDropConfig.defaultItem,
      compactType: resolvedCompactor.type,
      allowOverlap: resolvedCompactor.allowOverlap,
      preventCollision: resolvedCompactor.preventCollision ?? false,
      useCSSTransforms: positionStrategy.type === "transform",
      transformScale: positionStrategy.scale,
    };
  });

  const droppingItem = $derived<LayoutItem>(
    droppingItemProp ?? {
      i: "__dropping-elem__",
      x: 0,
      y: 0,
      w: defaultDropItem.w,
      h: defaultDropItem.h,
    },
  );

  const containerHeight = $derived.by(() => {
    if (!autoSize) return undefined;
    const rows = bottom(layout);
    return `${rows * rowHeight + Math.max(0, rows - 1) * margin[1] + containerPadding[1] * 2}px`;
  });

  const containerStyle = $derived(
    [styleProp, containerHeight ? `height: ${containerHeight}` : undefined]
      .filter(Boolean)
      .join("; "),
  );

  const normalizedLayout = $derived.by(() => {
    const corrected = correctBounds(cloneLayout(layout) as Mutable<LayoutItem>[], { cols });
    return compactor.compact(corrected, cols);
  });

  const bindNode: Attachment<HTMLDivElement> = (element) => {
    node = element;
    return () => {
      if (node === element) node = null;
    };
  };

  function commitLayout(nextLayout: Layout, notify = true): void {
    const publicLayout = nextLayout.filter((item) => item.i !== droppingItem.i);
    layout = nextLayout;
    if (notify) onLayoutChange?.(publicLayout);
  }

  function currentLayout(): Layout {
    return layout;
  }

  function clamp01(value: number | undefined): number {
    if (typeof value !== "number" || Number.isNaN(value)) return 0;
    return Math.min(1, Math.max(0, value));
  }

  function shouldResolveDragCollision(l: LayoutItem, x: number, y: number, data: GridDragEvent): boolean {
    if (collisionThreshold <= 0 || allowOverlap || preventCollision) return true;

    const candidate: LayoutItem = { ...l, x, y };
    const collisions = getAllCollisions(currentLayout(), candidate).filter((item) => item.i !== l.i);
    if (collisions.length === 0) return true;

    const params: PositionParams = {
      cols,
      margin,
      maxRows,
      rowHeight,
      containerWidth: width,
      containerPadding,
    };
    const dragRect = calcGridItemPosition(params, x, y, l.w, l.h, data.newPosition);
    const dragArea = dragRect.width * dragRect.height;

    if (dragArea <= 0) return true;

    return collisions.some((collision) => {
      const collisionRect = calcGridItemPosition(
        params,
        collision.x,
        collision.y,
        collision.w,
        collision.h,
      );
      const overlapWidth = Math.max(
        0,
        Math.min(dragRect.left + dragRect.width, collisionRect.left + collisionRect.width) -
          Math.max(dragRect.left, collisionRect.left),
      );
      const overlapHeight = Math.max(
        0,
        Math.min(dragRect.top + dragRect.height, collisionRect.top + collisionRect.height) -
          Math.max(dragRect.top, collisionRect.top),
      );
      const overlapArea = overlapWidth * overlapHeight;
      const collisionArea = collisionRect.width * collisionRect.height;
      const referenceArea = Math.min(dragArea, collisionArea);

      return referenceArea > 0 && overlapArea / referenceArea >= collisionThreshold;
    });
  }

  function handleDragStart(i: string, _x: number, _y: number, data: GridDragEvent): void {
    const l = getLayoutItem(currentLayout(), i);
    if (!l) return;

    interaction.oldDragItem = cloneLayoutItem(l);
    interaction.oldLayout = currentLayout();
    activeDrag = { w: l.w, h: l.h, x: l.x, y: l.y, i };
    onDragStart?.(currentLayout(), l, l, null, data.e, data.node);
  }

  function handleDrag(i: string, x: number, y: number, data: GridDragEvent): void {
    const l = getLayoutItem(currentLayout(), i);
    if (!l) return;

    if (!shouldResolveDragCollision(l, x, y, data)) {
      const placeholder: LayoutItem = activeDrag ?? { w: l.w, h: l.h, x: l.x, y: l.y, i };
      onDrag?.(currentLayout(), interaction.oldDragItem, l, placeholder, data.e, data.node);
      return;
    }

    const moved = moveElement(
      currentLayout(),
      l,
      x,
      y,
      true,
      preventCollision,
      compactType,
      cols,
      allowOverlap,
    );
    const compacted = compactor.compact(moved, cols);
    const movedItem = getLayoutItem(compacted, i) ?? l;
    const placeholder: LayoutItem = {
      w: movedItem.w,
      h: movedItem.h,
      x: movedItem.x,
      y: movedItem.y,
      i,
    };

    onDrag?.(compacted, interaction.oldDragItem, movedItem, placeholder, data.e, data.node);
    layout = compacted;
    activeDrag = placeholder;
  }

  function handleDragStop(i: string, x: number, y: number, data: GridDragEvent): void {
    if (!activeDrag) return;

    const l = getLayoutItem(currentLayout(), i);
    if (!l) return;

    if (!shouldResolveDragCollision(l, x, y, data)) {
      onDragStop?.(currentLayout(), interaction.oldDragItem, l, null, data.e, data.node);

      interaction.oldDragItem = null;
      interaction.oldLayout = null;
      activeDrag = null;
      return;
    }

    const moved = moveElement(
      currentLayout(),
      l,
      x,
      y,
      true,
      preventCollision,
      compactType,
      cols,
      allowOverlap,
    );
    const finalLayout = compactor.compact(moved, cols);

    onDragStop?.(finalLayout, interaction.oldDragItem, l, null, data.e, data.node);

    const previous = interaction.oldLayout;
    interaction.oldDragItem = null;
    interaction.oldLayout = null;
    activeDrag = null;
    commitLayout(finalLayout, Boolean(previous && !deepEqual(previous, finalLayout)));
  }

  function handleResizeStart(i: string, _w: number, _h: number, data: GridResizeEvent): void {
    const l = getLayoutItem(currentLayout(), i);
    if (!l) return;

    interaction.oldResizeItem = cloneLayoutItem(l);
    interaction.oldLayout = currentLayout();
    resizing = true;
    onResizeStart?.(currentLayout(), l, l, null, data.e, data.node);
  }

  function handleResize(i: string, w: number, h: number, data: GridResizeEvent): void {
    const previousItem = interaction.oldResizeItem;
    const { handle } = data;
    let shouldMoveItem = false;
    let newX: number | undefined;
    let newY: number | undefined;

    const [newLayout, l] = withLayoutItem(currentLayout(), i, (item) => {
      newX = item.x;
      newY = item.y;

      if (["sw", "w", "nw", "n", "ne"].includes(handle)) {
        if (["sw", "nw", "w"].includes(handle)) {
          newX = item.x + (item.w - w);
          w = item.x !== newX && newX < 0 ? item.w : w;
          newX = Math.max(0, newX);
        }

        if (["ne", "n", "nw"].includes(handle)) {
          newY = item.y + (item.h - h);
          h = item.y !== newY && newY < 0 ? item.h : h;
          newY = Math.max(0, newY);
        }

        shouldMoveItem = true;
      }

      if (preventCollision && !allowOverlap) {
        const collisions = getAllCollisions(currentLayout(), {
          ...item,
          w,
          h,
          x: newX ?? item.x,
          y: newY ?? item.y,
        }).filter((layoutItem) => layoutItem.i !== item.i);

        if (collisions.length > 0) {
          newX = item.x;
          newY = item.y;
          w = item.w;
          h = item.h;
          shouldMoveItem = false;
        }
      }

      (item as Mutable<LayoutItem>).w = w;
      (item as Mutable<LayoutItem>).h = h;
      return item;
    });

    if (!l) return;

    let finalLayout: Layout = newLayout;
    if (shouldMoveItem && newX !== undefined && newY !== undefined) {
      finalLayout = moveElement(
        newLayout,
        l,
        newX,
        newY,
        true,
        preventCollision,
        compactType,
        cols,
        allowOverlap,
      );
    }

    const placeholder: LayoutItem = { w: l.w, h: l.h, x: l.x, y: l.y, i, static: true };
    const compacted = compactor.compact(finalLayout, cols);

    onResize?.(compacted, previousItem, l, placeholder, data.e, data.node);
    layout = compacted;
    activeDrag = placeholder;
  }

  function handleResizeStop(i: string, _w: number, _h: number, data: GridResizeEvent): void {
    const l = getLayoutItem(currentLayout(), i) ?? null;
    const finalLayout = compactor.compact(currentLayout(), cols);

    onResizeStop?.(finalLayout, interaction.oldResizeItem, l, null, data.e, data.node);

    const previous = interaction.oldLayout;
    interaction.oldResizeItem = null;
    interaction.oldLayout = null;
    activeDrag = null;
    resizing = false;
    commitLayout(finalLayout, Boolean(previous && !deepEqual(previous, finalLayout)));
  }

  function removeDroppingPlaceholder(): void {
    const withoutDrop = currentLayout().filter((item) => item.i !== droppingItem.i);
    layout = compactor.compact(withoutDrop, cols);
    hasDroppingNode = false;
    activeDrag = null;
    droppingPosition = undefined;
  }

  function handleDragOver(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    const rawResult = dropConfig.onDragOver?.(e) ?? onDropDragOver?.(e);
    if (rawResult === false) {
      if (hasDroppingNode) removeDroppingPlaceholder();
      return;
    }

    if (!node) return;

    const { dragOffsetX = 0, dragOffsetY = 0, ...dropOverrides } = rawResult ?? {};
    const finalDroppingItem = { ...droppingItem, ...dropOverrides };
    const gridRect = node.getBoundingClientRect();
    const positionParams: PositionParams = {
      cols,
      margin,
      maxRows,
      rowHeight,
      containerWidth: width,
      containerPadding,
    };
    const actualColWidth = calcGridColWidth(positionParams);
    const itemPixelWidth = calcGridItemWHPx(finalDroppingItem.w, actualColWidth, margin[0]);
    const itemPixelHeight = calcGridItemWHPx(finalDroppingItem.h, rowHeight, margin[1]);
    const gridX = Math.max(0, e.clientX - gridRect.left + dragOffsetX - itemPixelWidth / 2);
    const gridY = Math.max(0, e.clientY - gridRect.top + dragOffsetY - itemPixelHeight / 2);

    const newDroppingPosition: DroppingPosition = {
      left: gridX / transformScale,
      top: gridY / transformScale,
      e,
    };

    if (!hasDroppingNode) {
      const calculatedPosition = calcXY(
        positionParams,
        gridY,
        gridX,
        finalDroppingItem.w,
        finalDroppingItem.h,
      );
      const baseLayout = currentLayout().filter((item) => item.i !== finalDroppingItem.i);

      hasDroppingNode = true;
      droppingPosition = newDroppingPosition;
      layout = [
        ...baseLayout,
        {
          ...finalDroppingItem,
          x: calculatedPosition.x,
          y: calculatedPosition.y,
          static: false,
          isDraggable: true,
        },
      ];
    } else if (
      !droppingPosition ||
      droppingPosition.left !== newDroppingPosition.left ||
      droppingPosition.top !== newDroppingPosition.top
    ) {
      droppingPosition = newDroppingPosition;
    }
  }

  function handleDragEnter(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    interaction.dragEnterCounter++;
  }

  function handleDragLeave(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();
    interaction.dragEnterCounter = Math.max(0, interaction.dragEnterCounter - 1);
    if (interaction.dragEnterCounter === 0) removeDroppingPlaceholder();
  }

  function handleDrop(e: DragEvent): void {
    e.preventDefault();
    e.stopPropagation();

    const item = getLayoutItem(currentLayout(), droppingItem.i);
    const dropLayout = currentLayout();
    interaction.dragEnterCounter = 0;
    removeDroppingPlaceholder();
    onDrop?.(dropLayout, item, e);
  }

  function itemDraggable(item: LayoutItem): boolean {
    return typeof item.isDraggable === "boolean" ? item.isDraggable : !item.static && isDraggable;
  }

  function itemResizable(item: LayoutItem): boolean {
    return typeof item.isResizable === "boolean" ? item.isResizable : !item.static && isResizable;
  }
</script>

<div
  {@attach bindNode}
  class={["svelte-grid-layout", className]}
  style={containerStyle}
  ondrop={isDroppable ? handleDrop : undefined}
  ondragleave={isDroppable ? handleDragLeave : undefined}
  ondragenter={isDroppable ? handleDragEnter : undefined}
  ondragover={isDroppable ? handleDragOver : undefined}
  {...restProps}
>
  {#each normalizedLayout as item (item.i)}
    <GridItem
      containerWidth={width}
      {cols}
      {margin}
      {containerPadding}
      {maxRows}
      {rowHeight}
      cancel={draggableCancel}
      handle={draggableHandle}
      onDragStart={handleDragStart}
      onDrag={handleDrag}
      onDragStop={handleDragStop}
      onResizeStart={handleResizeStart}
      onResize={handleResize}
      onResizeStop={handleResizeStop}
      isDraggable={itemDraggable(item)}
      isResizable={itemResizable(item)}
      isBounded={itemDraggable(item) && isBounded && item.isBounded !== false}
      useCSSTransforms={useCSSTransforms}
      {transformScale}
      {positionStrategy}
      {dragThreshold}
      w={item.w}
      h={item.h}
      x={item.x}
      y={item.y}
      i={item.i}
      minH={item.minH}
      minW={item.minW}
      maxH={item.maxH}
      maxW={item.maxW}
      static={item.static}
      droppingPosition={item.i === droppingItem.i ? droppingPosition : undefined}
      resizeHandles={item.resizeHandles ?? [...resizeHandles]}
      {constraints}
      layoutItem={item}
      {layout}
    >
      {@render children?.(item)}
    </GridItem>
  {/each}

  {#if activeDrag}
    <GridItem
      w={activeDrag.w}
      h={activeDrag.h}
      x={activeDrag.x}
      y={activeDrag.y}
      i={activeDrag.i}
      class={["svelte-grid-placeholder", resizing && "placeholder-resizing"]}
      containerWidth={width}
      {cols}
      {margin}
      {containerPadding}
      {maxRows}
      {rowHeight}
      isDraggable={false}
      isResizable={false}
      isBounded={false}
      useCSSTransforms={useCSSTransforms}
      {transformScale}
      {constraints}
      {layout}
    />
  {/if}
</div>
