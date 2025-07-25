<script lang="ts">
	import { createEventDispatcher } from 'svelte';
	import { supabase } from '$lib/supabaseClient';
	import { X, Plus } from 'lucide-svelte';

	const dispatch = createEventDispatcher();

	export let isOpen = false;
	
	let collectionName = '';
	let isCreating = false;
	let error = '';

	async function createCollection() {
		if (!collectionName.trim()) {
			error = 'Please enter a collection name';
			return;
		}

		isCreating = true;
		error = '';

		try {
			const { data, error: insertError } = await supabase
				.from('collections')
				.insert([{ title: collectionName.trim() }])
				.select()
				.single();

			if (insertError) {
				error = insertError.message;
			} else {
				dispatch('collectionCreated', data);
				closeModal();
			}
		} catch (err) {
			error = 'Failed to create collection';
		} finally {
			isCreating = false;
		}
	}

	function closeModal() {
		isOpen = false;
		collectionName = '';
		error = '';
	}

	function handleKeydown(event) {
		if (event.key === 'Escape') {
			closeModal();
		} else if (event.key === 'Enter' && !isCreating) {
			createCollection();
		}
	}
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
	<!-- Modal backdrop -->
	<div 
		class="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4"
		on:click={closeModal}
		role="dialog"
		aria-modal="true"
		aria-labelledby="modal-title"
	>
		<!-- Modal content -->
		<div 
			class="bg-white rounded-2xl shadow-2xl max-w-lg w-full p-8 relative"
			on:click|stopPropagation
		>
			<!-- Close button -->
			<button
				on:click={closeModal}
				class="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors"
				aria-label="Close modal"
			>
				<X size={24} />
			</button>

			<!-- Modal header -->
			<div class="mb-8">
				<h2 id="modal-title" class="text-2xl font-medium text-gray-900 mb-2">
					Create New Collection
				</h2>
				<p class="text-gray-500 text-base">
					Give your collection a name to organize your lessons
				</p>
			</div>

			<!-- Form -->
			<div class="space-y-6">
				<div>
					<label for="collection-name" class="block text-sm font-medium text-gray-600 mb-3">
						Collection Name
					</label>
					<input
						id="collection-name"
						type="text"
						bind:value={collectionName}
						placeholder="e.g., Romanian Basics, Advanced Grammar..."
						class="w-full px-4 py-4 border border-gray-200 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent text-lg"
						disabled={isCreating}
						autofocus
					/>
				</div>

				{#if error}
					<div class="text-red-600 text-sm bg-red-50 p-4 rounded-xl border border-red-100">
						{error}
					</div>
				{/if}

				<!-- Action buttons -->
				<div class="flex gap-4 pt-4">
					<button
						on:click={closeModal}
						class="flex-1 px-6 py-4 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium"
						disabled={isCreating}
					>
						Cancel
					</button>
					<button
						on:click={createCollection}
						class="flex-1 px-6 py-4 bg-black hover:bg-gray-800 text-white rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-3 font-medium"
						disabled={isCreating || !collectionName.trim()}
					>
						{#if isCreating}
							<div class="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
							Creating...
						{:else}
							<!-- <Plus size={18} /> -->
							Create Collection
						{/if}
					</button>
				</div>
			</div>
		</div>
	</div>
{/if}
