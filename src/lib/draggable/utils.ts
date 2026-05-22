import type { ControlPosition, Bounds, PositionOffsetControlPosition } from "./types";

/**
 * Checks if a value is a valid number and not NaN.
 * @param num - The value to check.
 */
export function isNum(num: any): num is number {
  return typeof num === "number" && !isNaN(num);
}

/**
 * Parses a string to an integer with base 10.
 * @param a - The string to parse.
 */
export function int(a: string): number {
  return parseInt(a, 10);
}

/**
 * Checks if an element matches a given CSS selector.
 * @param el - The element to check.
 * @param selector - The CSS selector string.
 */
export function matchesSelector(el: Node, selector: string): boolean {
  if (!(el instanceof Element)) return false;
  return el.matches(selector);
}

/**
 * Traverses up the DOM tree from an element to a base node to find a match for a selector.
 * @param el - The starting element.
 * @param selector - The CSS selector to match.
 * @param baseNode - The node where the search should stop.
 */
export function matchesSelectorAndParentsTo(el: Node, selector: string, baseNode: Node): boolean {
  let node: Node | null = el;
  do {
    if (matchesSelector(node, selector)) return true;
    if (node === baseNode) return false;
    node = node.parentNode;
  } while (node);

  return false;
}

/**
 * Adds an event listener to an element.
 */
export function addEvent(
  el: Node | Window | Document,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: AddEventListenerOptions,
): void {
  el.addEventListener(event, handler, options);
}

/**
 * Removes an event listener from an element.
 */
export function removeEvent(
  el: Node | Window | Document,
  event: string,
  handler: EventListenerOrEventListenerObject,
  options?: EventListenerOptions,
): void {
  el.removeEventListener(event, handler, options);
}

/**
 * Calculates the outer height of an element, including borders but excluding margins.
 */
export function outerHeight(node: HTMLElement): number {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView!.getComputedStyle(node);
  height += int(computedStyle.borderTopWidth);
  height += int(computedStyle.borderBottomWidth);
  return height;
}

/**
 * Calculates the outer width of an element, including borders but excluding margins.
 */
export function outerWidth(node: HTMLElement): number {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView!.getComputedStyle(node);
  width += int(computedStyle.borderLeftWidth);
  width += int(computedStyle.borderRightWidth);
  return width;
}

/**
 * Calculates the inner height of an element, excluding padding and borders.
 */
export function innerHeight(node: HTMLElement): number {
  let height = node.clientHeight;
  const computedStyle = node.ownerDocument.defaultView!.getComputedStyle(node);
  height -= int(computedStyle.paddingTop);
  height -= int(computedStyle.paddingBottom);
  return height;
}

/**
 * Calculates the inner width of an element, excluding padding and borders.
 */
export function innerWidth(node: HTMLElement): number {
  let width = node.clientWidth;
  const computedStyle = node.ownerDocument.defaultView!.getComputedStyle(node);
  width -= int(computedStyle.paddingLeft);
  width -= int(computedStyle.paddingRight);
  return width;
}

/**
 * Calculates the X and Y coordinates relative to an offset parent.
 */
export function offsetXYFromParent(
  evt: { clientX: number; clientY: number },
  offsetParent: HTMLElement,
  scale: number,
): ControlPosition {
  const isBody = offsetParent === offsetParent.ownerDocument.body;
  const offsetParentRect = isBody ? { left: 0, top: 0 } : offsetParent.getBoundingClientRect();

  const x = (evt.clientX + offsetParent.scrollLeft - offsetParentRect.left) / scale;
  const y = (evt.clientY + offsetParent.scrollTop - offsetParentRect.top) / scale;

  return { x, y };
}

/**
 * Finds a touch object by its identifier in a TouchEvent.
 */
export function getTouch(
  e: TouchEvent,
  identifier: number,
): { clientX: number; clientY: number } | undefined {
  return (
    Array.from(e.targetTouches).find((t) => identifier === t.identifier) ||
    Array.from(e.changedTouches).find((t) => identifier === t.identifier)
  );
}

/**
 * Extracts the touch identifier from a TouchEvent or MouseEvent.
 */
export function getTouchIdentifier(e: TouchEvent | MouseEvent): number | undefined {
  if ("targetTouches" in e && e.targetTouches[0]) return e.targetTouches[0].identifier;
  if ("changedTouches" in e && e.changedTouches[0]) return e.changedTouches[0].identifier;
  return undefined;
}

/**
 * Injects styles into the document head to prevent text selection during dragging.
 */
export function addUserSelectStyles(doc: Document | undefined) {
  if (!doc) return;
  let styleEl = doc.getElementById("svelte-draggable-style-el");
  if (!styleEl) {
    styleEl = doc.createElement("style");
    styleEl.id = "svelte-draggable-style-el";
    styleEl.innerHTML =
      ".svelte-draggable-transparent-selection *::-moz-selection {all: inherit;}\n" +
      ".svelte-draggable-transparent-selection *::selection {all: inherit;}\n";
    doc.head.appendChild(styleEl);
  }
  if (doc.body) doc.body.classList.add("svelte-draggable-transparent-selection");
}

/**
 * Removes the styles injected to prevent text selection.
 */
export function removeUserSelectStyles(doc: Document | undefined) {
  if (!doc || !doc.body) return;
  doc.body.classList.remove("svelte-draggable-transparent-selection");
  const selection = (doc.defaultView || window).getSelection();
  if (selection && selection.type !== "Caret") {
    selection.removeAllRanges();
  }
}

/**
 * Generates a CSS translate string for a given position and offset.
 */
export function getTranslation(
  { x, y }: ControlPosition,
  positionOffset: PositionOffsetControlPosition | undefined,
  unitSuffix: string,
): string {
  let translation = `translate(${x}${unitSuffix},${y}${unitSuffix})`;
  if (positionOffset) {
    const defaultX =
      typeof positionOffset.x === "string" ? positionOffset.x : positionOffset.x + unitSuffix;
    const defaultY =
      typeof positionOffset.y === "string" ? positionOffset.y : positionOffset.y + unitSuffix;
    translation = `translate(${defaultX}, ${defaultY})` + translation;
  }
  return translation;
}

/**
 * Snaps a value to a grid.
 */
export function snapToGrid(
  grid: [number, number],
  pendingX: number,
  pendingY: number,
): [number, number] {
  const x = Math.round(pendingX / grid[0]) * grid[0];
  const y = Math.round(pendingY / grid[1]) * grid[1];
  return [x, y];
}

/**
 * Calculates the bounded position for an element based on the provided bounds.
 */
export function getBoundPosition(
  bounds: Bounds | string | false,
  node: HTMLElement,
  x: number,
  y: number,
): [number, number] {
  if (!bounds) return [x, y];

  let resolvedBounds: Bounds;
  if (typeof bounds === "string") {
    const { ownerDocument } = node;
    const ownerWindow = ownerDocument.defaultView!;
    let boundNode: HTMLElement | null;
    if (bounds === "parent") {
      boundNode = node.parentElement;
    } else {
      const rootNode = node.getRootNode() as Document | ShadowRoot | Element;
      boundNode = rootNode.querySelector(bounds) as HTMLElement;
    }

    if (!boundNode) {
      throw new Error(`Bounds selector "${bounds}" could not find an element.`);
    }

    const nodeStyle = ownerWindow.getComputedStyle(node);
    const boundNodeStyle = ownerWindow.getComputedStyle(boundNode);

    resolvedBounds = {
      left: -node.offsetLeft + int(boundNodeStyle.paddingLeft) + int(nodeStyle.marginLeft),
      top: -node.offsetTop + int(boundNodeStyle.paddingTop) + int(nodeStyle.marginTop),
      right:
        innerWidth(boundNode) -
        outerWidth(node) -
        node.offsetLeft +
        int(boundNodeStyle.paddingRight) -
        int(nodeStyle.marginRight),
      bottom:
        innerHeight(boundNode) -
        outerHeight(node) -
        node.offsetTop +
        int(boundNodeStyle.paddingBottom) -
        int(nodeStyle.marginBottom),
    };
  } else {
    resolvedBounds = bounds;
  }

  if (isNum(resolvedBounds.right)) x = Math.min(x, resolvedBounds.right);
  if (isNum(resolvedBounds.bottom)) y = Math.min(y, resolvedBounds.bottom);
  if (isNum(resolvedBounds.left)) x = Math.max(x, resolvedBounds.left);
  if (isNum(resolvedBounds.top)) y = Math.max(y, resolvedBounds.top);

  return [x, y];
}
