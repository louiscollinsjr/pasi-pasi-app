<script lang="ts">
  import { createEventDispatcher, onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { X, Plus, FolderPlus, Search } from 'lucide-svelte';
  import { clickOutside } from '$lib/utils/clickOutside';
  
  export let isOpen = false;
  export let lesson: any = null;
  
  const dispatch = createEventDispatcher();
  
  let collections = [];
  let filteredCollections = [];
  let searchQuery = '';
  let loading = false;
  let error = '';
  let showCreateNew = false;
  let newCollectionTitle = '';
  let creatingCollection = false;
  
  $: filteredCollections = collections.filter(collection =>
    collection.title.toLowerCase().includes(searchQuery.toLowerCase())
  );
  
  async function loadCollections() {
    loading = true;
    try {
      const { data, error: fetchError } = await supabase
        .from('collections')
        .select('id, title, created_at')
        .order('title');
      
      if (fetchError) {
        error = fetchError.message;
      } else {
        collections = data || [];
      }
    } catch (err) {
      error = 'Failed to load collections';
    } finally {
      loading = false;
    }
  }
  
  async function addToCollection(collectionId: string) {
    try {
      const { error: updateError } = await supabase
        .from('documents')
        .update({ collection_id: collectionId })
        .eq('id', lesson.id);
      
      if (updateError) {
        error = updateError.message;
        return;
      }
      
      dispatch('lessonAdded', { lesson, collectionId });
      close();
    } catch (err) {
      error = 'Failed to add lesson to collection';
    }
  }
  
  async function createNewCollection() {
    if (!newCollectionTitle.trim()) return;
    
    creatingCollection = true;
    try {
      const { data: newCollection, error: createError } = await supabase
        .from('collections')
        .insert([{ title: newCollectionTitle.trim() }])
        .select()
        .single();
      
      if (createError) {
        error = createError.message;
        return;
      }
      
      // Add lesson to the new collection
      await addToCollection(newCollection.id);
    } catch (err) {
      error = 'Failed to create collection';
    } finally {
      creatingCollection = false;
    }
  }
  
  function close() {
    isOpen = false;
    searchQuery = '';
    showCreateNew = false;
    newCollectionTitle = '';
    error = '';
  }
  
  function toggleCreateNew() {
    showCreateNew = !showCreateNew;
    if (showCreateNew) {
      setTimeout(() => {
        const input = document.querySelector('#new-collection-input');
        if (input) input.focus();
      }, 100);
    }
  }
  
  onMount(() => {
    if (isOpen) {
      loadCollections();
    }
  });
  
  $: if (isOpen) {
    loadCollections();
  }
</script>

{#if isOpen}
  <div class="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
    <div
      use:clickOutside={close}
      class="bg-white rounded-2xl shadow-xl w-full max-w-md max-h-[80vh] overflow-hidden"
    >
      <!-- Header -->
      <div class="flex items-center justify-between p-6 border-b border-gray-100">
        <h2 class="text-xl font-medium text-gray-900">Add to Collection</h2>
        <button
          on:click={close}
          class="text-gray-400 hover:text-gray-600 transition-colors"
        >
          <X size={20} />
        </button>
      </div>
      
      <!-- Content -->
      <div class="p-6">
        {#if lesson}
          <div class="mb-6">
            <p class="text-sm text-gray-500 mb-2">Adding lesson:</p>
            <p class="font-medium text-gray-900 truncate">{lesson.title}</p>
          </div>
        {/if}
        
        {#if error}
          <div class="bg-red-50 border border-red-100 rounded-lg p-3 mb-4">
            <p class="text-red-600 text-sm">{error}</p>
          </div>
        {/if}
        
        <!-- Search -->
        <div class="relative mb-4">
          <Search size={16} class="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            bind:value={searchQuery}
            placeholder="Search collections..."
            class="w-full pl-10 pr-4 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
          />
        </div>
        
        <!-- Collections List -->
        <div class="max-h-60 overflow-y-auto mb-4">
          {#if loading}
            <div class="flex items-center justify-center py-8">
              <div class="w-6 h-6 border-2 border-gray-300 border-t-gray-900 rounded-full animate-spin"></div>
            </div>
          {:else if filteredCollections.length > 0}
            <div class="space-y-2">
              {#each filteredCollections as collection (collection.id)}
                <button
                  on:click={() => addToCollection(collection.id)}
                  class="w-full text-left p-3 rounded-lg border border-gray-100 hover:border-gray-200 hover:bg-gray-50 transition-colors"
                >
                  <div class="flex items-center gap-3">
                    <FolderPlus size={16} class="text-gray-400" />
                    <span class="font-medium text-gray-900">{collection.title}</span>
                  </div>
                </button>
              {/each}
            </div>
          {:else}
            <div class="text-center py-8">
              <p class="text-gray-500">
                {searchQuery ? 'No collections match your search.' : 'No collections found.'}
              </p>
            </div>
          {/if}
        </div>
        
        <!-- Create New Collection -->
        <div class="border-t border-gray-100 pt-4">
          {#if showCreateNew}
            <form on:submit|preventDefault={createNewCollection} class="space-y-3">
              <input
                id="new-collection-input"
                type="text"
                bind:value={newCollectionTitle}
                placeholder="Collection name"
                class="w-full px-3 py-2 border border-gray-200 rounded-lg focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent"
                required
              />
              <div class="flex gap-2">
                <button
                  type="submit"
                  disabled={creatingCollection || !newCollectionTitle.trim()}
                  class="flex-1 px-4 py-2 bg-gray-900 text-white rounded-lg hover:bg-gray-800 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {creatingCollection ? 'Creating...' : 'Create & Add'}
                </button>
                <button
                  type="button"
                  on:click={toggleCreateNew}
                  class="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
                >
                  Cancel
                </button>
              </div>
            </form>
          {:else}
            <button
              on:click={toggleCreateNew}
              class="w-full flex items-center justify-center gap-2 p-3 text-gray-600 hover:text-gray-800 hover:bg-gray-50 rounded-lg transition-colors"
            >
              <Plus size={16} />
              Create New Collection
            </button>
          {/if}
        </div>
      </div>
    </div>
  </div>
{/if}
