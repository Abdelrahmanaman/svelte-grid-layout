<script lang="ts">
    /**
     * A stateful Svelte 5 component that provides a resizable box.
     *
     * @remarks
     * Manages width and height via $bindable props, allowing both
     * controlled and uncontrolled usage.
     *
     * @example
     * ```svelte
     * <ResizableBox bind:width bind:height class="box">
     *   Content
     * </ResizableBox>
     * ```
     */
    import { type Snippet } from "svelte";
    import type { ClassValue } from "svelte/elements";
    import Resizable from "./Resizable.svelte";
    import type { ResizableProps, ResizeCallbackData } from "./types";

    /**
     * Properties for the {@link ResizableBox} component.
     */
    interface Props extends Omit<ResizableProps, "width" | "height"> {
        /**
         * Current width of the box.
         * @defaultValue 200
         */
        width?: number;
        /**
         * Current height of the box.
         * @defaultValue 200
         */
        height?: number;
        /** The content of the box. */
        children?: Snippet;
        /** CSS classes to apply to the resizable container. */
        class?: ClassValue;
        /** Inline styles to apply to the resizable container. */
        style?: string;
    }

    let {
        width = $bindable(200),
        height = $bindable(200),
        onResize: onResizeProp,
        children,
        ...restProps
    }: Props = $props();

    /**
     * Internal resize handler to update bindable props.
     */
    function handleResize(
        e: MouseEvent | TouchEvent,
        data: ResizeCallbackData,
    ) {
        const { size } = data;

        // Update the bindable props directly.
        // This notifies the parent and updates the view simultaneously.
        width = size.width;
        height = size.height;

        if (onResizeProp) {
            onResizeProp(e, data);
        }
    }
</script>

<Resizable {...restProps} {width} {height} onResize={handleResize}>
    {@render children?.()}
</Resizable>
