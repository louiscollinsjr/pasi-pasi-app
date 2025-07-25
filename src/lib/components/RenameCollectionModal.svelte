<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { X } from 'lucide-svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  
  export let isOpen = false;
  export let collection: any = null;
  
  const dispatch = createEventDispatcher();
  
  let newTitle = '';
  let loading = false;
  let error = '';
  
  async function renameCollection() {
    if (!newTitle.trim() || !collection) return;
    
    loading = true;
    error = '';
    
    try {
      const { error: updateError } = await supabase
        .from('collections')
        .update({ title: newTitle.trim() })
        .eq('id', collection.id);
      
      if (updateError) {
        error = updateError.message;
        return;
      }
      
      dispatch('collectionRenamed', { 
        ...collection, 
        title: newTitle.trim() 
      });
      close();
    } catch (err) {
      error = 'Failed to rename collection';
    } finally {
      loading = false;
    }
  }
  
  function close() {
    isOpen = false;
    newTitle = '';
    error = '';
  }
  
  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      close();
    }
  }
  
  $: if (isOpen && collection) {
    newTitle = collection.title;
    setTimeout(() => {
      const input = document.querySelector('#rename-input');
      if (input) {
        (input as HTMLInputElement).focus();
        (input as HTMLInputElement).select();
      }
    }, 100);
  }
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen && collection}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div
      use:clickOutside={close}
      class="bg-white rounded-2xl shadow-xl w-full max-w-md"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-medium text-gray-900">Rename Collection</h2>
        <button
          on:click={close}
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <!-- Content -->
      <form on:submit|preventDefault={renameCollection} class="p-6">
        {#if error}
          <div class="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
            <p class="text-red-600 text-sm">{error}</p>
          </div>
        {/if}
        
        <div class="mb-6">
          <label for="rename-input" class="block text-sm font-medium text-gray-700 mb-2">
            Collection Name
          </label>
          <input
            id="rename-input"
            type="text"
            bind:value={newTitle}
            placeholder="Enter collection name"
            class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
            required
          />
        </div>
        
        <div class="flex gap-3 justify-end">
          <button
            type="button"
            on:click={close}
            class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading || !newTitle.trim() || newTitle.trim() === collection.title}
            class="px-6 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            {loading ? 'Renaming...' : 'Rename'}
          </button>
        </div>
      </form>
    </div>
  </div>
{/if}
