<script lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index';
  import { Input } from '$lib/components/ui/input/index';
  import Button from '$lib/components/ui/button/button.svelte';
  import { findPronunciationMatches } from '$lib/data/pronunciationGuide.js';
  export let lesson: any;

  // State: { [wordId]: { known: boolean, translation: string } }
  let wordState: Record<string, { known?: boolean; translation?: string }> = {};
  let editingWord: string | null = null;
  let translationInput = '';
  let showPronunciationGuide = false;

  import { tick } from 'svelte';

  // Reset state when lesson changes (but preserve pronunciation guide setting)
  $: if (lesson) {
    wordState = {};
    editingWord = null;
    translationInput = '';
    // Keep showPronunciationGuide setting across lessons
  }

  async function handleWordClick(wordId: string) {
    editingWord = null;
    await tick(); // Wait for DOM update
    editingWord = wordId;
    translationInput = wordState[wordId]?.translation || '';
  }

  function saveTranslation(wordId: string) {
    wordState[wordId] = {
      ...wordState[wordId],
      translation: translationInput,
      known: true
    };
    editingWord = null;
    translationInput = '';
    // Optionally persist to localStorage here
  }

  function markKnown(wordId: string) {
    wordState[wordId] = {
      ...wordState[wordId],
      known: true
    };
    editingWord = null;
    // Optionally persist to localStorage here
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

<div class="w-full max-w-3xl mx-auto p-4">
  <div class="flex justify-between items-center mb-4">
    <h2 class="font-normal text-gray-600 font-roboto text-lg">{lesson.title}</h2>
    <div class="flex items-center gap-2">
      <span class="text-xs {showPronunciationGuide ? 'text-green-600' : 'text-red-600'}">
        Guide: {showPronunciationGuide ? 'ON' : 'OFF'}
      </span>
      <button 
        class="px-3 py-1 text-xs border border-gray-300 rounded {showPronunciationGuide ? 'bg-green-100' : 'bg-white'} hover:bg-gray-50"
        on:click={() => {
          showPronunciationGuide = !showPronunciationGuide;
          console.log('Pronunciation guide toggled:', showPronunciationGuide);
        }}
      >
        {showPronunciationGuide ? 'Hide' : 'Show'} Pronunciation
      </button>
    </div>
  </div>
  <div class="text-xl leading-relaxed bg-white whitespace-pre-wrap font-roboto pt-24">
    {#each lesson.data.paragraphs as paragraph, pIdx}
      {#each paragraph.text.split(/\n/) as line, lIdx}
        {#if lIdx > 0}<br>{/if}
        {#each line.trim().split(/\s+/) as word, wIdx}
          {#key `${paragraph.id}-${lIdx}-${wIdx}`}
            <span class="inline-flex flex-col items-center align-top">
              <Popover open={editingWord === `${paragraph.id}-${lIdx}-${wIdx}`}>
                <PopoverTrigger>
                  <button
                    type="button"
                    class="select-text cursor-pointer px-1 font-libreBaskerville bg-transparent border-none p-0 m-0 text-[#367dc2] text-gray-800 text-[18px] relative"
                    style="text-decoration-line: none; text-decoration-color: {wordState[`${paragraph.id}-${lIdx}-${wIdx}`]?.known ? 'gray' : 'green'}; text-decoration-style: dotted; text-decoration-opacity: {wordState[`${paragraph.id}-${lIdx}-${wIdx}`]?.known ? 0.2: .5};"
                    on:click|stopPropagation={() => handleWordClick(`${paragraph.id}-${lIdx}-${wIdx}`)}
                  >
                    {#if showPronunciationGuide}
                      {@const matches = findPronunciationMatches(word)}
                      <!-- Debug: log matches for testing -->
                      {console.log('Word:', word, 'Matches:', matches)}
                      {#if matches.length > 0}
                        <!-- Render word with pronunciation highlighting -->
                        {#each word.split('') as char, charIdx}
                          {@const matchForChar = matches.find(m => charIdx >= m.startIndex && charIdx <= m.endIndex)}
                          <span class="{matchForChar ? 'bg-yellow-200 text-blue-800' : ''}">{char}</span>
                        {/each}
                      {:else}
                        <span style="background: pink;">{word}</span>
                      {/if}
                    {:else}
                      {word}
                    {/if}
                  </button>
                </PopoverTrigger>
                <PopoverContent>
                  <div class="flex flex-col gap-2">
                    <Button on:click={() => markKnown(`${paragraph.id}-${lIdx}-${wIdx}`)} variant="ghost" class="mb-2 w-full text-xl">Mark as Known</Button>
                    <form on:submit|preventDefault={() => saveTranslation(`${paragraph.id}-${lIdx}-${wIdx}`)}>
                      <Input
                        placeholder="Add translation"
                        bind:value={translationInput}
                        class="mb-2 text-xl"
                        autofocus
                      />
                      <Button type="submit" variant="default" class="w-full text-xl font-bold">Update</Button>
                    </form>
                  </div>
                </PopoverContent>
              </Popover>
              {#if wordState[`${paragraph.id}-${lIdx}-${wIdx}`]?.translation}
                <span class="block text-[12px] text-gray-400 my-1 font-libreBaskerville font-bold tracking-wide">{wordState[`${paragraph.id}-${lIdx}-${wIdx}`].translation}</span>
              {/if}
              
              <!-- Pronunciation guide annotations -->
              {#if showPronunciationGuide}
                {@const matches = findPronunciationMatches(word)}
                {#if matches.length > 0}
                  <div class="flex gap-1 mt-1 text-[10px] text-blue-600 font-mono uppercase tracking-wider">
                    {#each matches as match}
                      <span class="bg-blue-100 px-1 py-0.5 rounded">{match.pronunciation}</span>
                    {/each}
                  </div>
                {/if}
              {/if}
            </span>
            {' '}
          {/key}
        {/each}
      {/each}
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