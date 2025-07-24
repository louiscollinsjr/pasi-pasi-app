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

<div class="w-full max-w-4xl mx-auto p-4">
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
                    class="select-text cursor-pointer px-1 font-libreBaskerville font-patrickHandSc font-normal  bg-transparent border-none p-0 m-0 text-[#367dc2] text-gray-000 text-7xl relative"
                    style="text-decoration-line: none; text-decoration-color: {wordState[`${paragraph.id}-${lIdx}-${wIdx}`]?.known ? 'gray' : 'green'}; text-decoration-style: dotted; text-decoration-opacity: {wordState[`${paragraph.id}-${lIdx}-${wIdx}`]?.known ? 0.2: .5};"
                    on:click|stopPropagation={() => handleWordClick(`${paragraph.id}-${lIdx}-${wIdx}`)}
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
                                      <span style="{match ? 'color: #FF2658;' : ''}">{word[charIdx + i]}</span>
                                    {/each}
                                  </span>
                                  <span class="text-3xl text-[#367dc2] font-patrickHandSc bg-blue-000 px-1 py-0.5 rounded mt-1 whitespace-nowrap text-center" style="display:inline-block;min-width:100%;">
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