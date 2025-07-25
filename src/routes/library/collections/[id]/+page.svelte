<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import LessonParser from '$lib/components/LessonParser.svelte';
	import LessonContextMenu from '$lib/components/LessonContextMenu.svelte';
	import AddToCollectionModal from '$lib/components/AddToCollectionModal.svelte';
	import { ArrowLeft, Plus, FileText, Calendar, BookOpen } from 'lucide-svelte';

	let collection = null;
	let documents = [];
	let loading = true;
	let error = null;
	let showAddLesson = false;
	let showAddToCollectionModal = false;
	let selectedLesson = null;
	let lessonMenuStates = {};

	const collectionId = $page.params.id;

	async function getCollectionDetails() {
		const { data, error: fetchError } = await supabase
			.from('collections')
			.select('*')
			.eq('id', collectionId)
			.single();

		if (fetchError) {
			error = fetchError.message;
		} else {
			collection = data;
		}
	}

	async function getLessons() {
		const { data, error: fetchError } = await supabase
			.from('documents')
			.select('*')
			.eq('collection_id', collectionId)
			.order('created_at', { ascending: false });

		if (fetchError) {
			error = fetchError.message;
		} else {
			documents = data || [];
		}
		loading = false;
	}

	function handleDocumentAdded(event) {
		documents = [event.detail, ...documents];
		showAddLesson = false;
	}

	function toggleAddLesson() {
		showAddLesson = !showAddLesson;
	}

	function formatDate(dateString) {
		return new Date(dateString).toLocaleDateString('en-US', {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		});
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
		if (confirm(`Are you sure you want to remove "${lesson.title}" from this collection?`)) {
			try {
				const { error: updateError } = await supabase
					.from('documents')
					.update({ collection_id: null })
					.eq('id', lesson.id);
				
				if (updateError) {
					error = updateError.message;
					return;
				}
				
				documents = documents.filter(d => d.id !== lesson.id);
			} catch (err) {
				error = 'Failed to remove lesson from collection';
			}
		}
	}
	
	function handleLessonAddedToCollection(event) {
		showAddToCollectionModal = false;
		selectedLesson = null;
		// Optionally refresh the lesson list or show a success message
		alert('Lesson added to collection successfully!');
	}

	onMount(async () => {
		await getCollectionDetails();
		await getLessons();
	});
</script>

<svelte:head>
	<title>{collection ? collection.title : 'Collection'} | Library</title>
</svelte:head>

<div class="min-h-screen bg-white">
	{#if loading}
		<div class="flex items-center justify-center min-h-screen">
			<div class="w-8 h-8 border-4 border-gray-900 border-t-transparent rounded-full animate-spin"></div>
			<span class="ml-3 text-gray-500">Loading collection...</span>
		</div>
	{:else if error}
		<div class="container mx-auto px-6 py-12">
			<div class="bg-red-50 border border-red-100 rounded-2xl p-6">
				<p class="text-red-600">{error}</p>
			</div>
		</div>
	{:else if collection}
		<!-- Header Section -->
		<div class="border-b border-gray-100">
			<div class="container mx-auto px-6 py-8">
				<div class="mb-6">
				<!-- Breadcrumb Navigation -->
				<div class="flex items-center gap-3 mb-4">
					<a href="/library" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
						Library
					</a>
					<span class="text-gray-300">/</span>
					<div class="p-1.5 bg-gray-50 rounded-lg">
						<BookOpen size={14} class="text-gray-400" />
					</div>
				</div>
				
				<div class="flex-1">
					<h1 class="text-3xl font-medium text-gray-900 break-words">{collection.title}</h1>
					<div class="flex items-center gap-6 mt-3 text-sm text-gray-400">
						<div class="flex items-center gap-2">
							<FileText size={16} />
							<span>{documents.length} {documents.length === 1 ? 'lesson' : 'lessons'}</span>
						</div>
						{#if collection.created_at}
							<div class="flex items-center gap-2">
								<Calendar size={16} />
								<span>Created {formatDate(collection.created_at)}</span>
							</div>
						{/if}
					</div>
				</div>
			</div>

				<!-- Action Button -->
				<div class="flex justify-end">
					<button
						on:click={toggleAddLesson}
						class="inline-flex items-center gap-3 px-6 py-3 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg"
					>
						<Plus size={18} />
						<span class="hidden sm:inline">Add Lesson</span>
						<span class="sm:hidden">Add</span>
					</button>
				</div>
			</div>
		</div>

		<!-- Main Content -->
		<div class="container mx-auto px-6 py-12">
			<!-- Add Lesson Section -->
			{#if showAddLesson}
				<div class="bg-gray-50 rounded-2xl border border-gray-100 p-8 mb-12">
					<div class="flex items-center justify-between mb-6">
						<h2 class="text-xl font-medium text-gray-900">
							Add New Lesson
						</h2>
						<button
							on:click={toggleAddLesson}
							class="text-gray-300 hover:text-gray-500 transition-colors p-2"
							aria-label="Close add lesson form"
						>
							<Plus size={24} class="rotate-45" />
						</button>
					</div>
					<LessonParser collectionId={collection.id} on:documentAdded={handleDocumentAdded} />
				</div>
			{/if}

			<!-- Lessons Grid -->
			<div>
				<h2 class="text-2xl font-medium text-gray-900 mb-8">Lessons</h2>
				
				{#if documents.length > 0}
					<div class="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
						{#each documents as document (document.id)}
							<div class="group relative bg-gray-100 rounded-2xl border border-gray-100 hover:border-gray-100 hover:shadow-none transition-all duration-300">
								<div class="p-8">
									<a 
										href="/lesson/{document.id}" 
										class="flex items-start gap-4"
									>
										<!-- <div class="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors flex-shrink-0">
											<BookOpen size={24} class="text-gray-400" />
										</div> -->
										<div class="flex-1 min-w-0">
											<h3 class="font-medium text-gray-900 group-hover:text-black transition-colors break-words text-lg mb-2">
												{document.title}
											</h3>
											{#if document.created_at}
												<p class="text-sm text-gray-400">
													Added {formatDate(document.created_at)}
												</p>
											{/if}
										</div>
									</a>
								</div>
								
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
					<!-- Empty State -->
					<div class="text-center py-16">
						<div class="mx-auto w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-8">
							<BookOpen size={36} class="text-gray-300" />
						</div>
						<h3 class="text-2xl font-medium text-gray-900 mb-3">
							No lessons yet
						</h3>
						<p class="text-gray-500 mb-10 text-lg">
							Start building your collection by adding your first lesson.
						</p>
						<button
							on:click={toggleAddLesson}
							class="inline-flex items-center gap-3 px-8 py-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg"
						>
							<Plus size={20} />
							Add Your First Lesson
						</button>
					</div>
				{/if}
			</div>
		</div>

		<!-- Floating Action Button (Mobile) -->
		<button
			on:click={toggleAddLesson}
			class="fixed bottom-8 right-8 w-16 h-16 bg-black hover:bg-gray-800 text-white rounded-2xl shadow-xl hover:shadow-2xl transition-all duration-300 flex items-center justify-center sm:hidden z-40"
			aria-label="Add new lesson"
		>
			<Plus size={28} />
		</button>
		
		<!-- Add to Collection Modal -->
		<AddToCollectionModal 
			bind:isOpen={showAddToCollectionModal}
			lesson={selectedLesson}
			on:lessonAdded={handleLessonAddedToCollection}
		/>
	{:else}
		<div class="container mx-auto px-6 py-12">
			<div class="text-center py-16">
				<p class="text-gray-500 text-lg">Collection not found.</p>
				<a href="/library" class="text-gray-600 hover:text-black underline mt-4 inline-block transition-colors">
					Return to Library
				</a>
			</div>
		</div>
	{/if}
</div>
