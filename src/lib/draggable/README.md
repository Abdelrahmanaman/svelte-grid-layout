# svelte-draggable

A high-performance Svelte 5 port of the popular `react-draggable` library. Built from the ground up using **Runes** (`$state`, `$derived`, `$props`) and **Attachments** (`{@attach}`).

## Features

- **Svelte 5 Native**: Leverages the latest reactivity system for maximum performance.
- **Attachment Pattern**: Uses the modern `{@attach}` directive instead of legacy actions.
- **Type Safe**: Fully written in TypeScript with comprehensive TSDoc/JSDoc.
- **Flexible API**: Use high-level components (`<Draggable>`) or low-level logic (`draggable` attachment).
- **Zero Dependencies**: Lightweight and efficient.

## Installation

```bash
npm install svelte-draggable
# or
pnpm add svelte-draggable
```

## Usage

### 1. High-level Component (Easiest)

```svelte
<script>
  import { Draggable } from 'svelte-draggable';
</script>

<Draggable bounds="parent">
  <div class="box">Drag me anywhere inside my parent!</div>
</Draggable>

<style>
  .box { width: 100px; height: 100px; background: blue; cursor: move; }
</style>
```

### 2. Low-level Attachment (Advanced)

```svelte
<script>
  import { draggable } from 'svelte-draggable';
</script>

<div {@attach draggable({ axis: 'x', grid: [25, 25] })}>
  I only move horizontally in 25px steps.
</div>
```

---

## API Reference

### `<Draggable />`

The high-level component that manages bounds, axis constraints, and controlled/uncontrolled state.

| Prop              | Type                                              | Default        | Description                               |
| :---------------- | :------------------------------------------------ | :------------- | :---------------------------------------- |
| `axis`            | `'both' \| 'x' \| 'y' \| 'none'`                  | `'both'`       | Constraints movement to a specific axis.  |
| `bounds`          | `Bounds \| 'parent' \| 'body' \| string \| false` | `false`        | Restricts movement area.                  |
| `position`        | `ControlPosition`                                 | `undefined`    | Controlled position. Use `bind:position`. |
| `defaultPosition` | `ControlPosition`                                 | `{x: 0, y: 0}` | Starting position for uncontrolled mode.  |
| `handle`          | `string`                                          | `undefined`    | CSS selector for the drag handle.         |
| `cancel`          | `string`                                          | `undefined`    | CSS selector to prevent drag start.       |
| `grid`            | `[number, number]`                                | `undefined`    | Snapping increments in pixels.            |
| `disabled`        | `boolean`                                         | `false`        | Disables dragging if true.                |
| `scale`           | `number`                                          | `1`            | Scaling factor for drag movement.         |

### `draggable` Attachment

The core logic factory. Returns a Svelte `Attachment`.

```ts
function draggable(props: DraggableCoreProps): Attachment<HTMLElement>;
```

---

## Types

### `DraggableData`

The object provided to all event handlers (`onStart`, `onDrag`, `onStop`).

```ts
interface DraggableData {
  node: HTMLElement; // The element being dragged
  x: number; // Current x position
  y: number; // Current y position
  deltaX: number; // Change in x since last drag
  deltaY: number; // Change in y since last drag
  lastX: number; // Previous x position
  lastY: number; // Previous y position
}
```

### `Bounds`

Used for custom pixel boundaries.

```ts
interface Bounds {
  left?: number;
  top?: number;
  right?: number;
  bottom?: number;
}
```

### `ControlPosition`

```ts
interface ControlPosition {
  x: number;
  y: number;
}
```

---

## Bounding Modes Explained

- **`"parent"`**: Traps the element inside its immediate HTML container.
- **`"body"`**: Traps the element inside the entire browser window.
- **CSS Selector (e.g. `".container"`)**: Traps the element inside the first element on the page matching that selector.
- **Manual Object**: Sets a "leash" relative to the starting position.

## License

MIT
