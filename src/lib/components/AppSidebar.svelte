<script>
  import { goto } from '$app/navigation';

  export let isMobile;
  export let sidebarOpen;
  export let menu = [];
  export let lessons = [];
  export let selectedLesson = null;
  export let openMenuIdx = null;
  export let deleteLesson = () => {};
  export let setSidebarOpen = () => {};
  export let setSelectedLesson = () => {};
  export let setOpenMenuIdx = () => {};

  // Icons
  export let Export;
  export let PencilSimple;
  export let Archive;
  export let Trash;
  export let Sheet;
  export let Button;

  let deleteConfirmIdx = null;

  function handleMenuClick(label) {
    if (label === 'New lesson') goto('/parser');
    else if (label === 'Library') goto('/library');
  }
</script>

{#if isMobile}
  <Sheet.Root open={sidebarOpen} on:openChange={e => setSidebarOpen(e.detail)}>
    <Sheet.Trigger asChild>
      <button class="fixed top-3 left-3 z-30 flex h-9 w-9 items-center justify-center rounded-md border border-border bg-card text-2xl text-foreground shadow-sm md:hidden" aria-label="Open sidebar" on:click={() => setSidebarOpen(true)}>
        <svg width="24" height="24" fill="none" stroke="currentColor" stroke-width="2"><path d="M4 6h16M4 12h16M4 18h16"/></svg>
      </button>
    </Sheet.Trigger>
    <Sheet.Content side="left" class="p-0 w-[220px] max-w-[90vw] bg-sidebar border-r h-full flex flex-col">
      <div class="flex flex-col h-full">
        <div class="flex items-center gap-2 px-3 mb-6 mt-1">
          <a href="/" class="font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity cursor-pointer">Pași-Pași</a>
        </div>
        <nav class="flex-1 overflow-y-auto">
          <ul class="mb-6 space-y-1">
            {#each menu as item}
              <li>
                <Button variant="ghost" class="w-full justify-start gap-2" on:click={() => handleMenuClick(item.label)}>
                  <svelte:component this={item.icon} size={20} class="inline mr-2 align-middle" /> {item.label}
                </Button>
              </li>
            {/each}
          </ul>
          <ul class="space-y-1">
            {#each lessons as lesson}
              <li>
                <a href="#" class="block w-full truncate rounded px-3 py-2 text-[13px] hover:bg-accent/60 transition-colors" on:click|preventDefault={() => goto(`/lesson/${lesson.id}`)}>
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
        <a href="/" class="font-bold text-2xl tracking-tight hover:opacity-80 transition-opacity cursor-pointer">Pași-Pași</a>
      </div>
      <nav class="flex-1 overflow-y-auto">
        <ul class="mb-12 space-y-6">
          {#each menu as item}
            <li>
              <a href="#" class="block w-full truncate rounded px-3 hover:bg-accent/60 transition-colors text-[11px] font-medium tracking-wider"
                on:click|preventDefault={() => handleMenuClick(item.label)}>
                <svelte:component this={item.icon} size={18} weight="regular" class="inline align-bottom text-black" /> {item.label}
              </a>
            </li>
          {/each}
        </ul>
        <div class="mb-2 px-3 text-[11px] text-muted-foreground tracking-wider">Lessons</div>
        <ul class="space-y-1">
          {#each lessons as lesson, idx}
            <li class="group relative flex items-center">
              <a href="#" class="flex-1 truncate rounded px-3 py-1 text-[11px] hover:bg-accent/60 transition-colors font-medium tracking-wider" on:click|preventDefault={() => goto(`/lesson/${lesson.id}`)}>
  {lesson.title}
</a>
              <div class="flex items-center relative">
                <button class="lesson-menu opacity-60 hover:opacity-100 hover:bg-gray-200 rounded p-1 flex items-center justify-center transition-colors" tabindex="0"
                  on:click={() => setOpenMenuIdx(openMenuIdx === idx ? null : idx)}>
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24"><circle cx="5" cy="12" r="2"/><circle cx="12" cy="12" r="2"/><circle cx="19" cy="12" r="2"/></svg>
                </button>
                {#if openMenuIdx === idx}
                  <div class="lesson-menu absolute right-0 top-8 z-10 min-w-[120px] bg-popover border border-border rounded-md shadow-lg py-1 text-sm text-foreground" on:mousedown|stopPropagation>
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
                    {#if deleteConfirmIdx === idx}
                      <div class="px-3 py-2 text-sm">
                        Confirm delete?
                        <div class="flex gap-2 mt-2">
                          <button class="px-2 py-1 bg-red-600 text-white rounded" on:click={() => { deleteLesson(idx); deleteConfirmIdx = null; }}>Yes</button>
                          <button class="px-2 py-1 bg-gray-200 rounded" on:click={() => deleteConfirmIdx = null}>No</button>
                        </div>
                      </div>
                    {:else}
                      <button class="w-full px-3 py-2 text-red-600 hover:bg-red-50 text-left" on:click={() => deleteConfirmIdx = idx}>
                        <span class="inline-flex items-center gap-2">
                          <svelte:component this={Trash} size={16} class="-mt-0.5" />
                          Delete
                        </span>
                      </button>
                    {/if}
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
