<script>
  import { page } from '$app/stores';
  import { browser } from '$app/environment';
  import LessonView from '$lib/components/LessonView.svelte';

  let lesson = null;

  // Reactively load lesson when page params change (only in browser)
  $: if ($page.params.id && browser) {
    const lessons = JSON.parse(localStorage.getItem('pasi_lessons') || '[]');
    console.log('Loading lesson with ID:', $page.params.id);
    console.log('Available lessons:', lessons);
    lesson = lessons.find(l => l.id === $page.params.id);
    console.log('Found lesson:', lesson);
  }
</script>

{#if lesson}
  <LessonView {lesson} />
{:else}
  <div class="p-8 text-center text-gray-500 text-xl">Lesson not found.</div>
{/if}
