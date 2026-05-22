<script lang="ts">
    /**
     * A high-level Svelte 5 component that provides resizing functionality.
     *
     * @remarks
     * Supports bounds, axis constraints, handles, and grid snapping.
     * Built with Svelte 5 runes and svelte-draggable.
     *
     * @example
     * ```svelte
     * <Resizable bind:width bind:height onResize={(e, data) => { ... }}>
     *   <div class="box">Resize me!</div>
     * </Resizable>
     * ```
     */
    import { type Snippet } from "svelte";
    import type { HTMLAttributes, ClassValue } from "svelte/elements";
    import type { Attachment } from "svelte/attachments";
    import { draggable, type DraggableData } from "$lib/draggable";
    import type {
        ResizableProps,
        ResizeHandleAxis,
        ResizeCallbackData,
    } from "./types";
    import "./resizable.css";

    /**
     * Properties for the {@link Resizable} component.
     */
    interface Props
        extends ResizableProps,
            Omit<HTMLAttributes<HTMLDivElement>, "class"> {
        /** The content to be made resizable. */
        children?: Snippet;
        /** Standard CSS classes to apply to the element. */
        class?: ClassValue;
        /** Current width of the element. */
        width: number;
        /** Current height of the element. */
        height: number;
    }

    let {
        axis = "both",
        draggableOpts = {},
        height = $bindable(),
        width = $bindable(),
        handleSize = [20, 20],
        lockAspectRatio = false,
        minConstraints = [20, 20],
        maxConstraints = [Infinity, Infinity],
        resizeHandles = ["se"],
        transformScale = 1,
        onResizeStart,
        onResize,
        onResizeStop,
        handleClass = "svelte-resizable-handle",
        children,
        class: className,
        style: styleProp,
        ...restProps
    }: Props = $props();

    // Internal tracking state - normal variables as they don't drive reactivity/rendering
    let lastHandleRect: DOMRect | null = null;
    let slack: [number, number] | null = null;
    let lastSize: { width: number; height: number } | null = null;

    /**
     * Resets internal tracking data.
     */
    function resetData() {
        lastHandleRect = null;
        slack = null;
        lastSize = null;
    }

    /**
     * Clamp width and height within provided constraints.
     */
    function runConstraints(
        newWidth: number,
        newHeight: number,
    ): [number, number] {
        if (!minConstraints && !maxConstraints && !lockAspectRatio)
            return [newWidth, newHeight];

        if (lockAspectRatio) {
            const ratio = width / height;
            newHeight = (newWidth * ratio + newHeight) / (ratio * ratio + 1);
            newWidth = newHeight * ratio;
        }

        const [oldW, oldH] = [newWidth, newHeight];
        const [slackW, slackH] = slack || [0, 0];
        newWidth += slackW;
        newHeight += slackH;

        if (minConstraints) {
            newWidth = Math.max(minConstraints[0], newWidth);
            newHeight = Math.max(minConstraints[1], newHeight);
        }
        if (maxConstraints) {
            newWidth = Math.min(maxConstraints[0], newWidth);
            newHeight = Math.min(maxConstraints[1], newHeight);
        }

        slack = [slackW + (oldW - newWidth), slackH + (oldH - newHeight)];

        return [newWidth, newHeight];
    }

    let resizeAttachments = new Map<string, Attachment<HTMLElement>>();
    function getResizeAttachment(axis: ResizeHandleAxis) {
        let att = resizeAttachments.get(axis);
        if (!att) {
            att = draggable(() => ({
                ...draggableOpts,
                onStart: createResizeHandler("onResizeStart", axis),
                onDrag: createResizeHandler("onResize", axis),
                onStop: createResizeHandler("onResizeStop", axis),
            }));
            resizeAttachments.set(axis, att);
        }
        return att;
    }

    /**
     * Factory for resize handlers.
     */
    function createResizeHandler(
        handlerName: "onResize" | "onResizeStart" | "onResizeStop",
        handleAxis: ResizeHandleAxis,
    ) {
        return (e: MouseEvent | TouchEvent, data: DraggableData) => {
            const { node, deltaX: rawDeltaX, deltaY: rawDeltaY } = data;
            let deltaX = rawDeltaX;
            let deltaY = rawDeltaY;

            if (handlerName === "onResizeStart") resetData();

            const canDragX =
                (axis === "both" || axis === "x") &&
                handleAxis !== "n" &&
                handleAxis !== "s";
            const canDragY =
                (axis === "both" || axis === "y") &&
                handleAxis !== "e" &&
                handleAxis !== "w";

            if (!canDragX && !canDragY) return;

            const axisV = handleAxis[0];
            const axisH = handleAxis[handleAxis.length - 1];

            const handleRect = node.getBoundingClientRect();
            if (lastHandleRect != null) {
                if (axisH === "w") {
                    deltaX += handleRect.left - lastHandleRect.left;
                }
                if (axisV === "n") {
                    deltaY += handleRect.top - lastHandleRect.top;
                }
            }
            lastHandleRect = handleRect;

            if (axisH === "w") deltaX = -deltaX;
            if (axisV === "n") deltaY = -deltaY;

            const baseWidth = lastSize?.width ?? width;
            const baseHeight = lastSize?.height ?? height;

            let calculatedWidth =
                baseWidth + (canDragX ? deltaX / transformScale : 0);
            let calculatedHeight =
                baseHeight + (canDragY ? deltaY / transformScale : 0);

            [calculatedWidth, calculatedHeight] = runConstraints(
                calculatedWidth,
                calculatedHeight,
            );

            if (handlerName === "onResizeStop" && lastSize) {
                calculatedWidth = lastSize.width;
                calculatedHeight = lastSize.height;
            }

            const dimensionsChanged =
                calculatedWidth !== baseWidth ||
                calculatedHeight !== baseHeight;

            if (handlerName !== "onResizeStop") {
                lastSize = { width: calculatedWidth, height: calculatedHeight };
            }

            const callbackData: ResizeCallbackData = {
                node,
                size: { width: calculatedWidth, height: calculatedHeight },
                handle: handleAxis,
            };

            if (handlerName === "onResizeStart" && onResizeStart) {
                onResizeStart(e, callbackData);
            } else if (
                handlerName === "onResize" &&
                onResize &&
                dimensionsChanged
            ) {
                // Update the source of truth
                width = calculatedWidth;
                height = calculatedHeight;
                onResize(e, callbackData);
            } else if (handlerName === "onResizeStop") {
                if (onResizeStop) onResizeStop(e, callbackData);
                resetData();
            }
        };
    }

</script>

<div
    class={["svelte-resizable", className]}
    style={styleProp}
    style:width={width + "px"}
    style:height={height + "px"}
    {...restProps}
>
    {@render children?.()}

    {#each resizeHandles as handleAxis (handleAxis)}
        <div
            class={[handleClass, `${handleClass}-${handleAxis}`]}
            {@attach getResizeAttachment(handleAxis)}
        ></div>
    {/each}
</div>
