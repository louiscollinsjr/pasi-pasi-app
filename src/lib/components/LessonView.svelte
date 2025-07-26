<script lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index';
  import { Input } from '$lib/components/ui/input/index';
  import Button from '$lib/components/ui/button/button.svelte';
  import { findPronunciationMatches } from '$lib/data/pronunciationGuide.js';
  import { VocabularyService } from '$lib/services/vocabularyService';
  import type { VocabularyWord, WordTranslation } from '$lib/services/vocabularyService';
  import { ArrowLeft, BarChart3, BookOpen, Eye, EyeOff } from 'lucide-svelte';
  import { writable, get } from 'svelte/store';

  export let lesson: any;
  export let collection: any = null;
  export let vocabulary: Record<string, VocabularyWord> = {};
  export let documentTranslations: Record<string, WordTranslation> = {};
  export let lessonMetrics: any = null;
  export let lessonId: string;

  let selectedWordId = null;
  let editingWord = null;
  let translationInput = '';
  let showPronunciationGuide = false;
  let sentencePerLine = true; // Toggle between sentence-per-line vs paragraph mode
  let localVocabulary = vocabulary; // Global known words only
  const documentTranslationsStore = writable(documentTranslations);

  import { tick } from 'svelte';

  // Update local data when props change
  $: localVocabulary = { ...vocabulary };

  // Helper function to normalize word for lookup
  function normalizeWord(word: string): string {
    return word.toLowerCase().replace(/[.,!?;:"'()]/g, '');
  }

  // Get vocabulary entry for a word (only returns if globally known)
  function getWordVocabulary(word: string): VocabularyWord | null {
    const normalized = normalizeWord(word);
    return localVocabulary[normalized] || null;
  }

  // Get document-specific translation for a word
  function getDocumentTranslation(word: string): string {
    const normalized = normalizeWord(word);
    const translations = get(documentTranslationsStore);
    return translations[normalized]?.translation || '';
  }

  // Reactive helper for template
  $: getTranslationForWord = (word: string) => {
    const normalized = normalizeWord(word);
    return $documentTranslationsStore[normalized]?.translation || '';
  };

  // Reactive helper to check if word has translation
  $: hasTranslationForWord = (word: string) => {
    const normalized = normalizeWord(word);
    return !!$documentTranslationsStore[normalized];
  };

  // Update document translation as user types
  async function updateDocumentTranslation(word: string, translation: string) {
    const normalized = normalizeWord(word);
    
    if (translation.trim()) {
      const newTranslation = {
        id: '',
        original_word: word,
        normalized_word: normalized,
        translation: translation.trim(),
        language_code: 'ro',
        status: 'confirmed',
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString()
      };
      
      documentTranslationsStore.update(translations => ({
        ...translations,
        [normalized]: newTranslation
      }));
      
      await VocabularyService.saveDocumentTranslation(
        lessonId, 
        word, 
        normalized,
        translation.trim(),
        'ro'
      );
    } else {
      documentTranslationsStore.update(translations => {
        const { [normalized]: _, ...rest } = translations;
        return rest;
      });
    }
  }

  function hasDocumentTranslation(word: string): boolean {
    const normalized = normalizeWord(word);
    return !!get(documentTranslationsStore)[normalized];
  }

  async function handleWordClick(wordId: string, word: string) {
    editingWord = null;
    await tick(); // Wait for DOM update
    editingWord = wordId;
    
    // For known words, show the saved translation
    // For unknown words, show any document translation they've entered
    const vocab = getWordVocabulary(word);
    if (vocab?.known) {
      translationInput = vocab.eng_translation || '';
    } else {
      translationInput = getDocumentTranslation(word);
    }
  }

  // Save document translation only (doesn't mark as known)
  async function saveDocumentTranslationOnly(word: string) {
    if (!translationInput.trim()) return;
    
    await updateDocumentTranslation(word, translationInput.trim());
    translationInput = '';
    editingWord = null;
  }

  async function deleteTranslation(word: string) {
    await updateDocumentTranslation(word, '');
    translationInput = '';
    editingWord = null;
  }

  async function saveTranslation(word: string) {
    const normalized = normalizeWord(word);
    
    if (!translationInput.trim()) {
      alert('Please enter a translation before marking as known.');
      return;
    }
    
    // Optimistic update - mark as globally known
    localVocabulary[normalized] = {
      id: '',
      romanian_word: normalized,
      eng_translation: translationInput.trim(),
      known: true,
      first_learned_at: new Date().toISOString(),
      updated_at: new Date().toISOString()
    };
    
    // Trigger reactivity for vocabulary update
    localVocabulary = { ...localVocabulary };
    
    // Remove from document translations since it's now globally known
    documentTranslationsStore.update(translations => {
      const { [normalized]: _, ...rest } = translations;
      return rest;
    });
    
    // Save to database
    const success = await VocabularyService.markWordAsKnown(lessonId, normalized, translationInput.trim());
    
    if (!success) {
      // Revert optimistic update on failure
      localVocabulary = { ...vocabulary };
      alert('Failed to save translation');
    }
    
    editingWord = null;
    translationInput = '';
  }

  async function markKnown(word: string) {
    const normalized = normalizeWord(word);
    
    // Check if there's a document translation to use
    const documentTranslation = getDocumentTranslation(word);
    
    if (!documentTranslation.trim()) {
      alert('Please add a translation first, then mark as known.');
      return;
    }
    
    // Use the document translation and mark as known
    translationInput = documentTranslation;
    await saveTranslation(word);
  }

  // Function to render word with pronunciation guide
  function renderWordWithPronunciation(word: string, wordId: string) {
    if (!showPronunciationGuide) {
      return word; // Return plain word if guide is disabled
    }
    
    const matches = findPronunciationMatches(word);
    if (matches.length === 0) {
      return word; // No pronunciation matches found
    }
    
    // This will be handled in the template with special rendering
    return { word, matches, wordId };
  }
</script>

<!-- Header Section -->
<div class="container border-b border-gray-100 bg-white mx-auto">
  <div class="container mx-auto px-6 py-8">
    <div class="mb-6">
      <!-- Breadcrumb Navigation -->
      <div class="flex items-center gap-3 mb-4">
        <a href="/library" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
          Library
        </a>
        {#if collection}
          <span class="text-gray-300">/</span>
          <a href="/library/collections/{collection.id}" class="text-sm text-gray-400 hover:text-gray-600 transition-colors">
            {collection.title}
          </a>
        {/if}
        <span class="text-gray-300">/</span>
        <div class="p-1.5 bg-gray-50 rounded-lg">
          <BookOpen size={14} class="text-gray-400" />
        </div>
      </div>
      
      <div class="flex-1">
        <h1 class="text-3xl font-medium text-gray-900 break-words">{lesson.title}</h1>
        
        <!-- Lesson Metrics -->
        {#if lessonMetrics}
          <div class="flex items-center gap-6 mt-3 text-sm text-gray-400">
            <div class="flex items-center gap-2">
              <BarChart3 size={16} />
              <span>{lessonMetrics.comprehensionRate}% comprehension</span>
            </div>
            <div class="flex items-center gap-2">
              <span>{lessonMetrics.knownWords} / {lessonMetrics.totalWords} words known</span>
            </div>
          </div>
        {/if}
      </div>
    </div>

    <!-- Controls -->
    <div class="flex justify-end">
      <button
        class="inline-flex items-center gap-3 px-6 py-3 {showPronunciationGuide ? 'bg-black text-white' : 'bg-gray-50 text-gray-600'} hover:bg-gray-800 hover:text-white font-medium rounded-xl transition-all duration-200 shadow-sm hover:shadow-lg"
        on:click={() => {
          showPronunciationGuide = !showPronunciationGuide;
          console.log('Pronunciation guide toggled:', showPronunciationGuide);
        }}
      >
        {#if showPronunciationGuide}
          <EyeOff size={18} />
          <span class="hidden sm:inline">Hide Pronunciation</span>
          <span class="sm:hidden">Hide</span>
        {:else}
          <Eye size={18} />
          <span class="hidden sm:inline">Show Pronunciation</span>
          <span class="sm:hidden">Show</span>
        {/if}
      </button>
    </div>
  </div>
</div>

<!-- Main Content -->
<div class="container mx-auto px-6 py-8">
  <div class="text-xl leading-relaxed bg-white whitespace-pre-wrap font-roboto pt-24">
    {#each lesson.data.paragraphs as paragraph, pIdx}
      {#if sentencePerLine}
        {@const sentences = paragraph.text.split(/([.!?]+)/).filter(s => s.trim())}
        {#each sentences as sentence, sIdx}
          {#if sentence.match(/[.!?]/)}
            <!-- This is punctuation, render it with the previous sentence -->
          {:else if sentence.trim()}
            {#if sIdx > 0}<br><br>{/if}
            {#each sentence.trim().split(/\s+/) as word, wIdx}
              {#key `${paragraph.id}-s${sIdx}-${wIdx}`}
                <span class="inline-flex flex-col items-center align-top">
                  <!-- Word rendering logic here -->
                  <Popover open={editingWord === `${paragraph.id}-s${sIdx}-${wIdx}`}>
                    <PopoverTrigger>
                      <button
                        type="button"
                        class="select-text cursor-pointer px-1 font-libreBaskerville font-normal bg-transparent border-none p-0 m-0 text-[#367dc2] text-gray-600 text-5xl relative"
                        style="text-decoration-line: none; text-decoration-color: {getWordVocabulary(word)?.known ? 'gray' : 'green'}; text-decoration-style: dotted; text-decoration-opacity: {getWordVocabulary(word)?.known ? 0.2: .5};"
                        on:click|stopPropagation={() => handleWordClick(`${paragraph.id}-s${sIdx}-${wIdx}`, word)}
                      >
                        {#if showPronunciationGuide}
                          {@const matches = word.pronunciationMatches ?? findPronunciationMatches(word)}
                          {#if matches.length > 0}
                            <!-- Render word with aligned pronunciation annotations -->
                            <div class="inline-flex flex-col items-start">
                              <!-- Word with highlighted letters -->
                              <div class="flex">
                                {#each word.split('') as char, charIdx}
                                  {@const currentMatch = matches.find(m => m.startIndex === charIdx)}
                                  {#if currentMatch}
                                    <span class="inline-flex flex-col items-center" style="flex: 0 0 auto; width: {currentMatch.endIndex - currentMatch.startIndex + 1}ch;">
                                      <span class="flex">
                                        {#each Array(currentMatch.endIndex - currentMatch.startIndex + 1) as _, i}
                                          <span style="color: #9D4EDD;">{word[charIdx + i]}</span> <!--#9D4EDD is purple-->
                                        {/each}
                                      </span>
                                      <span class="text-2xl text-[#367dc2] font-patrickHandSc bg-blue-000 px-1 py-0.5 rounded mt-1 whitespace-nowrap text-center" style="display:inline-block;min-width:100%;">
                                        {currentMatch.pronunciation}
                                      </span>
                                    </span>
                                  {:else if !matches.some(m => charIdx > m.startIndex && charIdx <= m.endIndex)}
                                    <span>{char}</span>
                                  {/if}
                                {/each}
                              </div>
                            </div>
                          {:else}
                            {word}
                          {/if}
                        {:else}
                          {word}
                        {/if}
                      </button>
                    </PopoverTrigger>
                    <PopoverContent>
                      <div class="flex flex-col gap-2">
                        <Button on:click={() => markKnown(word)} variant="ghost" class="mb-2 w-full text-xl">Mark as Known</Button>
                        <form on:submit|preventDefault={() => saveDocumentTranslationOnly(word)}>
                          <Input
                            placeholder="Add translation"
                            bind:value={translationInput}
                            on:input={() => updateDocumentTranslation(word, translationInput)}
                            class="mb-2 text-xl"
                            autofocus
                          />
                          <div class="flex gap-2">
                            <Button type="submit" variant="default" class="flex-1 text-xl font-bold">Update</Button>
                            {#if hasTranslationForWord(word)}
                              <Button on:click={() => deleteTranslation(word)} variant="destructive" class="text-xl font-bold">Delete</Button>
                            {/if}
                          </div>
                        </form>
                      </div>
                    </PopoverContent>
                  </Popover>
                  {#if getWordVocabulary(word)?.eng_translation}
                    <span class="block text-[12px] text-gray-200 my-1 font-libreBaskerville font-bold tracking-wide">{getWordVocabulary(word)?.eng_translation}</span>
                  {:else if hasTranslationForWord(word)}
                    <span class="block text-xl text-gray-900 my-2 mt-4 font-roboto font-bold tracking-wide">{getTranslationForWord(word)}</span>
                  {/if}
                </span>
                {' '}
              {/key}
            {/each}
            <!-- Add punctuation if next item is punctuation -->
            {#if sentences[sIdx + 1] && sentences[sIdx + 1].match(/[.!?]/)}
              <span class="inline-flex flex-col items-center align-top">
                <button type="button" class="select-text cursor-pointer px-1 font-libreBaskerville font-normal bg-transparent border-none p-0 m-0 text-[#367dc2] text-gray-600 text-5xl relative">
                  {sentences[sIdx + 1]}
                </button>
              </span>
            {/if}
          {/if}
        {/each}
      {:else}
        {#each paragraph.text.split(/\n/) as line, lIdx}
          {#if lIdx > 0}<br>{/if}
          {#each line.trim().split(/\s+/) as word, wIdx}
          {#key `${paragraph.id}-${lIdx}-${wIdx}`}
            <span class="inline-flex flex-col items-center align-top">
              <Popover open={editingWord === `${paragraph.id}-${lIdx}-${wIdx}`}>
                <PopoverTrigger>
                  <button
                    type="button"
                    class="select-text cursor-pointer px-1 font-libreBaskerville font-patrickHandSc font-normal bg-transparent border-none p-0 m-0 text-[#367dc2] text-gray-600 text-5xl relative"
                    style="text-decoration-line: none; text-decoration-color: {getWordVocabulary(word)?.known ? 'gray' : 'green'}; text-decoration-style: dotted; text-decoration-opacity: {getWordVocabulary(word)?.known ? 0.2: .5};"
                    on:click|stopPropagation={() => handleWordClick(`${paragraph.id}-${lIdx}-${wIdx}`, word)}
                  >
                    {#if showPronunciationGuide}
                      {@const matches = word.pronunciationMatches ?? findPronunciationMatches(word)}
                      {#if matches.length > 0}
                        <!-- Render word with aligned pronunciation annotations -->
                        <div class="inline-flex flex-col items-start">
                          <!-- Word with highlighted letters -->
                          <div class="flex">
                            {#each word.split('') as char, charIdx}
                              {#if matches.some(m => m.startIndex === charIdx)}
                                {@const match = matches.find(m => m.startIndex === charIdx)}
                                <span class="inline-flex flex-col items-center" style="flex: 0 0 auto; width: {match.endIndex - match.startIndex + 1}ch;">
                                  <span class="flex">
                                    {#each Array(match.endIndex - match.startIndex + 1) as _, i}
                                      <span style="{match ? 'color: #9D4EDD;' : ''}">{word[charIdx + i]}</span> <!-- #FF2658 is red -->
                                    {/each}
                                  </span>
                                  <span class="text-4xl text-[#367dc2] font-patrickHandSc bg-blue-000 px-1 py-0.5 rounded mt-1 whitespace-nowrap text-center" style="display:inline-block;min-width:100%;">
                                    {match.pronunciation}
                                  </span>
                                </span>
                              {:else if !matches.some(m => charIdx > m.startIndex && charIdx <= m.endIndex)}
                                <span class="inline-flex flex-col items-center">
                                  <span>{char}</span>
                                  <span class="text-[10px] mt-1 h-4"></span>
                                </span>
                              {/if}
                            {/each}
                          </div>
                        </div>
                      {:else}
                        {word}
                      {/if}
                    {:else}
                      {word}
                    {/if}
                  </button>
                </PopoverTrigger>
                <PopoverContent>
                  <div class="flex flex-col gap-2">
                    <Button on:click={() => markKnown(word)} variant="ghost" class="mb-2 w-full text-xl">Mark as Known</Button>
                    <form on:submit|preventDefault={() => saveDocumentTranslationOnly(word)}>
                      <Input
                        placeholder="Add translation"
                        bind:value={translationInput}
                        on:input={() => updateDocumentTranslation(word, translationInput)}
                        class="mb-2 text-xl"
                        autofocus
                      />
                      <div class="flex gap-2">
                        <Button type="submit" variant="default" class="flex-1 text-xl font-bold">Update</Button>
                        {#if hasTranslationForWord(word)}
                          <Button on:click={() => deleteTranslation(word)} variant="destructive" class="text-xl font-bold">Delete</Button>
                        {/if}
                      </div>
                    </form>
                  </div>
                </PopoverContent>
              </Popover>
              {#if getWordVocabulary(word)?.eng_translation}
                <span class="block text-[12px] text-gray-200 my-1 font-libreBaskerville font-bold tracking-wide">{getWordVocabulary(word)?.eng_translation}</span>
              {:else if hasTranslationForWord(word)}
                <span class="block text-[12px] text-gray-500 my-1 font-libreBaskerville font-bold tracking-wide">{getTranslationForWord(word)}</span>
              {/if}
            </span>
            {' '}
          {/key}
        {/each}
      {/each}
      {/if}
      <br><br>
    {/each}
  </div>
</div>

<style>
  
  .font-libreBaskerville {
    font-family: 'Libre Baskerville', serif !important;
  }
  .font-patrickHand {
    font-family: 'Patrick Hand', serif !important;
  }
  .font-patrickHandSc {
    font-family: 'Patrick Hand SC', serif !important;
  }
  .font-roboto {
    font-family: 'Roboto Variable', serif !important;
  }
 
  input, input[type="text"], input[type="search"], input[type="email"], input[type="password"] {
    font-size: 2rem !important;
  }
</style>