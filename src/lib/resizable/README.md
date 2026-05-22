# svelte-resizable

A powerful Svelte 5 port of the popular `react-resizable` library. Built using **Runes** (`$state`, `$derived`, `$props`) and powered by `svelte-draggable`.

## Features

- **Svelte 5 Native**: Leverages the latest reactivity system for maximum performance.
- **Runes Powered**: Uses `$state` and `$bindable` for a clean, single-source-of-truth state model.
- **Fully Typed**: Written in TypeScript with comprehensive TSDoc documentation.
- **8-Way Resizing**: Supports all directions (`n`, `s`, `e`, `w`, `ne`, `nw`, `se`, `sw`).
- **Constraints**: Easily set `minConstraints`, `maxConstraints`, and `lockAspectRatio`.
- **Zero Dependencies**: Lightweight and efficient (requires `svelte-draggable`).

## Installation

```bash
npm install svelte-resizable svelte-draggable
# or
pnpm add svelte-resizable svelte-draggable
```

## Usage

### 1. Stateful Box (Easiest)

The `<ResizableBox />` component manages its own size state internally.

```svelte
<script>
  import { ResizableBox } from 'svelte-resizable';
</script>

<ResizableBox
  width={200}
  height={200}
  minConstraints={[100, 100]}
  class="box"
>
  <div class="content">I am resizable!</div>
</ResizableBox>

<style>
  :global(.box) { border: 1px solid #ccc; background: white; }
</style>
```

### 2. Stateless Component (Advanced)

The `<Resizable />` component gives you full control. You must manage the `width` and `height` yourself (usually via `bind:`).

```svelte
<script>
  import { Resizable } from 'svelte-resizable';
  let width = $state(200);
  let height = $state(200);
</script>

<Resizable bind:width bind:height axis="x">
  <div style="width: {width}px; height: {height}px;">
    Only my width can change.
  </div>
</Resizable>
```

---

## API Reference

### `<ResizableBox />`

A convenient wrapper that manages its own dimensions.

| Prop              | Type                             | Default                | Description                                     |
| :---------------- | :------------------------------- | :--------------------- | :---------------------------------------------- |
| `width`           | `number`                         | `200`                  | Current width (bindable).                       |
| `height`          | `number`                         | `200`                  | Current height (bindable).                      |
| `axis`            | `'both' \| 'x' \| 'y' \| 'none'` | `'both'`               | Restricts resizing to a specific axis.          |
| `lockAspectRatio` | `boolean`                        | `false`                | Maintains the width/height ratio during resize. |
| `minConstraints`  | `[number, number]`               | `[20, 20]`             | Minimum allowed [width, height].                |
| `maxConstraints`  | `[number, number]`               | `[Infinity, Infinity]` | Maximum allowed [width, height].                |
| `resizeHandles`   | `ResizeHandleAxis[]`             | `['se']`               | Which handles to render.                        |

### `<Resizable />`

The base component for custom implementations.

| Prop             | Type     | Default      | Description                                          |
| :--------------- | :------- | :----------- | :--------------------------------------------------- |
| `width`          | `number` | **Required** | The width to render (bindable).                      |
| `height`         | `number` | **Required** | The height to render (bindable).                     |
| `transformScale` | `number` | `1`          | Scaling factor if a parent has `transform: scale()`. |

---

## Types

### `ResizeCallbackData`

Provided to `onResizeStart`, `onResize`, and `onResizeStop`.

```ts
interface ResizeCallbackData {
  node: HTMLElement; // The handle element
  size: { width: number; height: number };
  handle: ResizeHandleAxis;
}
```

### `ResizeHandleAxis`

`'s' | 'w' | 'e' | 'n' | 'sw' | 'nw' | 'se' | 'ne'`

---

## Handle Styling

The library includes basic positioning for handles but relies on your CSS for visuals. You can customize them using these classes:

- `.svelte-resizable-handle`: Base class for all handles.
- `.svelte-resizable-handle-[axis]`: Specific class for a direction (e.g., `.svelte-resizable-handle-se`).

## License

MIT
