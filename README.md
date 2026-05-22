# @bourka/svelte-layout

Draggable, resizable, responsive grid layouts for Svelte 5. The package is built as a Svelte library, ships typed components, and keeps the public API split into explicit subpath exports so apps can import only what they use.

## Install

```sh
pnpm add @bourka/svelte-layout
```

```sh
npm install @bourka/svelte-layout
```

## Basic Usage

```svelte
<script lang="ts">
  import { GridLayout, WidthProvider, type Layout } from "@bourka/svelte-layout";

  let layout = $state<Layout>([
    { i: "revenue", x: 0, y: 0, w: 4, h: 2 },
    { i: "pipeline", x: 4, y: 0, w: 4, h: 2 },
    { i: "alerts", x: 8, y: 0, w: 4, h: 2 },
  ]);
</script>

<WidthProvider>
  {#snippet children(width)}
    <GridLayout
      bind:layout
      {width}
      gridConfig={{
        cols: 12,
        rowHeight: 64,
        margin: [12, 12],
        containerPadding: [12, 12],
      }}
      resizeConfig={{ enabled: true, handles: ["se", "e", "s"] }}
    >
      {#snippet children(item)}
        <section class="card">
          {item.i}: {item.w} x {item.h}
        </section>
      {/snippet}
    </GridLayout>
  {/snippet}
</WidthProvider>
```

`GridLayout` is controlled with `bind:layout`. Each item needs a stable `i` key plus `x`, `y`, `w`, and `h` grid units.

## Responsive Layouts

```svelte
<script lang="ts">
  import { ResponsiveGridLayout, WidthProvider, type ResponsiveLayouts } from "@bourka/svelte-layout";

  let layouts = $state<ResponsiveLayouts>({
    lg: [
      { i: "inbox", x: 0, y: 0, w: 3, h: 2 },
      { i: "timeline", x: 3, y: 0, w: 9, h: 2 },
    ],
    xs: [
      { i: "inbox", x: 0, y: 0, w: 4, h: 2 },
      { i: "timeline", x: 0, y: 2, w: 4, h: 2 },
    ],
  });
</script>

<WidthProvider>
  {#snippet children(width)}
    <ResponsiveGridLayout
      bind:layouts
      {width}
      breakpoints={{ lg: 1100, xs: 0 }}
      cols={{ lg: 12, xs: 4 }}
      rowHeight={58}
    >
      {#snippet children(item)}
        <article>{item.i}</article>
      {/snippet}
    </ResponsiveGridLayout>
  {/snippet}
</WidthProvider>
```

## Public Exports

Use the root entry for the common API:

```ts
import {
  GridLayout,
  ResponsiveGridLayout,
  WidthProvider,
  GridBackground,
  type Layout,
  type LayoutItem,
  type ResponsiveLayouts,
} from "@bourka/svelte-layout";
```

Use subpath entry points when you want a narrower import surface:

```ts
import { GridLayout, type Layout } from "@bourka/svelte-layout/grid-layout";
import { Draggable } from "@bourka/svelte-layout/draggable";
import { Resizable } from "@bourka/svelte-layout/resizable";
import { getCompactor } from "@bourka/svelte-layout/core";
```

The package export map is explicit. Internal reference code and demo routes are not exported, and `dist/react-version/**` is excluded from the npm package.

## Grid Behavior

The main configuration objects are:

- `gridConfig`: `cols`, `rowHeight`, `margin`, `containerPadding`, `maxRows`
- `dragConfig`: `enabled`, `bounded`, `handle`, `cancel`, `threshold`, `collisionThreshold`
- `resizeConfig`: `enabled`, `handles`
- `dropConfig`: external drop support
- `compactor`: vertical, horizontal, wrap, overlap, or custom compaction strategies

`dragConfig.collisionThreshold` controls how much actual pixel overlap is required before a drag reflows colliding items. The default is `0.25`; set it to `0` for immediate collision resolution.

## Publishing

The package name is set to `@bourka/svelte-layout` and `publishConfig.access` is public. Build and inspect the package before publishing:

```sh
pnpm pack
```

```sh
npm publish
```

This project uses Vite+. Run checks with:

```sh
vpx sv check
```
