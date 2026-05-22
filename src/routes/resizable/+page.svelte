<script lang="ts">
    import { ResizableBox } from "$lib/resizable";
    import type { ResizeCallbackData } from "$lib/resizable";

    let size1 = $state({ width: 200, height: 200 });
    let size2 = $state({ width: 200, height: 200 });
    let size3 = $state({ width: 200, height: 200 });

    function onResize1(e: MouseEvent | TouchEvent, data: ResizeCallbackData) {
        size1 = data.size;
    }

    function onResize2(e: MouseEvent | TouchEvent, data: ResizeCallbackData) {
        size2 = data.size;
    }

    function onResize3(e: MouseEvent | TouchEvent, data: ResizeCallbackData) {
        size3 = data.size;
    }
</script>

<div class="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
    <header class="mb-12">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">
            Svelte Resizable
        </h1>
        <p class="mt-2 text-slate-600 text-sm">
            A powerful Svelte 5 port of react-resizable.
        </p>
    </header>

    <div class="grid grid-cols-1 lg:grid-cols-2 xl:grid-cols-3 gap-12">
        <!-- Example 1: Standard -->
        <section>
            <h2
                class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500"
            >
                1. Standard (SE Handle)
            </h2>
            <ResizableBox
                width={200}
                height={200}
                onResize={onResize1}
                class="bg-white border border-slate-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
            >
                <div
                    class="p-4 flex-1 flex flex-col items-center justify-center text-center"
                >
                    <span class="text-xs font-bold text-blue-600 mb-1"
                        >Standard</span
                    >
                    <span class="text-[10px] font-mono text-slate-400">
                        {size1.width.toFixed(0)} x {size1.height.toFixed(0)}
                    </span>
                </div>
            </ResizableBox>
        </section>

        <!-- Example 2: Aspect Ratio & Constraints -->
        <section>
            <h2
                class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500"
            >
                2. Aspect Ratio (1:1)
            </h2>
            <ResizableBox
                width={200}
                height={200}
                lockAspectRatio={true}
                minConstraints={[100, 100]}
                maxConstraints={[300, 300]}
                onResize={onResize2}
                class="bg-indigo-50 border border-indigo-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
            >
                <div
                    class="p-4 flex-1 flex flex-col items-center justify-center text-center"
                >
                    <span class="text-xs font-bold text-indigo-600 mb-1"
                        >Square Lock</span
                    >
                    <p class="text-[9px] text-indigo-400 mb-2 leading-tight">
                        Min: 100, Max: 300
                    </p>
                    <span class="text-[10px] font-mono text-indigo-500">
                        {size2.width.toFixed(0)} x {size2.height.toFixed(0)}
                    </span>
                </div>
            </ResizableBox>
        </section>

        <!-- Example 3: All Handles -->
        <section>
            <h2
                class="mb-4 text-sm font-semibold uppercase tracking-wider text-slate-500"
            >
                3. All Directions
            </h2>
            <ResizableBox
                width={200}
                height={200}
                resizeHandles={["s", "w", "e", "n", "sw", "nw", "se", "ne"]}
                onResize={onResize3}
                class="bg-emerald-50 border border-emerald-200 rounded-xl shadow-sm overflow-hidden flex flex-col"
            >
                <div
                    class="p-4 flex-1 flex flex-col items-center justify-center text-center"
                >
                    <span class="text-xs font-bold text-emerald-600 mb-1"
                        >Omni-directional</span
                    >
                    <span class="text-[10px] font-mono text-emerald-500">
                        {size3.width.toFixed(0)} x {size3.height.toFixed(0)}
                    </span>
                </div>
            </ResizableBox>
        </section>
    </div>

    <footer class="mt-20 pt-8 border-t border-slate-200">
        <p class="text-[10px] text-slate-400 max-w-2xl">
            Note: Resizing from the top (n) or left (w) works by increasing the
            size of the container. In a real app, you would typically use these
            values to update your layout's state.
        </p>
    </footer>
</div>
