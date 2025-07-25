<script lang="ts">
  import LessonView from '$lib/components/LessonView.svelte';
  export let data;

  $: ({ lesson, error } = data);
</script>

<svelte:head>
  <title>{lesson ? lesson.title : 'Lesson'}</title>
</svelte:head>

{#if error}
  <div class="p-8 text-center text-red-500 text-xl">{error}</div>
{:else if lesson}
  <LessonView lesson={{ ...lesson, data: lesson.content }} />
{:else}
  <div class="p-8 text-center text-gray-500 text-xl">Loading lesson...</div>
{/if}
