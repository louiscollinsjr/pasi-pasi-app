<script>
  import LessonParser from '$lib/components/LessonParser.svelte';
</script>

<svelte:head>
  <title>Romanian Lesson Parser - Pași-Pași</title>
</svelte:head>

<div class="container mx-auto px-4 py-8 max-w-4xl">
  <header class="text-center mb-8">
    <h1 class="text-3xl font-bold text-gray-800 mb-2">Romanian Lesson Parser</h1>
    <p class="text-lg text-gray-600">Process Romanian text into structured lesson data</p>
  </header>
  
  <LessonParser />
</div>
