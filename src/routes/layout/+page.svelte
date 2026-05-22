<script lang="ts">
    import {
        GridBackground,
        GridLayout,
        ResponsiveGridLayout,
        WidthProvider,
        type Layout,
        type LayoutItem,
        type ResponsiveLayouts,
    } from "$lib";

    const dashboardSeed: Layout = [
        { i: "revenue", x: 0, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
        { i: "pipeline", x: 4, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
        { i: "latency", x: 8, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
        { i: "traffic", x: 0, y: 2, w: 8, h: 3, minW: 4, minH: 2 },
        { i: "alerts", x: 8, y: 2, w: 4, h: 3, minW: 3, minH: 2 },
    ];

    const operationsSeed: Layout = [
        { i: "queue", x: 0, y: 0, w: 3, h: 4, static: true },
        { i: "triage", x: 3, y: 0, w: 4, h: 2, minW: 2, minH: 2 },
        { i: "handoff", x: 7, y: 0, w: 5, h: 2, minW: 3, minH: 2 },
        { i: "notes", x: 3, y: 2, w: 5, h: 2, isResizable: false },
        { i: "review", x: 8, y: 2, w: 4, h: 2, minW: 2, minH: 2 },
    ];

    const responsiveSeed: ResponsiveLayouts = {
        lg: [
            { i: "inbox", x: 0, y: 0, w: 3, h: 2 },
            { i: "calendar", x: 3, y: 0, w: 3, h: 2 },
            { i: "focus", x: 6, y: 0, w: 6, h: 2 },
            { i: "timeline", x: 0, y: 2, w: 12, h: 2 },
        ],
        md: [
            { i: "inbox", x: 0, y: 0, w: 5, h: 2 },
            { i: "calendar", x: 5, y: 0, w: 5, h: 2 },
            { i: "focus", x: 0, y: 2, w: 10, h: 2 },
            { i: "timeline", x: 0, y: 4, w: 10, h: 2 },
        ],
        xs: [
            { i: "inbox", x: 0, y: 0, w: 4, h: 2 },
            { i: "calendar", x: 0, y: 2, w: 4, h: 2 },
            { i: "focus", x: 0, y: 4, w: 4, h: 2 },
            { i: "timeline", x: 0, y: 6, w: 4, h: 2 },
        ],
    };

    let dashboardLayout = $state(cloneLayout(dashboardSeed));
    let operationsLayout = $state(cloneLayout(operationsSeed));
    let responsiveLayouts = $state<ResponsiveLayouts>(
        cloneLayouts(responsiveSeed),
    );

    type CardTone = "amber" | "blue" | "emerald" | "indigo" | "rose" | "slate";

    interface DemoCard {
        title: string;
        value: string;
        detail: string;
        tone: CardTone;
    }

    const cards: Record<string, DemoCard> = {
        revenue: {
            title: "Revenue",
            value: "$482k",
            detail: "+12.4%",
            tone: "blue",
        },
        pipeline: {
            title: "Pipeline",
            value: "84",
            detail: "active deals",
            tone: "emerald",
        },
        latency: {
            title: "Latency",
            value: "142ms",
            detail: "p95",
            tone: "amber",
        },
        traffic: {
            title: "Traffic",
            value: "1.8m",
            detail: "requests",
            tone: "indigo",
        },
        alerts: {
            title: "Alerts",
            value: "7",
            detail: "open",
            tone: "rose",
        },
        queue: {
            title: "Support queue",
            value: "26",
            detail: "static lane",
            tone: "slate",
        },
        triage: {
            title: "Triage",
            value: "9",
            detail: "priority",
            tone: "blue",
        },
        handoff: {
            title: "Handoff",
            value: "14",
            detail: "ready",
            tone: "emerald",
        },
        notes: {
            title: "Notes",
            value: "Locked size",
            detail: "drag only",
            tone: "amber",
        },
        review: {
            title: "Review",
            value: "5",
            detail: "waiting",
            tone: "indigo",
        },
        inbox: {
            title: "Inbox",
            value: "18",
            detail: "unread",
            tone: "blue",
        },
        calendar: {
            title: "Calendar",
            value: "6",
            detail: "today",
            tone: "emerald",
        },
        focus: {
            title: "Focus",
            value: "3h 20m",
            detail: "deep work",
            tone: "indigo",
        },
        timeline: {
            title: "Timeline",
            value: "Q3 launch",
            detail: "milestone",
            tone: "rose",
        },
    };

    function cloneLayout(layout: Layout): Layout {
        return layout.map((item) => ({ ...item }));
    }

    function cloneLayouts(layouts: ResponsiveLayouts): ResponsiveLayouts {
        return Object.fromEntries(
            Object.entries(layouts).map(([breakpoint, layout]) => [
                breakpoint,
                layout ? cloneLayout(layout) : layout,
            ]),
        );
    }

    function resetDashboard() {
        dashboardLayout = cloneLayout(dashboardSeed);
    }

    function resetOperations() {
        operationsLayout = cloneLayout(operationsSeed);
    }

    function resetResponsive() {
        responsiveLayouts = cloneLayouts(responsiveSeed);
    }

    function cardFor(item: LayoutItem) {
        return (
            cards[item.i] ?? {
                title: item.i,
                value: `${item.w} x ${item.h}`,
                detail: "custom",
                tone: "slate",
            }
        );
    }

    function toneClass(tone: CardTone) {
        return {
            blue: "border-blue-200 bg-blue-50 text-blue-900",
            emerald: "border-emerald-200 bg-emerald-50 text-emerald-900",
            amber: "border-amber-200 bg-amber-50 text-amber-900",
            indigo: "border-indigo-200 bg-indigo-50 text-indigo-900",
            rose: "border-rose-200 bg-rose-50 text-rose-900",
            slate: "border-slate-200 bg-white text-slate-900",
        }[tone];
    }
</script>

<div class="min-h-screen bg-slate-50 p-6 font-sans text-slate-900 md:p-8">
    <header class="mb-8 flex flex-col gap-2">
        <h1 class="text-3xl font-bold tracking-tight">Svelte Grid Layout</h1>
        <p class="max-w-3xl text-sm leading-6 text-slate-600">
            Three direct demos for the Svelte 5 port: draggable dashboards,
            mixed item rules, and responsive breakpoint layouts.
        </p>
    </header>

    <div class="space-y-10">
        <section
            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
            <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h2
                        class="text-sm font-semibold uppercase tracking-wider text-slate-500"
                    >
                        1. Dashboard Cards
                    </h2>
                    <p class="mt-1 text-xs text-slate-500">
                        Drag or resize the cards. The background uses the same
                        grid metrics.
                    </p>
                </div>
                <button
                    class="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    onclick={resetDashboard}
                >
                    Reset
                </button>
            </div>

            <WidthProvider>
                {#snippet children(width)}
                    <div class="relative min-h-107.5">
                        <GridBackground
                            {width}
                            cols={12}
                            rowHeight={64}
                            margin={[12, 12]}
                            containerPadding={[12, 12]}
                            rows={5}
                            color="#f8fafc"
                            borderRadius={6}
                        />
                        <GridLayout
                            bind:layout={dashboardLayout}
                            {width}
                            gridConfig={{
                                cols: 12,
                                rowHeight: 64,
                                margin: [12, 12],
                                containerPadding: [12, 12],
                            }}
                            resizeConfig={{
                                enabled: true,
                                handles: ["se", "e", "s"],
                            }}
                        >
                            {#snippet children(item)}
                                {@const card = cardFor(item)}
                                <article
                                    class={[
                                        "flex h-full cursor-move flex-col justify-between rounded-md border p-4 shadow-sm",
                                        toneClass(card.tone),
                                    ]}
                                >
                                    <div
                                        class="flex items-start justify-between gap-3"
                                    >
                                        <h3 class="text-sm font-semibold">
                                            {card.title}
                                        </h3>
                                        <span
                                            class="rounded bg-white/70 px-2 py-0.5 text-[10px] font-mono text-slate-500"
                                        >
                                            {item.w} x {item.h}
                                        </span>
                                    </div>
                                    <div>
                                        <p
                                            class="text-2xl font-bold tracking-tight"
                                        >
                                            {card.value}
                                        </p>
                                        <p class="mt-1 text-xs opacity-70">
                                            {card.detail}
                                        </p>
                                    </div>
                                </article>
                            {/snippet}
                        </GridLayout>
                    </div>
                {/snippet}
            </WidthProvider>
        </section>

        <section
            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
            <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h2
                        class="text-sm font-semibold uppercase tracking-wider text-slate-500"
                    >
                        2. Mixed Item Rules
                    </h2>
                    <p class="mt-1 text-xs text-slate-500">
                        The support queue is static, notes are drag-only, and
                        all movement is bounded.
                    </p>
                </div>
                <button
                    class="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    onclick={resetOperations}
                >
                    Reset
                </button>
            </div>

            <WidthProvider>
                {#snippet children(width)}
                    <GridLayout
                        bind:layout={operationsLayout}
                        {width}
                        gridConfig={{
                            cols: 12,
                            rowHeight: 56,
                            margin: [10, 10],
                            containerPadding: [10, 10],
                        }}
                        dragConfig={{
                            enabled: true,
                            bounded: true,
                            threshold: 4,
                        }}
                        resizeConfig={{
                            enabled: true,
                            handles: ["se", "e", "s"],
                        }}
                    >
                        {#snippet children(item)}
                            {@const card = cardFor(item)}
                            <article
                                class={[
                                    "flex h-full cursor-move flex-col justify-between rounded-md border p-3 shadow-sm",
                                    toneClass(card.tone),
                                    item.static &&
                                        "cursor-default ring-2 ring-slate-200",
                                    item.isResizable === false &&
                                        "ring-2 ring-amber-200",
                                ]}
                            >
                                <div>
                                    <h3 class="text-sm font-semibold">
                                        {card.title}
                                    </h3>
                                    <p class="mt-1 text-xs opacity-70">
                                        {card.detail}
                                    </p>
                                </div>
                                <p class="text-xl font-bold tracking-tight">
                                    {card.value}
                                </p>
                            </article>
                        {/snippet}
                    </GridLayout>
                {/snippet}
            </WidthProvider>
        </section>

        <section
            class="rounded-lg border border-slate-200 bg-white p-4 shadow-sm"
        >
            <div class="mb-4 flex items-center justify-between gap-4">
                <div>
                    <h2
                        class="text-sm font-semibold uppercase tracking-wider text-slate-500"
                    >
                        3. Responsive Workspace
                    </h2>
                    <p class="mt-1 text-xs text-slate-500">
                        Resize the viewport or parent width. Layouts are stored
                        per breakpoint.
                    </p>
                </div>
                <button
                    class="rounded-md border border-slate-200 px-3 py-1.5 text-xs font-medium text-slate-600 hover:bg-slate-50"
                    onclick={resetResponsive}
                >
                    Reset
                </button>
            </div>

            <WidthProvider>
                {#snippet children(width)}
                    <ResponsiveGridLayout
                        bind:layouts={responsiveLayouts}
                        {width}
                        rowHeight={58}
                        margin={[10, 10]}
                        containerPadding={[10, 10]}
                        breakpoints={{ lg: 1100, md: 760, xs: 0 }}
                        cols={{ lg: 12, md: 10, xs: 4 }}
                        resizeConfig={{ enabled: true, handles: ["se"] }}
                    >
                        {#snippet children(item)}
                            {@const card = cardFor(item)}
                            <article
                                class={[
                                    "flex h-full cursor-move items-center justify-between rounded-md border p-4 shadow-sm",
                                    toneClass(card.tone),
                                ]}
                            >
                                <div>
                                    <h3 class="text-sm font-semibold">
                                        {card.title}
                                    </h3>
                                    <p class="mt-1 text-xs opacity-70">
                                        {card.detail}
                                    </p>
                                </div>
                                <p class="text-lg font-bold">{card.value}</p>
                            </article>
                        {/snippet}
                    </ResponsiveGridLayout>
                {/snippet}
            </WidthProvider>
        </section>
    </div>
</div>
