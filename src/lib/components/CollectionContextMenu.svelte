<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MoreHorizontal, Edit3, Trash2 } from 'lucide-svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  
  export let collection: any;
  export let isOpen = false;
  
  const dispatch = createEventDispatcher();
  let buttonElement: HTMLElement;
  let menuElement: HTMLElement;
  
  function toggleMenu() {
    isOpen = !isOpen;
    if (isOpen && buttonElement && menuElement) {
      // Position the menu to avoid clipping
      const rect = buttonElement.getBoundingClientRect();
      const menuRect = menuElement.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      
      // Check if menu would be clipped on the right
      if (rect.right + menuRect.width > viewportWidth) {
        menuElement.style.right = '0';
        menuElement.style.left = 'auto';
      } else {
        menuElement.style.left = '0';
        menuElement.style.right = 'auto';
      }
    }
  }
  
  function closeMenu() {
    isOpen = false;
  }
  
  function handleRename() {
    dispatch('rename', collection);
    closeMenu();
  }
  
  function handleRemove() {
    dispatch('remove', collection);
    closeMenu();
  }
</script>

<div class="relative">
  <button
    bind:this={buttonElement}
    on:click|stopPropagation={toggleMenu}
    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors opacity-0 group-hover:opacity-100"
    aria-label="More options"
  >
    <MoreHorizontal size={16} />
  </button>
  
  {#if isOpen}
    <div
      bind:this={menuElement}
      use:clickOutside={closeMenu}
      class="absolute right-0 top-full mt-1 w-48 bg-white rounded-lg shadow-lg border border-gray-200 py-1 z-[9999]"
    >
      <button
        on:click={handleRename}
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
      >
        <Edit3 size={16} />
        Rename
      </button>
      
      <hr class="my-1" />
      
      <button
        on:click={handleRemove}
        class="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-3"
      >
        <Trash2 size={16} />
        Remove
      </button>
    </div>
  {/if}
</div>
