<script>
  import { onMount } from 'svelte';
  import SentenceEditor from '../components/SentenceEditor.svelte';
  import ProgressBar from '../components/ProgressBar.svelte';
  import TextInput from '../components/TextInput.svelte';
  import { processSentence, markWordStatus, updateWordDecode, calculateProgress } from '../lib/sentenceProcessor.js';
  import { saveLesson, loadLesson, exportLessons, importLessons } from '../lib/storage.js';
  import sampleLessonData from '../data/sampleLesson.json';
  
  let currentLesson = null;
  let sentences = [];
  let progress = { total: 0, known: 0, unknown: 0, blank: 0, percentage: 0 };
  let showEnglish = true;
  let showAIDecode = false;
  
  onMount(() => {
    // Load sample lesson on first visit
    loadSampleLesson();
  });
  
  function loadSampleLesson() {
    currentLesson = sampleLessonData;
    sentences = [...currentLesson.sentences];
    updateProgress();
  }
  
  function handleTextSubmitted(event) {
    const { text, sentences: textSentences } = event.detail;
    
    // Create new lesson from submitted text
    const newSentences = textSentences.map(sentenceText => 
      processSentence(sentenceText)
    );
    
    const newLesson = {
      id: 'lesson_' + Date.now(),
      title: 'Custom Lesson',
      description: 'User-submitted text',
      sentences: newSentences,
      createdAt: new Date().toISOString(),
      lastModified: new Date().toISOString()
    };
    
    currentLesson = newLesson;
    sentences = [...newSentences];
    updateProgress();
    
    // Save to localStorage
    saveLesson(newLesson.id, newLesson);
  }
  
  function handleWordStatusChange(sentenceIndex, event) {
    const { wordIndex, status } = event.detail;
    sentences[sentenceIndex] = markWordStatus(sentences[sentenceIndex], wordIndex, status);
    updateProgress();
    saveCurrentLesson();
  }
  
  function handleDecodeChange(sentenceIndex, event) {
    const { wordIndex, value } = event.detail;
    sentences[sentenceIndex] = updateWordDecode(sentences[sentenceIndex], wordIndex, value);
    saveCurrentLesson();
  }
  
  function updateProgress() {
    progress = calculateProgress(sentences);
  }
  
  function saveCurrentLesson() {
    if (currentLesson) {
      const updatedLesson = {
        ...currentLesson,
        sentences: [...sentences],
        lastModified: new Date().toISOString()
      };
      saveLesson(currentLesson.id, updatedLesson);
    }
  }
  
  function handleExport() {
    exportLessons();
  }
  
  function handleImport(event) {
    const file = event.target.files[0];
    if (file && file.type === 'application/json') {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const success = importLessons(e.target.result);
          if (success) {
            alert('Lessons imported successfully!');
          } else {
            alert('Error importing lessons.');
          }
        } catch (error) {
          alert('Invalid JSON file.');
        }
      };
      reader.readAsText(file);
    }
  }
</script>

<svelte:head>
  <title>Pași-Pași - Romanian Language Learning</title>
</svelte:head>

<div class="min-h-screen bg-gray-50">
  <div class="container mx-auto px-4 py-8 max-w-6xl">
    
    <!-- Header -->
    <header class="text-center mb-8">
      <h1 class="text-4xl font-bold text-gray-800 mb-2">Pași-Pași</h1>
      <p class="text-lg text-gray-600">Romanian Language Learning with the Birkenbihl Method</p>
    </header>
    
    <!-- Controls -->
    <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
      <div class="flex flex-wrap items-center justify-between gap-4">
        <div class="flex items-center space-x-4">
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={showEnglish}
              class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show English Translation
          </label>
          <label class="flex items-center">
            <input
              type="checkbox"
              bind:checked={showAIDecode}
              class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
            />
            Show AI Decode
          </label>
        </div>
        
        <div class="flex items-center space-x-2">
          <button
            on:click={handleExport}
            class="px-4 py-2 bg-green-600 text-white font-medium rounded-md hover:bg-green-700 focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition-colors"
          >
            Export Progress
          </button>
          
          <label class="px-4 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors cursor-pointer">
            Import Lessons
            <input
              type="file"
              accept=".json"
              on:change={handleImport}
              class="hidden"
            />
          </label>
          
          <button
            on:click={loadSampleLesson}
            class="px-4 py-2 bg-gray-600 text-white font-medium rounded-md hover:bg-gray-700 focus:ring-2 focus:ring-gray-500 focus:ring-offset-2 transition-colors"
          >
            Load Sample
          </button>
        </div>
      </div>
    </div>
    
    <!-- Progress Bar -->
    <ProgressBar {progress} />
    
    <!-- Text Input -->
    <TextInput on:textSubmitted={handleTextSubmitted} />
    
    <!-- Lesson Content -->
    {#if currentLesson}
      <div class="bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
        <h2 class="text-2xl font-semibold text-gray-800 mb-2">{currentLesson.title}</h2>
        <p class="text-gray-600 mb-4">{currentLesson.description}</p>
        <div class="text-sm text-gray-500">
          Created: {new Date(currentLesson.createdAt).toLocaleDateString()}
          {#if currentLesson.lastModified !== currentLesson.createdAt}
            • Last modified: {new Date(currentLesson.lastModified).toLocaleDateString()}
          {/if}
        </div>
      </div>
    {/if}
    
    <!-- Sentences -->
    {#if sentences.length > 0}
      <div class="space-y-4">
        {#each sentences as sentence, index}
          <SentenceEditor
            {sentence}
            {showEnglish}
            {showAIDecode}
            on:wordStatusChange={(event) => handleWordStatusChange(index, event)}
            on:decodeChange={(event) => handleDecodeChange(index, event)}
          />
        {/each}
      </div>
    {:else}
      <div class="text-center py-12">
        <div class="text-gray-400 mb-4">
          <svg class="mx-auto h-12 w-12" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.746 0 3.332.477 4.5 1.253v13C19.832 18.477 18.246 18 16.5 18c-1.746 0-3.332.477-4.5 1.253" />
          </svg>
        </div>
        <h3 class="text-lg font-medium text-gray-900 mb-2">No lessons loaded</h3>
        <p class="text-gray-500 mb-4">Add Romanian text above or load the sample lesson to get started.</p>
      </div>
    {/if}
    
  </div>
</div>
