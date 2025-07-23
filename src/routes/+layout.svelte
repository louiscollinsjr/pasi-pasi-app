<script lang="ts">
  import '../app.css';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Sheet from '$lib/components/ui/sheet/index';
  import { onMount } from 'svelte';

  let sidebarOpen = false;
  let lessons = [
    { id: 'sample_lesson_1', title: 'Învăță română cu Birkenbihl' },
    { id: 'lesson_2', title: 'Talk Outline Simplification' },
    { id: 'lesson_3', title: 'Întârziere serviciu local' },
    { id: 'lesson_4', title: 'Talk Prep Assistance' },
    // ... more mock lessons
  ];

  let menu = [
    { label: 'New Lesson', icon: '➕', action: () => {} },
    { label: 'Library', icon: '📚', action: () => {} },
    { label: 'Settings', icon: '⚙️', action: () => {} },
  ];

  // Responsive sidebar toggle
  let isMobile = false;
  onMount(() => {
    const checkMobile = () => {
      isMobile = window.innerWidth < 768;
    };
    checkMobile();
    window.addEventListener('resize', checkMobile);
    return () => window.removeEventListener('resize', checkMobile);
  });
</script>

<svelte:head>
  <style>
    html { font-size: 12px; }
  </style>
</svelte:head>

<div class="flex min-h-screen bg-background font-mono text-[12px]">
  <!-- Sidebar (desktop & mobile sheet) -->
  {#if isMobile}
    <Sheet.Root open={sidebarOpen} on:openChange={e => sidebarOpen = e.detail}>
      <Sheet.Trigger asChild>
        <button class="fixed top-3 left-3 z-30 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-2xl text-foreground shadow-sm md:hidden" aria-label="Open sidebar" on:click={() => sidebarOpen = true}>
          <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
        </button>
      </Sheet.Trigger>
      <Sheet.Content side="left" class="p-0 w-[220px] max-w-[90vw] bg-sidebar border-r h-full flex flex-col">
        <div class="flex flex-col h-full">
          <div class="flex items-center gap-2 px-3 mb-6 mt-1">
            <span class="font-bold text-lg tracking-tight">Pași-Pași</span>
          </div>
          <nav class="flex-1 overflow-y-auto">
            <div class="mb-4 px-3 text-xs text-muted-foreground uppercase tracking-wider">Menu</div>
            <ul class="mb-6 space-y-1">
              {#each menu as item}
                <li>
                  <Button variant="ghost" class="w-full justify-start gap-2 text-[13px]" on:click={item.action}>
                    <span>{item.icon}</span> {item.label}
                  </Button>
                </li>
              {/each}
            </ul>
            <div class="mb-2 px-3 text-xs text-muted-foreground uppercase tracking-wider">Lessons</div>
            <ul class="space-y-1">
              {#each lessons as lesson}
                <li>
                  <a href="#" class="block w-full truncate rounded px-3 py-2 text-[13px] hover:bg-accent/60 transition-colors">
                    {lesson.title}
                  </a>
                </li>
              {/each}
            </ul>
          </nav>
          <div class="mt-auto px-3 py-2 text-xs text-muted-foreground border-t border-border">
            <span>Louis Collins</span>
          </div>
        </div>
      </Sheet.Content>
    </Sheet.Root>
  {:else}
    <aside class="hidden md:flex flex-col w-[220px] max-w-[260px] min-h-screen border-r border-border bg-sidebar text-sidebar-foreground px-2 py-4">
      <div class="flex flex-col h-full">
        <div class="flex items-center gap-2 px-3 mb-6 mt-1">
          <span class="font-bold text-lg tracking-tight">Pași-Pași</span>
        </div>
        <nav class="flex-1 overflow-y-auto">
          <div class="mb-4 px-3 text-xs text-muted-foreground uppercase tracking-wider">Menu</div>
          <ul class="mb-6 space-y-1">
            {#each menu as item}
              <li>
                <Button variant="ghost" class="w-full justify-start gap-2 text-[13px]" on:click={item.action}>
                  <span>{item.icon}</span> {item.label}
                </Button>
              </li>
            {/each}
          </ul>
          <div class="mb-2 px-3 text-xs text-muted-foreground uppercase tracking-wider">Lessons</div>
          <ul class="space-y-1">
            {#each lessons as lesson}
              <li>
                <a href="#" class="block w-full truncate rounded px-3 py-2 text-[13px] hover:bg-accent/60 transition-colors">
                  {lesson.title}
                </a>
              </li>
            {/each}
          </ul>
        </nav>
        <div class="mt-auto px-3 py-2 text-xs text-muted-foreground border-t border-border">
          <span>Louis Collins</span>
        </div>
      </div>
    </aside>
  {/if}

  <!-- Main content area -->
  <main class="flex-1 flex flex-col items-center overflow-y-auto">
    <div class="w-full max-w-4xl px-4 py-8">
      <slot />
    </div>
  </main>
</div>

<!-- Sidebar Content inline as Svelte markup -->
<!-- Use in both Sheet.Content (mobile) and aside (desktop) -->
<div class="flex flex-col h-full">
  <div class="flex items-center gap-2 px-3 mb-6 mt-1">
    <span class="font-bold text-lg tracking-tight">Pași-Pași</span>
  </div>
  <nav class="flex-1 overflow-y-auto">
    <div class="mb-4 px-3 text-xs text-muted-foreground uppercase tracking-wider">Menu</div>
    <ul class="mb-6 space-y-1">
      {#each menu as item}
        <li>
          <Button variant="ghost" class="w-full justify-start gap-2 text-[13px]" on:click={item.action}>
            <span>{item.icon}</span> {item.label}
          </Button>
        </li>
      {/each}
    </ul>
    <div class="mb-2 px-3 text-xs text-muted-foreground uppercase tracking-wider">Lessons</div>
    <ul class="space-y-1">
      {#each lessons as lesson}
        <li>
          <a href="#" class="block w-full truncate rounded px-3 py-2 text-[13px] hover:bg-accent/60 transition-colors">
            {lesson.title}
          </a>
        </li>
      {/each}
    </ul>
  </nav>
  <div class="mt-auto px-3 py-2 text-xs text-muted-foreground border-t border-border">
    <span>Louis Collins</span>
  </div>
</div>
