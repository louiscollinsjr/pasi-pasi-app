<script lang="ts">
	import { BookOpen, Plus } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';

	const dispatch = createEventDispatcher();

	function handleCreateCollection() {
		dispatch('createCollection');
	}
</script>

<div class="text-center py-16 px-4">
	<div class="max-w-lg mx-auto">
		<!-- Icon -->
		<div class="mx-auto w-20 h-20 bg-gray-50 rounded-2xl flex items-center justify-center mb-8">
			<BookOpen size={36} class="text-gray-300" />
		</div>

		<!-- Title and description -->
		<h3 class="text-2xl font-medium text-gray-900 mb-3">
			Start Your Learning Journey
		</h3>
		<p class="text-gray-500 mb-10 text-lg leading-relaxed">
			Create your first collection to organize your Romanian lessons and track your progress.
		</p>

		<!-- Call to action -->
		<button
			on:click={handleCreateCollection}
			class="inline-flex items-center gap-3 px-8 py-4 bg-black hover:bg-gray-800 text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg"
		>
			<Plus size={20} />
			Create Your First Collection
		</button>

		<!-- Additional help text -->
		<p class="text-sm text-gray-400 mt-8">
			You can also import standalone lessons from the 
			<a href="/import" class="text-gray-600 hover:text-black underline transition-colors">import page</a>
		</p>
	</div>
</div>
