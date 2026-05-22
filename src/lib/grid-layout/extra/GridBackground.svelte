<script lang="ts">
  /**
   * SVG grid background aligned with GridLayout cells.
   *
   * @remarks
   * This component is presentation-only and does not participate in layout
   * calculations. Place it behind a {@link GridLayout} inside a relatively
   * positioned container.
   */
  import type { SVGAttributes, ClassValue } from "svelte/elements";
  import { calcGridCellDimensions, type GridCellConfig } from "$lib/core";

  /**
   * Properties for {@link GridBackground}.
   */
  interface Props
    extends GridCellConfig,
      Omit<SVGAttributes<SVGSVGElement>, "class" | "height" | "width"> {
    /**
     * Number of rows to display, or `"auto"` to derive it from `height`.
     *
     * @defaultValue `10`
     */
    rows?: number | "auto";
    /**
     * Height used when `rows` is `"auto"`.
     */
    height?: number;
    /**
     * Fill color for each grid cell.
     *
     * @defaultValue `"#e0e0e0"`
     */
    color?: string;
    /**
     * Border radius for each grid cell in pixels.
     *
     * @defaultValue `4`
     */
    borderRadius?: number;
    /** CSS classes for the SVG element. */
    class?: ClassValue;
  }

  let {
    width,
    cols,
    rowHeight,
    margin = [10, 10],
    containerPadding = null,
    rows = 10,
    height,
    color = "#e0e0e0",
    borderRadius = 4,
    class: className,
    style: styleProp,
    ...restProps
  }: Props = $props();

  const dims = $derived(
    calcGridCellDimensions({
      width,
      cols,
      rowHeight,
      margin,
      containerPadding,
    }),
  );

  const rowCount = $derived.by(() => {
    if (rows !== "auto") return rows;
    if (!height) return 10;

    const padding = containerPadding ?? margin;
    return Math.ceil((height - padding[1] * 2 + margin[1]) / (rowHeight + margin[1]));
  });

  const totalHeight = $derived.by(() => {
    const padding = containerPadding ?? margin;
    return padding[1] * 2 + rowCount * rowHeight + Math.max(0, rowCount - 1) * margin[1];
  });

  const cells = $derived.by(() => {
    const rects: Array<{
      key: string;
      x: number;
      y: number;
      width: number;
      height: number;
    }> = [];

    for (let row = 0; row < rowCount; row++) {
      for (let col = 0; col < cols; col++) {
        rects.push({
          key: `${row}-${col}`,
          x: dims.offsetX + col * (dims.cellWidth + dims.gapX),
          y: dims.offsetY + row * (dims.cellHeight + dims.gapY),
          width: dims.cellWidth,
          height: dims.cellHeight,
        });
      }
    }

    return rects;
  });
</script>

<svg
  aria-hidden="true"
  class={className}
  style={styleProp}
  style:position="absolute"
  style:top="0"
  style:left="0"
  style:width={width + "px"}
  style:height={totalHeight + "px"}
  style:pointer-events="none"
  {...restProps}
>
  {#each cells as cell (cell.key)}
    <rect
      x={cell.x}
      y={cell.y}
      width={cell.width}
      height={cell.height}
      rx={borderRadius}
      ry={borderRadius}
      fill={color}
    />
  {/each}
</svg>
