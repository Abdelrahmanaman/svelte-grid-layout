import type { Attachment } from "svelte/attachments";
import { resize } from "./resize-attachment";

/**
 * Reactive container width helper for Svelte 5 components.
 *
 * @remarks
 * The returned `attachment` measures the element with `ResizeObserver` and
 * keeps `width` and `mounted` reactive without `onMount` or component effects.
 *
 * @param initialWidth - Width to expose before the element is measured.
 * @returns Reactive width state and an attachment for the measured container.
 *
 * @example
 * ```svelte
 * <script lang="ts">
 *   const container = useContainerWidth();
 * </script>
 *
 * <div {@attach container.attachment}>
 *   {container.width}
 * </div>
 * ```
 */
export function useContainerWidth(initialWidth = 1280): {
  readonly width: number;
  readonly mounted: boolean;
  readonly attachment: Attachment<HTMLElement>;
} {
  let width = $state(initialWidth);
  let mounted = $state(false);

  const attachment = resize((entry) => {
    width = entry.contentRect.width;
    mounted = true;
  });

  return {
    get width() {
      return width;
    },
    get mounted() {
      return mounted;
    },
    attachment,
  };
}
