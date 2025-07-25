<script lang="ts">
  import { onMount } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { collectionsService, documentsService } from '$lib/services/database';
  import { Button } from '$lib/components/ui/button/index';
  import type { Collection, Document } from '$lib/types/database';

  let user = null;
  let collections: Collection[] = [];
  let documents: Document[] = [];
  let loading = false;
  let message = '';
  let messageType: 'success' | 'error' = 'success';

  // Test data
  let newCollectionTitle = 'My First Romanian Collection';
  let newCollectionDescription = 'A collection of basic Romanian lessons';
  let newDocumentTitle = 'Lesson 1: Greetings';
  let newDocumentContent = `Bună ziua! Hello!

Salut! Hi!

Bună dimineața! Good morning!

Bună seara! Good evening!

La revedere! Goodbye!`;

  onMount(async () => {
    const { data } = await supabase.auth.getSession();
    user = data?.session?.user ?? null;

    supabase.auth.onAuthStateChange((_event, session) => {
      user = session?.user ?? null;
      if (user) {
        loadData();
      }
    });

    if (user) {
      loadData();
    }
  });

  async function loadData() {
    try {
      loading = true;
      collections = await collectionsService.getUserCollections();
      documents = await documentsService.getUserDocuments();
      showMessage('Data loaded successfully!', 'success');
    } catch (error) {
      showMessage(`Error loading data: ${error.message}`, 'error');
    } finally {
      loading = false;
    }
  }

  async function createTestCollection() {
    console.log('createTestCollection function called!');
    try {
      loading = true;
      const collection = await collectionsService.createCollection({
        title: newCollectionTitle,
        description: newCollectionDescription,
        is_public: false
      });
      
      collections = [collection, ...collections];
      showMessage(`Collection "${collection.title}" created successfully!`, 'success');
    } catch (error) {
      showMessage(`Error creating collection: ${error.message}`, 'error');
    } finally {
      loading = false;
    }
  }

  async function createTestDocument() {
    if (collections.length === 0) {
      showMessage('Please create a collection first!', 'error');
      return;
    }

    try {
      loading = true;
      const document = await documentsService.createDocument({
        collection_id: collections[0].id,
        title: newDocumentTitle,
        content: newDocumentContent,
        is_public: false
      });
      
      documents = [document, ...documents];
      showMessage(`Document "${document.title}" created successfully! Word count: ${document.word_count}, Paragraphs: ${document.paragraph_count}`, 'success');
    } catch (error) {
      showMessage(`Error creating document: ${error.message}`, 'error');
    } finally {
      loading = false;
    }
  }

  async function toggleCollectionPublic(collection: Collection) {
    try {
      const updated = await collectionsService.updateCollection(collection.id, {
        is_public: !collection.is_public
      });
      
      collections = collections.map(c => c.id === updated.id ? updated : c);
      showMessage(`Collection "${updated.title}" is now ${updated.is_public ? 'public' : 'private'}`, 'success');
    } catch (error) {
      showMessage(`Error updating collection: ${error.message}`, 'error');
    }
  }

  async function toggleDocumentPublic(document: Document) {
    try {
      const updated = await documentsService.updateDocument(document.id, {
        is_public: !document.is_public
      });
      
      documents = documents.map(d => d.id === updated.id ? updated : d);
      showMessage(`Document "${updated.title}" is now ${updated.is_public ? 'public' : 'private'}`, 'success');
    } catch (error) {
      showMessage(`Error updating document: ${error.message}`, 'error');
    }
  }

  async function deleteCollection(collection: Collection) {
    if (!confirm(`Are you sure you want to delete "${collection.title}"? This will also delete all documents in this collection.`)) {
      return;
    }

    try {
      await collectionsService.deleteCollection(collection.id);
      collections = collections.filter(c => c.id !== collection.id);
      documents = documents.filter(d => d.collection_id !== collection.id);
      showMessage(`Collection "${collection.title}" deleted successfully!`, 'success');
    } catch (error) {
      showMessage(`Error deleting collection: ${error.message}`, 'error');
    }
  }

  async function deleteDocument(document: Document) {
    if (!confirm(`Are you sure you want to delete "${document.title}"?`)) {
      return;
    }

    try {
      await documentsService.deleteDocument(document.id);
      documents = documents.filter(d => d.id !== document.id);
      showMessage(`Document "${document.title}" deleted successfully!`, 'success');
    } catch (error) {
      showMessage(`Error deleting document: ${error.message}`, 'error');
    }
  }

  function showMessage(text: string, type: 'success' | 'error') {
    message = text;
    messageType = type;
    setTimeout(() => {
      message = '';
    }, 5000);
  }
</script>

<div class="bg-white rounded-xl shadow-sm border border-gray-100 p-8 max-w-4xl w-full">
  <div class="space-y-8">
    <!-- Header -->
    <div class="text-center space-y-2">
      <h2 class="text-3xl font-semibold text-gray-900">Database Test</h2>
      <p class="text-gray-600">Test creating collections and documents with Supabase</p>
    </div>

    {#if !user}
      <div class="text-center p-8 bg-gray-50 rounded-lg">
        <p class="text-gray-600">Please log in to test the database functionality.</p>
      </div>
    {:else}
      <!-- Test Actions -->
      <div class="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-900">Test Actions</h3>
          
          <Button 
            on:click={createTestCollection}
            disabled={loading}
            class="w-full bg-blue-600 hover:bg-blue-700 text-white"
          >
            {loading ? 'Creating...' : 'Create Test Collection'}
          </Button>

          <Button 
            on:click={createTestDocument}
            disabled={loading || collections.length === 0}
            class="w-full bg-green-600 hover:bg-green-700 text-white"
          >
            {loading ? 'Creating...' : 'Create Test Document'}
          </Button>

          <Button 
            on:click={loadData}
            disabled={loading}
            variant="outline"
            class="w-full"
          >
            {loading ? 'Loading...' : 'Refresh Data'}
          </Button>
        </div>

        <!-- Stats -->
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-900">Current Data</h3>
          <div class="bg-gray-50 p-4 rounded-lg space-y-2">
            <p><strong>Collections:</strong> {collections.length}</p>
            <p><strong>Documents:</strong> {documents.length}</p>
            <p><strong>User:</strong> {user.email}</p>
          </div>
        </div>
      </div>

      <!-- Message Display -->
      {#if message}
        <div class="p-4 rounded-lg {messageType === 'success' ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}">
          <p class="text-sm font-medium {messageType === 'success' ? 'text-green-800' : 'text-red-800'}">
            {message}
          </p>
        </div>
      {/if}

      <!-- Collections Display -->
      {#if collections.length > 0}
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-900">Your Collections</h3>
          <div class="space-y-3">
            {#each collections as collection}
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-semibold text-gray-900">{collection.title}</h4>
                    <p class="text-sm text-gray-600">{collection.description || 'No description'}</p>
                    <p class="text-xs text-gray-500">
                      {collection.is_public ? '🌐 Public' : '🔒 Private'} • 
                      Created: {new Date(collection.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <Button
                      on:click={() => toggleCollectionPublic(collection)}
                      variant="outline"
                      size="sm"
                    >
                      Make {collection.is_public ? 'Private' : 'Public'}
                    </Button>
                    <Button
                      on:click={() => deleteCollection(collection)}
                      variant="outline"
                      size="sm"
                      class="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}

      <!-- Documents Display -->
      {#if documents.length > 0}
        <div class="space-y-4">
          <h3 class="text-xl font-semibold text-gray-900">Your Documents</h3>
          <div class="space-y-3">
            {#each documents as document}
              <div class="border border-gray-200 rounded-lg p-4">
                <div class="flex items-center justify-between">
                  <div>
                    <h4 class="font-semibold text-gray-900">{document.title}</h4>
                    <p class="text-sm text-gray-600">
                      {document.word_count} words • {document.paragraph_count} paragraphs
                    </p>
                    <p class="text-xs text-gray-500">
                      {document.is_public ? '🌐 Public' : '🔒 Private'} • 
                      Created: {new Date(document.created_at).toLocaleDateString()}
                    </p>
                  </div>
                  <div class="flex space-x-2">
                    <Button
                      on:click={() => toggleDocumentPublic(document)}
                      variant="outline"
                      size="sm"
                    >
                      Make {document.is_public ? 'Private' : 'Public'}
                    </Button>
                    <Button
                      on:click={() => deleteDocument(document)}
                      variant="outline"
                      size="sm"
                      class="text-red-600 border-red-300 hover:bg-red-50"
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              </div>
            {/each}
          </div>
        </div>
      {/if}
    {/if}
  </div>
</div>
