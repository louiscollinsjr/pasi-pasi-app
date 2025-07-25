<script lang="ts">
	import { BookOpen, FileText, ChevronRight } from 'lucide-svelte';
	import { createEventDispatcher } from 'svelte';
	import CollectionContextMenu from './CollectionContextMenu.svelte';
	
	export let collection: {
		id: string;
		title: string;
		lesson_count?: number;
		created_at?: string;
	};
	
	const dispatch = createEventDispatcher();
	let menuOpen = false;
	
	// Format the lesson count display
	$: lessonCountText = collection.lesson_count === 0 
		? 'No lessons yet' 
		: collection.lesson_count === 1 
		? '1 lesson' 
		: `${collection.lesson_count} lessons`;
	
	function handleRename(event) {
		dispatch('rename', event.detail);
	}
	
	function handleRemove(event) {
		dispatch('remove', event.detail);
	}
</script>

<div class="group relative bg-gray-100 rounded-2xl border border-gray-100 hover:border-gray-200 transition-all duration-300">
	<!-- Card content -->
	<div class="p-8">
		<div class="flex items-start justify-between mb-6">
			<a 
				href="/library/collections/{collection.id}" 
				class="flex items-center gap-4 flex-1 min-w-0"
			>
				<!-- <div class="p-3 bg-gray-50 rounded-xl group-hover:bg-gray-100 transition-colors">
					<BookOpen size={24} class="text-gray-400" />
				</div> -->
				<div class="flex-1 min-w-0">
					<h3 class="font-medium text-gray-900 text-xl group-hover:text-black transition-colors break-words mb-1">
						{collection.title}
					</h3>
					<div class="flex items-center gap-2 text-sm text-gray-400">
						<FileText size={14} />
						<span>{lessonCountText}</span>
					</div>
				</div>
			</a>
			<!-- <ChevronRight size={18} class="text-gray-300 group-hover:text-gray-500 transition-colors flex-shrink-0" /> -->
		</div>
		
		{#if collection.lesson_count === 0}
			<div class="text-xs text-gray-400 bg-gray-50 px-4 py-3 rounded-lg">
				Click to add your first lesson
			</div>
		{/if}
	</div>
	
	<!-- Context Menu positioned in bottom-right -->
	<div class="absolute bottom-4 right-4">
		<CollectionContextMenu 
			{collection} 
			bind:isOpen={menuOpen}
			on:rename={handleRename}
			on:remove={handleRemove}
		/>
	</div>
</div>
