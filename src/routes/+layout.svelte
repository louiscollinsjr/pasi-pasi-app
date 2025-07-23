<script lang="ts">
  import '../app.css';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Sheet from '$lib/components/ui/sheet/index';
  import { onMount } from 'svelte';

  let sidebarOpen = false;
  let lessons = [];
let openMenuIdx = null;
let selectedLesson = null;

/** Deletes a lesson by index, with confirmation. */
function deleteLesson(idx: number) {
  const lesson = lessons[idx];
  if (!lesson) return;
  if (!confirm(`Delete lesson '${lesson.title}'? This cannot be undone.`)) return;
  const updated = [...lessons];
  updated.splice(idx, 1);
  localStorage.setItem('pasi_lessons', JSON.stringify(updated));
  lessons = updated;
  // If deleted lesson is selected, clear selection
  if (selectedLesson && selectedLesson.title === lesson.title) {
    selectedLesson = null;
  }
  openMenuIdx = null;
}

function loadLessons() {
  lessons = JSON.parse(localStorage.getItem('pasi_lessons') || '[]');
}

function handleOutsideClick(event) {
  if (!event.target.closest('.lesson-menu')) {
    openMenuIdx = null;
  }
}

function handleEsc(event) {
  if (event.key === 'Escape') {
    openMenuIdx = null;
  }
}

onMount(() => {
  loadLessons();
  window.addEventListener('storage', loadLessons);
  document.addEventListener('mousedown', handleOutsideClick);
  document.addEventListener('keydown', handleEsc);
  return () => {
    window.removeEventListener('storage', loadLessons);
    document.removeEventListener('mousedown', handleOutsideClick);
    document.removeEventListener('keydown', handleEsc);
  };
});

  import { FilePlus, Files, Gear, Export, PencilSimple, Archive, Trash } from 'phosphor-svelte';
  import LessonView from '$lib/components/LessonView.svelte';

let menu = [
  { label: 'New lesson', icon: FilePlus, action: () => {goto('/parser')} },
  { label: 'Library', icon: Files, action: () => {} },
  { label: 'Settings', icon: Gear, action: () => {} },
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

<div class="flex min-h-screen bg-background font-roboto text-xs">
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
            <span class="font-bold text-2xl tracking-tight">Pași-Pașis</span>
          </div>
          <nav class="flex-1 overflow-y-auto">
            <!-- <div class="mb-4 px-3 text-muted-foreground uppercase tracking-wider"></div> -->
            <ul class="mb-6 space-y-1">
              {#each menu as item}
                <li>
                  <Button variant="ghost" class="w-full justify-start gap-2" on:click={item.action}>
                    <svelte:component this={item.icon} size={20} class="inline mr-2 align-middle" /> {item.label}
                  </Button>
                </li>
              {/each}
            </ul>
            <!-- <div class="mb-2 px-3 text-xs text-muted-foreground uppercase tracking-wider"></div> -->
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
          <span class="font-bold text-2xl tracking-tight">Pași-Pași</span>
        </div>
        <nav class="flex-1 overflow-y-auto">
          <!-- <div class="mb-4 px-3 text-xs text-muted-foreground uppercase tracking-wider">Menu</div> -->
          <ul class="mb-12 space-y-6">
            {#each menu as item}
              <li>
                <a href="#" class="block w-full truncate rounded px-3 hover:bg-accent/60 transition-colors text-[11px] font-medium tracking-wider">
                  <svelte:component this={item.icon} size={18} weight="regular" class="inline align-bottom text-black" /> {item.label}
                </a>
              </li>
            {/each}
          </ul>
          <div class="mb-2 px-3 text-[11px] text-muted-foreground tracking-wider">Lessons</div>
          <ul class="space-y-1">
  {#each lessons as lesson, idx}
    <li class="group relative flex items-center">
      <a href="#" class="flex-1 truncate rounded px-3 py-1 text-[11px] hover:bg-accent/60 transition-colors font-medium tracking-wider"
        on:click|preventDefault={() => selectedLesson = lesson}>
        {lesson.title}
      </a>
      <div class="flex items-center relative">
        <button class="lesson-menu opacity-60 hover:opacity-100 hover:bg-gray-200 rounded p-1 flex items-center justify-center transition-colors" tabindex="0"
          on:click={() => openMenuIdx = openMenuIdx === idx ? null : idx}>
          <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
        </button>
        {#if openMenuIdx === idx}
          <div class="lesson-menu absolute right-0 top-8 z-10 min-w-[120px] bg-popover border border-border rounded-md shadow-lg py-1 text-sm text-foreground">
            <button class="w-full px-3 py-2 hover:bg-accent/50 text-left">
              <span class="inline-flex items-center gap-2">
                <svelte:component this={Export} size={16} class="-mt-0.5" />
                Share
              </span>
            </button>
            <button class="w-full px-3 py-2 hover:bg-accent/50 text-left">
              <span class="inline-flex items-center gap-2">
                <svelte:component this={PencilSimple} size={16} class="-mt-0.5" />
                Rename
              </span>
            </button>
            <button class="w-full px-3 py-2 hover:bg-accent/50 text-left">
              <span class="inline-flex items-center gap-2">
                <svelte:component this={Archive} size={16} class="-mt-0.5" />
                Archive
              </span>
            </button>
            <button class="w-full px-3 py-2 text-red-600 hover:bg-red-50 text-left"
  on:click={() => deleteLesson(idx)}>
  <span class="inline-flex items-center gap-2">
    <svelte:component this={Trash} size={16} class="-mt-0.5" />
    Delete
  </span>
</button>
          </div>
        {/if}
      </div>
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
    <div class="w-full max-w-6xl px-4 py-8">
      {#if selectedLesson}
        <LessonView lesson={selectedLesson} />
      {:else}
        <slot />
      {/if}
    </div>
  </main>
</div>