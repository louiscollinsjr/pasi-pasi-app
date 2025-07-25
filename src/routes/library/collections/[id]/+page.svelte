<script lang="ts">
	import { page } from '$app/stores';
	import { onMount } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import LessonParser from '$lib/components/LessonParser.svelte';

	let collection = null;
	let documents = [];
	let loading = true;
	let error = null;

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
			.eq('collection_id', collectionId);

		if (fetchError) {
			error = fetchError.message;
		} else {
			documents = data;
		}
		loading = false;
	}

	function handleDocumentAdded(event) {
		documents = [...documents, event.detail];
	}

	onMount(async () => {
		await getCollectionDetails();
		await getLessons();
	});
</script>

<svelte:head>
	<title>{collection ? collection.title : 'Collection'} | Library</title>
</svelte:head>

<div class="container mx-auto p-4">
	{#if loading}
		<p>Loading...</p>
	{:else if error}
		<p class="text-red-500">{error}</p>
	{:else if collection}
		<h1 class="text-2xl font-bold mb-4">{collection.title}</h1>

		<div class="mb-8">
			<h2 class="text-xl font-semibold mb-2">Add New Document</h2>
			<LessonParser collectionId={collection.id} on:documentAdded={handleDocumentAdded} />
		</div>

		<div>
			<h2 class="text-xl font-semibold mb-2">Documents in this Collection</h2>
			{#if documents.length > 0}
				<ul class="space-y-2">
					{#each documents as document (document.id)}
						<li>
							<a href={`/lesson/${document.id}`} class="text-lg hover:underline">
								{document.title}
							</a>
						</li>
					{/each}
				</ul>
			{:else}
				<p>No documents in this collection yet.</p>
			{/if}
		</div>
	{:else}
		<p>Collection not found.</p>
	{/if}
</div>
