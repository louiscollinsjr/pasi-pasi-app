<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { MoreHorizontal, Share, FolderPlus, Check, Trash2 } from 'lucide-svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  
  export let lesson: any;
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
  
  function handleShare() {
    dispatch('share', lesson);
    closeMenu();
  }
  
  function handleAddToCollection() {
    dispatch('addToCollection', lesson);
    closeMenu();
  }
  
  function handleMarkComplete() {
    dispatch('markComplete', lesson);
    closeMenu();
  }
  
  function handleRemove() {
    dispatch('remove', lesson);
    closeMenu();
  }
</script>

<div class="relative">
  <button
    bind:this={buttonElement}
    on:click|stopPropagation={toggleMenu}
    class="p-2 text-gray-400 hover:text-gray-600 hover:bg-gray-100 rounded-lg transition-colors"
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
        on:click={handleShare}
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
      >
        <Share size={16} />
        Share
      </button>
      
      <button
        on:click={handleAddToCollection}
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
      >
        <FolderPlus size={16} />
        Add to Collection
      </button>
      
      <button
        on:click={handleMarkComplete}
        class="w-full px-4 py-2 text-left text-sm text-gray-700 hover:bg-gray-50 flex items-center gap-3"
      >
        <Check size={16} />
        Mark Complete
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
