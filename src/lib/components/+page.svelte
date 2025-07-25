<script lang="ts">
	import { onMount } from 'svelte';
	import { Add, FileText, Search } from 'lucide-svelte';
	import CollectionCard from '$lib/components/CollectionCard.svelte';
	import CreateCollectionModal from '$lib/components/CreateCollectionModal.svelte';
	import EmptyLibraryState from '$lib/components/EmptyLibraryState.svelte';
	import RenameCollectionModal from '$lib/components/RenameCollectionModal.svelte';
	import LessonContextMenu from '$lib/components/LessonContextMenu.svelte';
	import AddToCollectionModal from '$lib/components/AddToCollectionModal.svelte';
	import { supabase } from '$lib/supabaseClient';

	export let data;

	$: ({ collections: initialCollections, standaloneDocuments, error: initialError } = data);

	let collections = [];
	let error = initialError;
	let showCreateModal = false;
	let showRenameModal = false;
	let showAddToCollectionModal = false;
	let selectedCollection = null;
	let selectedLesson = null;
	let searchQuery = '';
	let collectionsWithCounts = [];
	let isLoading = false;
	let lessonMenuStates = {};

	// Filter collections based on search query
	$: filteredCollections = collectionsWithCounts.filter(collection => 
		collection.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	// Filter standalone documents based on search query
	$: filteredStandaloneDocuments = standaloneDocuments.filter(doc => 
		doc.title.toLowerCase().includes(searchQuery.toLowerCase())
	);

	async function loadCollectionsWithCounts() {
		isLoading = true;
		try {
			// Get collections with lesson counts
			const { data: collectionsData, error: collectionsError } = await supabase
				.from('collections')
				.select(`
					id,
					title,
					created_at,
					documents:documents(count)
				`);

			if (collectionsError) {
				error = collectionsError.message;
				return;
			}

			// Transform the data to include lesson counts
			collectionsWithCounts = collectionsData?.map(collection => ({
				...collection,
				lesson_count: collection.documents?.[0]?.count || 0
			})) || [];
		} catch (err) {
			error = 'Failed to load collections';
		} finally {
			isLoading = false;
		}
	}

	function handleCollectionCreated(event) {
		const newCollection = {
			...event.detail,
			lesson_count: 0
		};
		collectionsWithCounts = [...collectionsWithCounts, newCollection];
		showCreateModal = false;
	}

	function openCreateModal() {
		showCreateModal = true;
	}
	
	function handleCollectionRename(event) {
		selectedCollection = event.detail;
		showRenameModal = true;
	}
	
	async function handleCollectionRemove(event) {
		const collection = event.detail;
		if (confirm(`Are you sure you want to delete "${collection.title}"? This will also remove all lessons in this collection.`)) {
			try {
				const { error: deleteError } = await supabase
					.from('collections')
					.delete()
					.eq('id', collection.id);
				
				if (deleteError) {
					error = deleteError.message;
					return;
				}
				
				collectionsWithCounts = collectionsWithCounts.filter(c => c.id !== collection.id);
			} catch (err) {
				error = 'Failed to delete collection';
			}
		}
	}
	
	function handleCollectionRenamed(event) {
		const updatedCollection = event.detail;
		collectionsWithCounts = collectionsWithCounts.map(c => 
			c.id === updatedCollection.id ? { ...c, title: updatedCollection.title } : c
		);
		showRenameModal = false;
		selectedCollection = null;
	}
	
	function handleLessonShare(event) {
		const lesson = event.detail;
		// Copy lesson URL to clipboard
		const url = `${window.location.origin}/lesson/${lesson.id}`;
		navigator.clipboard.writeText(url).then(() => {
			alert('Lesson link copied to clipboard!');
		}).catch(() => {
			alert('Failed to copy link');
		});
	}
	
	function handleLessonAddToCollection(event) {
		selectedLesson = event.detail;
		showAddToCollectionModal = true;
	}
	
	function handleLessonMarkComplete(event) {
		const lesson = event.detail;
		// TODO: Implement lesson completion tracking
		alert(`Marked "${lesson.title}" as complete!`);
	}
	
	async function handleLessonRemove(event) {
		const lesson = event.detail;
		if (confirm(`Are you sure you want to delete "${lesson.title}"? This action cannot be undone.`)) {
			try {
				const { error: deleteError } = await supabase
					.from('documents')
					.delete()
					.eq('id', lesson.id);
				
				if (deleteError) {
					error = deleteError.message;
					return;
				}
				
				// Remove from local state
				standaloneDocuments = standaloneDocuments.filter(d => d.id !== lesson.id);
			} catch (err) {
				error = 'Failed to delete lesson';
			}
		}
	}
	
	function handleLessonAddedToCollection(event) {
		showAddToCollectionModal = false;
		selectedLesson = null;
		// Remove from standalone documents since it's now in a collection
		standaloneDocuments = standaloneDocuments.filter(d => d.id !== event.detail.lesson.id);
		alert('Lesson added to collection successfully!');
	}

	onMount(() => {
		loadCollectionsWithCounts();
	});

</script>

<svelte:head>
	<title>Library</title>
</svelte:head>

<div class="min-h-screen bg-white">
	<!-- Header Section -->
	<div class="border-b border-gray-100">
		<div class="container mx-auto px-6 py-12">
			<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6">
				<div>
					<h1 class="text-3xl font-medium text-gray-900">Your Library</h1>
					<p class="text-gray-500 mt-2 text-lg">Organize and access your lessons and stories</p>
				</div>
				
				<!-- Create Collection Button -->
				<button
					on:click={openCreateModal}
					class="hidden sm:inline-flex items-center gap-3 px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg"
				>
					<Add size={18} />
					<span class="hidden sm:inline">Create Collection</span>
				</button>
			</div>
		</div>
	</div>

	<!-- Main Content -->
	<div class="container mx-auto px-4 py-8">
		{#if error}
			<div class="bg-red-50 border border-red-100 rounded-2xl p-6 mb-8">
				<p class="text-red-600">{error}</p>
			</div>
		{/if}

		{#if isLoading}
			<div class="flex items-center justify-center py-12">
				<div class="w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
				<span class="ml-3 text-gray-600">Loading your library...</span>
			</div>
		{:else}
			<!-- Collections Section -->
			<div class="mb-16">
				<div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-6 mb-8">
					<h2 class="text-2xl font-medium text-gray-900">Collections</h2>
					
					<!-- Search bar -->
					<div class="relative max-w-sm w-full sm:w-auto">
						<Search size={20} class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" />
						<input
							type="text"
							bind:value={searchQuery}
							placeholder="Search collections and lessons..."
							class="w-full pl-12 pr-4 py-4  border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-base bg-gray-50 focus:bg-white transition-colors"
						/>
					</div>
				</div>

				{#if filteredCollections.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{#each filteredCollections as collection (collection.id)}
							<CollectionCard 
								{collection} 
								on:rename={handleCollectionRename}
								on:remove={handleCollectionRemove}
							/>
						{/each}
					</div>
				{:else if collectionsWithCounts.length === 0}
					<EmptyLibraryState on:createCollection={openCreateModal} />
				{:else}
					<div class="text-center py-12">
						<p class="text-gray-400 text-lg">No collections match your search.</p>
					</div>
				{/if}
			</div>

			<!-- Standalone Documents Section -->
			{#if standaloneDocuments.length > 0}
				<div>
					<h2 class="text-2xl font-medium text-gray-900 mb-8">Quick Access Lessons</h2>
					
					{#if filteredStandaloneDocuments.length > 0}
						<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
							{#each filteredStandaloneDocuments as document (document.id)}
								<div class="group relative bg-gray-50 rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 p-6">
									<a 
										href="/lesson/{document.id}" 
										class="flex items-center gap-4"
									>
										<div class="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
											<FileText size={20} class="text-gray-400" />
										</div>
										<div class="flex-1 min-w-0">
											<h3 class="font-medium text-gray-900 break-words group-hover:text-black transition-colors text-lg">
												{document.title}
											</h3>
											<p class="text-sm text-gray-400 mt-1">Standalone lesson</p>
										</div>
									</a>
									
									<!-- Context Menu positioned in bottom-right -->
									<div class="absolute bottom-4 right-4">
										<LessonContextMenu 
											lesson={document}
											bind:isOpen={lessonMenuStates[document.id]}
											on:share={handleLessonShare}
											on:addToCollection={handleLessonAddToCollection}
											on:markComplete={handleLessonMarkComplete}
											on:remove={handleLessonRemove}
										/>
									</div>
								</div>
							{/each}
						</div>
					{:else}
						<div class="text-center py-12">
							<p class="text-gray-400 text-lg">No standalone lessons match your search.</p>
						</div>
					{/if}
					
					<div class="mt-8 text-center">
						<p class="text-sm text-gray-400">
							Add more lessons from the 
							<a href="/import" class="text-gray-600 hover:text-black underline transition-colors">import page</a>
						</p>
					</div>
				</div>
			{/if}
		{/if}
	</div>

	<!-- Floating Action Button (Mobile) -->
	<button
		on:click={openCreateModal}
		class="fixed bottom-8 right-8 w-16 h-16 bg-black hover:bg-gray-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center sm:hidden z-40"
		aria-label="Create new collection"
	>
		<Add size={28} />
	</button>

	<!-- Create Collection Modal -->
	<CreateCollectionModal 
		bind:isOpen={showCreateModal} 
		on:collectionCreated={handleCollectionCreated} 
	/>
	
	<!-- Rename Collection Modal -->
	<RenameCollectionModal 
		bind:isOpen={showRenameModal}
		collection={selectedCollection}
		on:collectionRenamed={handleCollectionRenamed}
	/>
	
	<!-- Add to Collection Modal -->
	<AddToCollectionModal 
		bind:isOpen={showAddToCollectionModal}
		lesson={selectedLesson}
		on:lessonAdded={handleLessonAddedToCollection}
	/>
</div>
