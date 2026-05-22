import type { Attachment } from "svelte/attachments";
import type { DraggableCoreProps, DraggableData, ControlPosition } from "./types";
import {
  addEvent,
  removeEvent,
  getTouchIdentifier,
  getTouch,
  offsetXYFromParent,
  snapToGrid,
  addUserSelectStyles,
  removeUserSelectStyles,
  matchesSelectorAndParentsTo,
} from "./utils";

/**
 * A Svelte attachment factory that enables draggable behavior on an element.
 *
 * @param props - The configuration properties for the draggable behavior.
 * @returns A Svelte Attachment function that handles the element lifecycle.
 *
 * @example
 * ```svelte
 * <div {@attach draggable({ axis: 'x', grid: [10, 10] })}>...</div>
 * ```
 *
 * @public
 */
export function draggable(
  propsOrGetter: DraggableCoreProps | (() => DraggableCoreProps),
): Attachment<HTMLElement> {
  const getProps = () => (typeof propsOrGetter === "function" ? propsOrGetter() : propsOrGetter);

  return (node) => {
    let dragging = false;
    let lastX = NaN;
    let lastY = NaN;
    let touchIdentifier: number | undefined = undefined;

    function createCoreData(x: number, y: number): DraggableData {
      const isStart = isNaN(lastX);
      if (isStart) {
        return {
          node,
          deltaX: 0,
          deltaY: 0,
          lastX: x,
          lastY: y,
          x,
          y,
        };
      } else {
        return {
          node,
          deltaX: x - lastX,
          deltaY: y - lastY,
          lastX: lastX,
          lastY: lastY,
          x,
          y,
        };
      }
    }

    function getControlPosition(e: MouseEvent | TouchEvent): ControlPosition | undefined {
      const touchObj =
        typeof touchIdentifier === "number" ? getTouch(e as TouchEvent, touchIdentifier) : null;
      if (typeof touchIdentifier === "number" && !touchObj) return undefined;

      const currentProps = getProps();
      const offsetParent =
        currentProps.offsetParent || node.offsetParent || node.ownerDocument.body;
      return offsetXYFromParent(
        touchObj || (e as MouseEvent),
        offsetParent as HTMLElement,
        currentProps.scale ?? 1,
      );
    }

    const handleDragStart = (e: MouseEvent | TouchEvent) => {
      const currentProps = getProps();
      if (currentProps.onMouseDown) currentProps.onMouseDown(e as MouseEvent);

      if (!currentProps.allowAnyClick && e instanceof MouseEvent && (e.button !== 0 || e.ctrlKey))
        return;

      if (
        currentProps.disabled ||
        !(e.target instanceof Node) ||
        (currentProps.handle &&
          !matchesSelectorAndParentsTo(e.target, currentProps.handle, node)) ||
        (currentProps.cancel && matchesSelectorAndParentsTo(e.target, currentProps.cancel, node))
      ) {
        return;
      }

      if (e instanceof TouchEvent && !currentProps.allowMobileScroll) {
        if (e.cancelable) e.preventDefault();
      }

      touchIdentifier = getTouchIdentifier(e);
      const position = getControlPosition(e);
      if (!position) return;
      const { x, y } = position;

      const coreEvent = createCoreData(x, y);
      if (currentProps.onStart && currentProps.onStart(e as any, coreEvent) === false) return;

      if (currentProps.enableUserSelectHack !== false) addUserSelectStyles(node.ownerDocument);

      dragging = true;
      lastX = x;
      lastY = y;

      const doc = node.ownerDocument;
      if (e instanceof MouseEvent) {
        addEvent(doc, "mousemove", handleDrag as EventListener);
        addEvent(doc, "mouseup", handleDragStop as EventListener);
      } else {
        addEvent(doc, "touchmove", handleDrag as EventListener, { passive: false });
        addEvent(doc, "touchend", handleDragStop as EventListener, { passive: false });
      }
    };

    const handleDrag = (e: MouseEvent | TouchEvent) => {
      const position = getControlPosition(e);
      if (!position) return;
      let { x, y } = position;

      const currentProps = getProps();
      if (Array.isArray(currentProps.grid)) {
        let deltaX = x - lastX,
          deltaY = y - lastY;
        [deltaX, deltaY] = snapToGrid(currentProps.grid, deltaX, deltaY);
        if (!deltaX && !deltaY) return;
        x = lastX + deltaX;
        y = lastY + deltaY;
      }

      const coreEvent = createCoreData(x, y);
      if (currentProps.onDrag && currentProps.onDrag(e as any, coreEvent) === false) {
        handleDragStop(new MouseEvent("mouseup") as any);
        return;
      }

      lastX = x;
      lastY = y;
    };

    const handleDragStop = (e: MouseEvent | TouchEvent) => {
      if (!dragging) return;

      const position = getControlPosition(e);
      if (!position) return;
      let { x, y } = position;

      const currentProps = getProps();
      if (Array.isArray(currentProps.grid)) {
        let deltaX = x - lastX || 0;
        let deltaY = y - lastY || 0;
        [deltaX, deltaY] = snapToGrid(currentProps.grid, deltaX, deltaY);
        x = lastX + deltaX;
        y = lastY + deltaY;
      }

      const coreEvent = createCoreData(x, y);
      if (currentProps.onStop && currentProps.onStop(e as any, coreEvent) === false) return;

      if (currentProps.enableUserSelectHack !== false) removeUserSelectStyles(node.ownerDocument);

      dragging = false;
      lastX = NaN;
      lastY = NaN;

      const doc = node.ownerDocument;
      removeEvent(doc, "mousemove", handleDrag as EventListener);
      removeEvent(doc, "mouseup", handleDragStop as EventListener);
      removeEvent(doc, "touchmove", handleDrag as EventListener);
      removeEvent(doc, "touchend", handleDragStop as EventListener);
    };

    const onMouseDown = (e: MouseEvent) => {
      handleDragStart(e);
    };

    const onTouchStart = (e: TouchEvent) => {
      handleDragStart(e);
    };

    const onDragStart = (e: Event) => {
      e.preventDefault();
    };

    addEvent(node, "mousedown", onMouseDown as EventListener);
    addEvent(node, "touchstart", onTouchStart as EventListener, { passive: false });
    addEvent(node, "dragstart", onDragStart as EventListener);

    return () => {
      removeEvent(node, "mousedown", onMouseDown as EventListener);
      removeEvent(node, "touchstart", onTouchStart as EventListener);
      removeEvent(node, "dragstart", onDragStart as EventListener);

      const doc = node.ownerDocument;
      removeEvent(doc, "mousemove", handleDrag as EventListener);
      removeEvent(doc, "mouseup", handleDragStop as EventListener);
      removeEvent(doc, "touchmove", handleDrag as EventListener);
      removeEvent(doc, "touchend", handleDragStop as EventListener);

      if (getProps().enableUserSelectHack !== false) removeUserSelectStyles(node.ownerDocument);
    };
  };
}
