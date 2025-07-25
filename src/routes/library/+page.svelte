<script lang="ts">
	import { onMount } from 'svelte';
	import { Plus, FileText, Search } from 'lucide-svelte';
	import CollectionCard from '$lib/components/CollectionCard.svelte';
	import CreateCollectionModal from '$lib/components/CreateCollectionModal.svelte';
	import EmptyLibraryState from '$lib/components/EmptyLibraryState.svelte';
	import { supabase } from '$lib/supabaseClient';

	export let data;

	$: ({ collections: initialCollections, standaloneDocuments, error: initialError } = data);

	let collections = [];
	let error = initialError;
	let showCreateModal = false;
	let searchQuery = '';
	let collectionsWithCounts = [];
	let isLoading = false;

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
					<p class="text-gray-500 mt-2 text-lg">Organize and access your Romanian learning materials</p>
				</div>
				
				<!-- Search bar -->
				<div class="relative max-w-sm w-full sm:w-auto">
					<Search size={20} class="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-300" />
					<input
						type="text"
						bind:value={searchQuery}
						placeholder="Search collections and lessons..."
						class="w-full pl-12 pr-4 py-4 border border-gray-100 rounded-2xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-base bg-gray-50 focus:bg-white transition-colors"
					/>
				</div>
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
				<div class="flex items-center justify-between mb-8">
					<h2 class="text-2xl font-medium text-gray-900">Collections</h2>
					<button
						on:click={openCreateModal}
						class="inline-flex items-center gap-3 px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg"
					>
						<Plus size={18} />
						<span class="hidden sm:inline">Create Collection</span>
						<span class="sm:hidden">Create</span>
					</button>
				</div>

				{#if filteredCollections.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{#each filteredCollections as collection (collection.id)}
							<CollectionCard {collection} />
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
								<a 
									href="/lesson/{document.id}" 
									class="group block bg-white rounded-2xl border border-gray-100 hover:border-gray-200 hover:shadow-lg transition-all duration-300 p-6"
								>
									<div class="flex items-center gap-4">
										<div class="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
											<FileText size={20} class="text-gray-400" />
										</div>
										<div class="flex-1 min-w-0">
											<h3 class="font-medium text-gray-900 break-words group-hover:text-black transition-colors text-lg">
												{document.title}
											</h3>
											<p class="text-sm text-gray-400 mt-1">Standalone lesson</p>
										</div>
									</div>
								</a>
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
		<Plus size={28} />
	</button>

	<!-- Create Collection Modal -->
	<CreateCollectionModal 
		bind:isOpen={showCreateModal} 
		on:collectionCreated={handleCollectionCreated} 
	/>
</div>
