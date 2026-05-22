# Grid Layout

The grid-layout entry point contains the dashboard layout components and the layout types used by `svelte-layout-grid`.

```ts
import {
  GridLayout,
  ResponsiveGridLayout,
  WidthProvider,
  GridBackground,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from "svelte-layout-grid/grid-layout";
```

## Components

- `GridLayout`: controlled grid for one layout array.
- `ResponsiveGridLayout`: breakpoint-aware wrapper that stores one layout per breakpoint.
- `WidthProvider`: observes parent width and passes it into a snippet.
- `GridItem`: low-level positioned item used internally by `GridLayout`.
- `GridBackground`: optional visual grid background for demos and layout editors.

## GridLayout

```svelte
<script lang="ts">
  import { GridLayout, WidthProvider, type Layout } from "svelte-layout-grid/grid-layout";

  let layout = $state<Layout>([
    { i: "a", x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
    { i: "b", x: 4, y: 0, w: 4, h: 2 },
  ]);
</script>

<WidthProvider>
  {#snippet children(width)}
    <GridLayout
      bind:layout
      {width}
      gridConfig={{ cols: 12, rowHeight: 64, margin: [12, 12] }}
      dragConfig={{ enabled: true, collisionThreshold: 0.25 }}
      resizeConfig={{ enabled: true, handles: ["se", "e", "s"] }}
    >
      {#snippet children(item)}
        <article>{item.i}</article>
      {/snippet}
    </GridLayout>
  {/snippet}
</WidthProvider>
```

`layout` is the source of truth. During drag or resize, the component emits layout updates through `bind:layout` and `onLayoutChange`.

## ResponsiveGridLayout

```svelte
<script lang="ts">
  import {
    ResponsiveGridLayout,
    WidthProvider,
    type ResponsiveLayouts,
  } from "svelte-layout-grid/grid-layout";

  let layouts = $state<ResponsiveLayouts>({
    lg: [{ i: "a", x: 0, y: 0, w: 6, h: 2 }],
    xs: [{ i: "a", x: 0, y: 0, w: 4, h: 2 }],
  });
</script>

<WidthProvider>
  {#snippet children(width)}
    <ResponsiveGridLayout
      bind:layouts
      {width}
      breakpoints={{ lg: 1100, xs: 0 }}
      cols={{ lg: 12, xs: 4 }}
    >
      {#snippet children(item)}
        <article>{item.i}</article>
      {/snippet}
    </ResponsiveGridLayout>
  {/snippet}
</WidthProvider>
```

Missing breakpoint layouts are generated from the closest available layout and compacted for the active column count.

## Layout Items

Each item uses grid units:

```ts
type LayoutItem = {
  i: string;
  x: number;
  y: number;
  w: number;
  h: number;
  minW?: number;
  maxW?: number;
  minH?: number;
  maxH?: number;
  static?: boolean;
  isDraggable?: boolean;
  isResizable?: boolean;
  isBounded?: boolean;
};
```

`static` items cannot be dragged or resized and other items move around them. Per-item `isDraggable`, `isResizable`, and `isBounded` override the grid-level config.

## Configuration

`gridConfig`

- `cols`: number of columns.
- `rowHeight`: row height in pixels.
- `margin`: `[x, y]` gap between items.
- `containerPadding`: `[x, y]` inner padding. Defaults to `margin`.
- `maxRows`: maximum row count.

`dragConfig`

- `enabled`: enables dragging.
- `bounded`: keeps draggable items inside the container.
- `handle`: selector that starts drag.
- `cancel`: selector that prevents drag.
- `threshold`: pixels before a drag starts.
- `collisionThreshold`: actual overlap ratio before collisions reflow other items. Default: `0.25`.

`resizeConfig`

- `enabled`: enables resizing.
- `handles`: resize handles, for example `["se"]` or `["se", "e", "s"]`.

## Compactors

The default compactor is vertical. The entry point also exports optional compactors:

```ts
import {
  fastVerticalCompactor,
  fastHorizontalCompactor,
  wrapCompactor,
} from "svelte-layout-grid/grid-layout";
```

Pass a compactor to `GridLayout` or `ResponsiveGridLayout`:

```svelte
<GridLayout {width} bind:layout compactor={fastVerticalCompactor}>
  {#snippet children(item)}
    <article>{item.i}</article>
  {/snippet}
</GridLayout>
```

## Styling

The grid components import their required CSS. If an app needs the stylesheet directly, it is exported as:

```ts
import "svelte-layout-grid/grid-layout/style.css";
```
