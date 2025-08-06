<script lang="ts">
  import { page } from '$app/stores';
  import { goto } from '$app/navigation';
  import { X, Gear } from 'phosphor-svelte';
  import Button from '$lib/components/ui/button/button.svelte';
  import { user as userStore } from '$lib/stores/userStore';
  import { supabase } from '$lib/supabaseClient';

  export let sidebarOpen = false;
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

  let deleteConfirmIdx = null;

  async function logout() {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Error logging out:', error);
    } else {
      await goto('/login');
    }
  }

  function handleMenuClick(event, label) {
    event.preventDefault();
    if (label === 'New lesson') goto('/parser');
    else if (label === 'Library') goto('/library');
    else if (label === 'Settings') goto('/settings');

    // Close sidebar on mobile after navigation
    if (window.innerWidth < 768) {
      closeSidebar();
    }
  }

  function closeSidebar() {
    setSidebarOpen(false);
  }
</script>

<!-- Sidebar overlay for mobile -->
{#if sidebarOpen}
  <div class="fixed inset-0 z-40 backdrop-blur-sm md:hidden" on:click={closeSidebar}></div>
{/if}

<!-- Sidebar -->
<aside class="{sidebarOpen ? 'translate-x-0' : '-translate-x-full'} fixed top-16 left-0 z-40 w-64 h-[calc(100vh-4rem)] bg-white transition-transform duration-300 ease-in-out overflow-hidden">
  <div class="flex flex-col h-full">
    <!-- Close button for mobile -->
    <div class="flex items-center justify-between p-4 md:hidden">
      <!-- <span class="text-lg font-semibold text-gray-900">Menu</span>
      <button 
        class="p-2 hover:bg-gray-100 rounded-md transition-colors"
        on:click={closeSidebar}
        aria-label="Close sidebar"
      >
        <X size={20} class="text-gray-600" />
      </button> -->
    </div>

    <!-- Navigation content -->
    <nav class="flex-1 overflow-y-auto px-4 sm:px-8 py-6 space-y-6 sm:pt-20">
      <!-- Main menu items -->
      <div class="space-y-2">
        {#each menu as item}
          <a 
            href="#" 
            class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
            on:click={(e) => handleMenuClick(e, item.label)}
            class:bg-gray-100={(($page.url.pathname.startsWith('/parser') && item.label === 'New lesson') || ($page.url.pathname.startsWith('/library') && item.label === 'Library'))}
          >
            <svelte:component this={item.icon} size={18} class="text-gray-500" />
            {item.label}
          </a>
        {/each}
        <!-- Settings link -->
        <a 
          href="#"
          class="w-full flex items-center gap-3 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors text-left"
          on:click={(e) => handleMenuClick(e, 'Settings')}
          class:bg-gray-100={$page.url.pathname.startsWith('/settings')}
        >
          <Gear size={18} class="text-gray-500" />
          Settings
        </a>
      </div>

      <!-- Lessons section -->
      {#if lessons.length > 0}
        <div class="pt-20">
          <h3 class="px-3 mb-3 text-sm font-medium text-gray-500 tracking-wider">Recent Stories:</h3>
          <div class="space-y-1">
            {#each lessons as lesson, idx}
              <div class="group relative flex items-center">
                <button 
                  class="flex-1 text-left px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 rounded-md transition-colors truncate"
                  on:click={() => goto(`/lesson/${lesson.id}`)}
                >
                  {lesson.title}
                </button>
                
                <!-- Lesson menu button -->
                <button 
                  class="opacity-0 group-hover:opacity-100 p-1 hover:bg-gray-200 rounded transition-all"
                  on:click={() => setOpenMenuIdx(openMenuIdx === idx ? null : idx)}
                  aria-label="Lesson options"
                >
                  <svg width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" viewBox="0 0 24 24" class="text-gray-500">
                    <circle cx="5" cy="12" r="2"/>
                    <circle cx="12" cy="12" r="2"/>
                    <circle cx="19" cy="12" r="2"/>
                  </svg>
                </button>

                <!-- Lesson dropdown menu -->
                {#if openMenuIdx === idx}
                  <div class="absolute right-0 top-8 z-10 min-w-[140px] bg-white rounded-md shadow-lg border border-gray-200 py-1" on:mousedown|stopPropagation>
                    <button class="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2">
                      <svelte:component this={Export} size={14} class="text-gray-500" />
                      Share
                    </button>
                    <button class="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2">
                      <svelte:component this={PencilSimple} size={14} class="text-gray-500" />
                      Rename
                    </button>
                    <button class="w-full px-3 py-2 text-sm text-gray-700 hover:bg-gray-50 text-left flex items-center gap-2">
                      <svelte:component this={Archive} size={14} class="text-gray-500" />
                      Archive
                    </button>
                    
                    {#if deleteConfirmIdx === idx}
                      <div class="px-3 py-2 border-t border-gray-100">
                        <p class="text-sm text-gray-700 mb-2">Confirm delete?</p>
                        <div class="flex gap-2">
                          <button 
                            class="px-2 py-1 bg-red-600 text-white text-xs rounded hover:bg-red-700 transition-colors"
                            on:click={() => { deleteLesson(idx); deleteConfirmIdx = null; }}
                          >
                            Yes
                          </button>
                          <button 
                            class="px-2 py-1 bg-gray-200 text-gray-700 text-xs rounded hover:bg-gray-300 transition-colors"
                            on:click={() => deleteConfirmIdx = null}
                          >
                            No
                          </button>
                        </div>
                      </div>
                    {:else}
                      <button 
                        class="w-full px-3 py-2 text-sm text-red-600 hover:bg-red-50 text-left flex items-center gap-2 border-t border-gray-100"
                        on:click={() => deleteConfirmIdx = idx}
                      >
                        <svelte:component this={Trash} size={14} class="text-red-500" />
                        Delete
                      </button>
                    {/if}
                  </div>
                {/if}
              </div>
            {/each}
          </div>
        </div>
      {/if}
    </nav>

    <!-- Mobile login/logout section at bottom -->
    <div class="md:hidden mt-auto pt-6 pb-8">
      {#if $userStore}
        <div class="space-y-3">
          <div class="text-sm text-gray-600">
            Signed in as <span class="font-medium">{$userStore.email}</span>
          </div>
          <Button on:click={logout} variant="outline" size="sm" class="w-3/4 mx-auto">
            Log out
          </Button>
        </div>
      {:else}
        <a href="/login" 
           class="block w-3/4 mx-auto text-center text-base rounded-full font-medium bg-gray-100 text-black px-6 py-3 focus:outline-none focus:ring-2 focus:ring-primary transition-colors hover:bg-gray-200"
           on:click={closeSidebar}>
          Log in
        </a>
      {/if}
    </div>
  </div>
</aside>
