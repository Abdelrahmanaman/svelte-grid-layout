import type { Attachment } from "svelte/attachments";

/**
 * A Svelte 5 attachment that tracks changes to an element's dimensions using ResizeObserver.
 * Correctly throttles layout triggers with requestAnimationFrame and performs cleanup on disconnect.
 *
 * @param onResize - Callback invoked with the ResizeObserverEntry on every resize event
 * @returns A Svelte 5 attachment function
 *
 * @example
 * ```svelte
 * <div {@attach resize((entry) => console.log(entry.contentRect.width))}></div>
 * ```
 */
export function resize(onResize: (entry: ResizeObserverEntry) => void): Attachment<HTMLElement> {
  return (node) => {
    let rafId: number | null = null;

    // Perform an initial measurement synchronously if element is in the DOM
    const initialWidth = node.getBoundingClientRect().width || node.clientWidth;
    if (initialWidth) {
      onResize({
        target: node,
        contentRect: {
          width: initialWidth,
          height: node.getBoundingClientRect().height || node.clientHeight,
          x: 0,
          y: 0,
          top: 0,
          left: 0,
          bottom: 0,
          right: 0,
          toJSON: () => ({}),
        },
        borderBoxSize: [],
        contentBoxSize: [],
        devicePixelContentBoxSize: [],
      });
    }

    const observer = new ResizeObserver((entries) => {
      if (entries[0]) {
        const entry = entries[0];
        if (rafId !== null) {
          cancelAnimationFrame(rafId);
        }
        rafId = requestAnimationFrame(() => {
          onResize(entry);
          rafId = null;
        });
      }
    });

    observer.observe(node);

    return () => {
      if (rafId !== null) {
        cancelAnimationFrame(rafId);
      }
      observer.disconnect();
    };
  };
}
