<script lang="ts" generics="B extends string = string">
  /**
   * Responsive Svelte grid layout.
   *
   * @remarks
   * Chooses the active breakpoint from `width`, generates missing breakpoint
   * layouts with the framework-agnostic core helpers, and renders `GridLayout`
   * with a typed `children(item)` snippet.
   */
  import type { Snippet } from "svelte";
  import type { HTMLAttributes, ClassValue } from "svelte/elements";
  import GridLayout from "./GridLayout.svelte";
  import {
    defaultGridConfig,
    findOrGenerateResponsiveLayout,
    getBreakpointFromWidth,
    getColsFromBreakpoint,
    getCompactor,
    getIndentationValue,
    type Breakpoints,
    type Compactor,
    type DragConfig,
    type DropConfig,
    type EventCallback,
    type GridConfig,
    type Layout,
    type LayoutConstraint,
    type LayoutItem,
    type PositionStrategy,
    type ResponsiveLayouts,
    type ResizeConfig,
  } from "$lib/core";

  const DEFAULT_BREAKPOINTS = {
    lg: 1200,
    md: 996,
    sm: 768,
    xs: 480,
    xxs: 0,
  };

  const DEFAULT_COLS = {
    lg: 12,
    md: 10,
    sm: 6,
    xs: 4,
    xxs: 2,
  };

  type Indentation<B extends string> =
    | readonly [number, number]
    | Partial<Record<B, readonly [number, number]>>;

  /**
   * Properties for {@link ResponsiveGridLayout}.
   */
  interface Props
    extends Omit<
      HTMLAttributes<HTMLDivElement>,
      "class" | "style" | "children" | "onDragStart" | "onDrag" | "onDrop"
    > {
    /** Snippet rendered for each layout item. */
    children?: Snippet<[item: LayoutItem]>;
    /** Container width in pixels. */
    width: number;
    /** Controlled breakpoint override. */
    breakpoint?: B;
    /** Breakpoint min-width map. */
    breakpoints?: Breakpoints<B>;
    /** Column counts by breakpoint. */
    cols?: Breakpoints<B>;
    /** Layouts by breakpoint. Use `bind:layouts` for controlled state. */
    layouts?: ResponsiveLayouts<B>;
    /** Row height in pixels. */
    rowHeight?: number;
    /** Maximum number of rows. */
    maxRows?: number;
    /** Margin, either fixed or breakpoint-specific. */
    margin?: Indentation<B>;
    /** Container padding, either fixed or breakpoint-specific. */
    containerPadding?: Indentation<B> | null;
    /** Compaction strategy. */
    compactor?: Compactor;
    /** Extra GridLayout configuration. */
    gridConfig?: Partial<GridConfig>;
    /** Drag behavior configuration forwarded to GridLayout. */
    dragConfig?: Partial<DragConfig>;
    /** Resize behavior configuration forwarded to GridLayout. */
    resizeConfig?: Partial<ResizeConfig>;
    /** External drop configuration forwarded to GridLayout. */
    dropConfig?: Partial<DropConfig>;
    /** CSS positioning strategy forwarded to GridLayout. */
    positionStrategy?: PositionStrategy;
    /** Layout constraints forwarded to GridLayout. */
    constraints?: LayoutConstraint[];
    /** Whether the container height follows the layout bottom. */
    autoSize?: boolean;
    /** CSS classes for the layout container. */
    class?: ClassValue;
    /** Inline style text for the layout container. */
    style?: string;
    /** Called when the active breakpoint changes. */
    onBreakpointChange?: (newBreakpoint: B, cols: number) => void;
    /** Called when the current layout changes. */
    onLayoutChange?: (layout: Layout, layouts: ResponsiveLayouts<B>) => void;
    /** Called when width-derived grid metrics change. */
    onWidthChange?: (
      width: number,
      margin: readonly [number, number],
      cols: number,
      containerPadding: readonly [number, number] | null,
    ) => void;
    /** Grid drag start callback. */
    onDragStart?: EventCallback;
    /** Grid drag callback. */
    onDrag?: EventCallback;
    /** Grid drag stop callback. */
    onDragStop?: EventCallback;
    /** Grid resize start callback. */
    onResizeStart?: EventCallback;
    /** Grid resize callback. */
    onResize?: EventCallback;
    /** Grid resize stop callback. */
    onResizeStop?: EventCallback;
  }

  let {
    children,
    width,
    breakpoint: breakpointProp,
    breakpoints = DEFAULT_BREAKPOINTS as Breakpoints<B>,
    cols: colsConfig = DEFAULT_COLS as Breakpoints<B>,
    layouts = $bindable({} as ResponsiveLayouts<B>),
    rowHeight = defaultGridConfig.rowHeight,
    maxRows = defaultGridConfig.maxRows,
    margin: marginProp = defaultGridConfig.margin,
    containerPadding: containerPaddingProp = defaultGridConfig.containerPadding,
    compactor = getCompactor("vertical"),
    gridConfig: gridConfigProp = {},
    onBreakpointChange: _onBreakpointChange,
    onLayoutChange,
    onWidthChange: _onWidthChange,
    ...restProps
  }: Props = $props();

  const breakpoint = $derived<B>(breakpointProp ?? getBreakpointFromWidth(breakpoints, width));
  const currentCols = $derived(getColsFromBreakpoint(breakpoint, colsConfig));
  const currentMargin = $derived(getIndentationValue(marginProp, breakpoint));
  const currentContainerPadding = $derived(
    containerPaddingProp === null ? null : getIndentationValue(containerPaddingProp, breakpoint),
  );

  const currentLayout = $derived.by(() =>
    findOrGenerateResponsiveLayout(
      layouts,
      breakpoints,
      breakpoint,
      breakpoint,
      currentCols,
      compactor,
    ),
  );

  const gridConfig = $derived<GridConfig>({
    ...defaultGridConfig,
    ...gridConfigProp,
    cols: currentCols,
    rowHeight,
    maxRows,
    margin: currentMargin,
    containerPadding: currentContainerPadding,
  });

  function handleLayoutChange(layout: Layout): void {
    const nextLayouts = {
      ...layouts,
      [breakpoint]: layout,
    } as ResponsiveLayouts<B>;

    layouts = nextLayouts;
    onLayoutChange?.(layout, nextLayouts);
  }
</script>

<GridLayout
  {...restProps}
  {width}
  {gridConfig}
  {compactor}
  layout={currentLayout}
  {children}
  onLayoutChange={handleLayoutChange}
/>
