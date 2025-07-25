<script lang="ts">
	
	import { supabase } from '$lib/supabaseClient';

	export let data;

	$: ({ collections, standaloneDocuments, error } = data);

	let newCollectionName: string = '';

	async function createCollection() {
		if (!newCollectionName.trim()) {
			alert('Please enter a collection name.');
			return;
		}

		const { data, error: insertError } = await supabase
			.from('collections')
			.insert([{ title: newCollectionName.trim() }])
			.select();

		if (insertError) {
			error = insertError.message;
		} else if (data) {
			collections = [...collections, ...data];
			newCollectionName = '';
		}
	}

</script>

<svelte:head>
	<title>Library</title>
</svelte:head>

<div class="container mx-auto p-4">
	<h1 class="text-2xl font-bold mb-4">Library</h1>

	<div class="mb-4">
		<input
			type="text"
			bind:value={newCollectionName}
			placeholder="New collection name"
			class="input input-bordered w-full max-w-xs"
		/>
		<button on:click={createCollection} class="btn btn-primary ml-2">Create Collection</button>
	</div>

	{#if error}
		<p class="text-red-500">{error}</p>
	{:else}
		<div class="grid grid-cols-1 md:grid-cols-2 gap-8">
			<div>
				<h2 class="text-xl font-semibold mb-3">Collections</h2>
				{#if collections.length > 0}
					<ul class="space-y-2">
						{#each collections as collection (collection.id)}
							<li>
								<a href={`/library/collections/${collection.id}`} class="text-lg hover:underline">
									{collection.title}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p>No collections yet.</p>
				{/if}
			</div>
			<div>
				<h2 class="text-xl font-semibold mb-3">Standalone Documents</h2>
				{#if standaloneDocuments.length > 0}
					<ul class="space-y-2">
						{#each standaloneDocuments as document (document.id)}
							<li>
								<a href={`/lesson/${document.id}`} class="text-lg hover:underline">
									{document.title}
								</a>
							</li>
						{/each}
					</ul>
				{:else}
					<p>No standalone documents. You can add one from the <a href="/import" class="underline">import page</a>.</p>
				{/if}
			</div>
		</div>
	{/if}
</div>
