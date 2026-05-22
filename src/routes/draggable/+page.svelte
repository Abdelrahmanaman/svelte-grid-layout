<script lang="ts">
    import { Draggable } from "$lib/draggable";

    let activeDrags = $state(0);

    const onStart = () => {
        activeDrags += 1;
    };
    const onStop = () => {
        activeDrags -= 1;
    };
</script>

<div class="min-h-screen bg-slate-50 p-8 font-sans text-slate-900">
    <header class="mb-12">
        <h1 class="text-3xl font-bold tracking-tight text-slate-900">
            Svelte Draggable Bounding Demo
        </h1>
        <p class="mt-2 text-slate-600 italic">
            "The invisible electric fence demo"
        </p>
        <div
            class="mt-4 inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-sm font-medium text-blue-700 ring-1 ring-inset ring-blue-700/10"
        >
            Active Drags: {activeDrags}
        </div>
    </header>

    <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-12 text-sm">
        <!-- Case 1: Standard -->
        <section>
            <h2
                class="mb-2 font-semibold uppercase tracking-wider text-slate-500"
            >
                1. No Cage
            </h2>
            <p class="text-[10px] text-slate-400 mb-4 leading-tight">
                Default: element can fly anywhere, even off-screen.
            </p>
            <Draggable {onStart} {onStop} class="w-fit h-fit">
                <div
                    class="flex h-32 w-32 cursor-move items-center justify-center rounded-xl border border-slate-200 bg-white shadow-sm hover:border-slate-300 transition-colors"
                >
                    <span class="text-xs font-medium">Free Bird</span>
                </div>
            </Draggable>
        </section>

        <!-- Case 2: Hamster Cage (Immediate Parent) -->
        <section>
            <h2
                class="mb-2 font-semibold uppercase tracking-wider text-slate-500"
            >
                2. Immediate Parent
            </h2>
            <p class="text-[10px] text-slate-400 mb-4 leading-tight">
                Locked to the dashed box immediately surrounding it.
            </p>
            <div
                class="relative h-48 w-full rounded-xl border-2 border-dashed border-slate-200 bg-slate-100/50 overflow-hidden"
            >
                <Draggable
                    bounds="parent"
                    {onStart}
                    {onStop}
                    class="w-fit h-fit"
                >
                    <div
                        class="flex h-20 w-20 cursor-move items-center justify-center rounded-lg border border-indigo-200 bg-indigo-600 text-white shadow-lg"
                    >
                        <span class="text-[10px] font-bold text-center"
                            >Bound to Parent</span
                        >
                    </div>
                </Draggable>
            </div>
        </section>

        <!-- Case 3: Living Room (Body) -->
        <section>
            <h2
                class="mb-2 font-semibold uppercase tracking-wider text-slate-500"
            >
                3. Living Room (Body)
            </h2>
            <p class="text-[10px] text-slate-400 mb-4 leading-tight">
                Stuck inside the browser window edges.
            </p>
            <Draggable bounds="body" {onStart} {onStop} class="w-fit h-fit">
                <div
                    class="flex h-32 w-32 cursor-move items-center justify-center rounded-xl border border-emerald-200 bg-emerald-50 text-emerald-700 shadow-sm"
                >
                    <span class="text-xs font-medium text-center px-4"
                        >Window-locked</span
                    >
                </div>
            </Draggable>
        </section>

        <!-- Case 4: Grandparent Park (Selector) -->
        <section>
            <h2
                class="mb-2 font-semibold uppercase tracking-wider text-slate-500"
            >
                4. Selector (Grandparent)
            </h2>
            <p class="text-[10px] text-slate-400 mb-4 leading-tight">
                I can escape my small grey parent to fill the yellow park!
            </p>

            <!-- GRANDPARENT (The Park) -->
            <div
                class="the-park h-64 w-full rounded-xl border-2 border-amber-200 bg-amber-50/50 relative overflow-hidden p-0"
            >
                <div
                    class="absolute bottom-2 left-2 text-[10px] text-amber-600 font-bold uppercase"
                >
                    The Park (Grandparent)
                </div>

                <!-- INTERMEDIATE PARENT (Small grey box) -->
                <div
                    class="h-24 w-40 border border-slate-300 bg-slate-200/50 rounded p-2 flex items-center justify-center"
                >
                    <Draggable
                        bounds=".the-park"
                        {onStart}
                        {onStop}
                        class="w-fit h-fit"
                    >
                        <div
                            class="flex h-12 w-12 cursor-move items-center justify-center rounded border border-amber-200 bg-amber-500 text-white shadow-lg"
                        >
                            <span class="text-[8px] font-bold text-center"
                                >Explorer</span
                            >
                        </div>
                    </Draggable>
                </div>
                <div class="mt-2 text-[8px] text-slate-400 font-mono">
                    Small Parent Box
                </div>
            </div>
        </section>

        <!-- Case 5: The Leash (Object) -->
        <section>
            <h2
                class="mb-2 font-semibold uppercase tracking-wider text-slate-500"
            >
                5. The Leash (Object)
            </h2>
            <p class="text-[10px] text-slate-400 mb-4 leading-tight">
                Can only move 50px away from the center start point.
            </p>
            <div
                class="relative h-48 w-full flex items-center justify-center bg-slate-200/20 rounded-xl"
            >
                <Draggable
                    bounds={{ left: -50, top: -50, right: 50, bottom: 50 }}
                    {onStart}
                    {onStop}
                    class="w-fit h-fit"
                >
                    <div
                        class="flex h-20 w-20 cursor-move items-center justify-center rounded-lg border border-rose-200 bg-rose-600 text-white shadow-lg"
                    >
                        <span class="text-[10px] font-bold text-center"
                            >Short Leash</span
                        >
                    </div>
                </Draggable>
                <div
                    class="absolute h-25 w-25 border border-rose-200/50 rounded-lg pointer-events-none border-dotted"
                ></div>
            </div>
        </section>
    </div>
</div>
