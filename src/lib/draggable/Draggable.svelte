<script lang="ts">
    /**
     * A high-level Svelte 5 component that makes its children draggable.
     *
     * @remarks
     * Supports bounds, axis constraints, handles, and grid snapping.
     * Built with Svelte 5 runes and attachments.
     *
     * @example
     * ```svelte
     * <Draggable bounds="parent" axis="x">
     *   <div class="box">Drag me!</div>
     * </Draggable>
     * ```
     */
    import { type Snippet } from "svelte";
    import type { HTMLAttributes, ClassValue } from "svelte/elements";
    import { draggable } from "./draggable-attachment";
    import type {
        DraggableProps,
        DraggableData,
        DraggableEventHandler,
    } from "./types";
    import { getBoundPosition, getTranslation } from "./utils";

    /**
     * Properties for the {@link Draggable} component.
     * @public
     */
    interface Props
        extends DraggableProps,
            Omit<HTMLAttributes<HTMLDivElement>, "class"> {
        /** The content to be made draggable. */
        children?: Snippet;
        /** Standard CSS classes to apply to the element. */
        class?: ClassValue;
    }

    let {
        axis = "both",
        bounds = false,
        defaultClassName = "svelte-draggable",
        defaultClassNameDragging = "svelte-draggable-dragging",
        defaultClassNameDragged = "svelte-draggable-dragged",
        defaultPosition = { x: 0, y: 0 },
        position = $bindable(defaultPosition),
        positionOffset,
        scale = 1,
        disabled = false,
        handle,
        cancel,
        grid,
        onStart,
        onDrag,
        onStop,
        children,
        class: className,
        style: styleProp,
        ...restProps
    }: Props = $props();

    let dragging = $state(false);
    let dragged = $state(false);

    // Current x and y (derived from the bindable prop which is our single source of truth)
    const currentX = $derived(position.x);
    const currentY = $derived(position.y);

    // Used for compensating for out-of-bounds drags
    let slackX = $state(0);
    let slackY = $state(0);

    function canDragX() {
        return axis === "both" || axis === "x";
    }

    function canDragY() {
        return axis === "both" || axis === "y";
    }

    const handleStart: DraggableEventHandler = (e, data) => {
        const uiData = createDraggableData(data);
        if (onStart && onStart(e, uiData) === false) return false;

        dragging = true;
        dragged = true;
    };

    const handleDrag: DraggableEventHandler = (e, data) => {
        if (!dragging) return false;

        const uiData = createDraggableData(data);
        const newState = {
            x: uiData.x,
            y: uiData.y,
            slackX: 0,
            slackY: 0,
        };

        if (bounds) {
            const originalX = newState.x;
            const originalY = newState.y;

            newState.x += slackX;
            newState.y += slackY;

            const [boundX, boundY] = getBoundPosition(
                bounds,
                data.node,
                newState.x,
                newState.y,
            );
            newState.x = boundX;
            newState.y = boundY;

            newState.slackX = slackX + (originalX - newState.x);
            newState.slackY = slackY + (originalY - newState.y);

            uiData.x = newState.x;
            uiData.y = newState.y;
            uiData.deltaX = newState.x - currentX;
            uiData.deltaY = newState.y - currentY;
        }

        if (onDrag && onDrag(e, uiData) === false) return false;

        // Update the single source of truth
        position = { x: newState.x, y: newState.y };

        slackX = newState.slackX;
        slackY = newState.slackY;
    };

    const handleStop: DraggableEventHandler = (e, data) => {
        if (!dragging) return false;

        const uiData = createDraggableData(data);
        if (onStop && onStop(e, uiData) === false) return false;

        dragging = false;
        slackX = 0;
        slackY = 0;
    };

    function createDraggableData(coreData: DraggableData): DraggableData {
        return {
            node: coreData.node,
            x: currentX + coreData.deltaX / scale,
            y: currentY + coreData.deltaY / scale,
            deltaX: coreData.deltaX / scale,
            deltaY: coreData.deltaY / scale,
            lastX: currentX,
            lastY: currentY,
        };
    }

    const transform = $derived(
        getTranslation(
            {
                x: canDragX() ? currentX : position.x,
                y: canDragY() ? currentY : position.y,
            },
            positionOffset,
            "px",
        ),
    );

    const dragAttachment = draggable(() => ({
        disabled,
        handle,
        cancel,
        grid,
        scale,
        onStart: handleStart,
        onDrag: handleDrag,
        onStop: handleStop,
        ...restProps,
    }));
</script>

<div
    {@attach dragAttachment}
    class={[
        defaultClassName,
        className,
        dragging && defaultClassNameDragging,
        dragged && defaultClassNameDragged,
    ]}
    style={styleProp}
    style:transform={transform}
    {...restProps}
>
    {@render children?.()}
</div>
