<script lang="ts">
    /**
     * A lightweight Svelte 5 component that provides core draggable functionality.
     *
     * @remarks
     * Maintains minimal internal state and is intended for advanced usage
     * where full control over the element is required.
     *
     * @example
     * ```svelte
     * <DraggableCore onDrag={(e, data) => console.log(data)}>
     *   <div>Drag me!</div>
     * </DraggableCore>
     * ```
     */
    import type { Snippet } from "svelte";
    import type { HTMLAttributes } from "svelte/elements";
    import { draggable } from "./draggable-attachment";
    import type { DraggableCoreProps } from "./types";

    /**
     * Properties for the {@link DraggableCore} component.
     * @public
     */
    interface Props extends DraggableCoreProps, HTMLAttributes<HTMLDivElement> {
        /** The content to be made draggable. */
        children?: Snippet;
        /** The underlying DOM node (bindable). */
        node?: HTMLElement | null;
    }

    let { children, node = $bindable(null), ...props }: Props = $props();
    const dragAttachment = draggable(() => props);
</script>

<div {@attach dragAttachment} bind:this={node} {...props}>
    {@render children?.()}
</div>
