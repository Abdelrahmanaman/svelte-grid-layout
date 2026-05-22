<script lang="ts">
  /**
   * Svelte width provider for grid layouts.
   *
   * @remarks
   * React Grid Layout uses a HOC for this. In Svelte, a provider component with
   * a typed `children(width, mounted)` snippet is the natural equivalent.
   */
  import type { Snippet } from "svelte";
  import { untrack } from "svelte";
  import type { HTMLAttributes, ClassValue } from "svelte/elements";
  import { useContainerWidth } from "./extra/useContainerWidth.svelte";
  import "./grid-layout.css";

  /**
   * Properties for {@link WidthProvider}.
   */
  interface Props extends Omit<HTMLAttributes<HTMLDivElement>, "class" | "children"> {
    /** If true, renders only the measuring wrapper until width is known. */
    measureBeforeMount?: boolean;
    /** Initial width exposed before the first ResizeObserver measurement. */
    initialWidth?: number;
    /** Snippet rendered with the measured width and mounted state. */
    children?: Snippet<[width: number, mounted: boolean]>;
    /** CSS classes for the measuring wrapper. */
    class?: ClassValue;
  }

  let {
    measureBeforeMount = false,
    initialWidth = 1280,
    children,
    class: className,
    ...restProps
  }: Props = $props();

  const container = useContainerWidth(untrack(() => initialWidth));
</script>

<div
  {@attach container.attachment}
  class={["svelte-grid-layout-width-provider", className]}
  {...restProps}
>
  {#if !measureBeforeMount || container.mounted}
    {@render children?.(container.width, container.mounted)}
  {/if}
</div>
