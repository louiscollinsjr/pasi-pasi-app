<script lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index';
  import { Input } from '$lib/components/ui/input/index';
  import Button from '$lib/components/ui/button/button.svelte';
  export let lesson: any;

  // State: { [wordId]: { known: boolean, translation: string } }
  let wordState: Record<string, { known?: boolean; translation?: string }> = {};
  let editingWord: string | null = null;
  let translationInput = '';

  import { tick } from 'svelte';

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
</script>

<div class="w-full max-w-3xl mx-auto p-4">
  <h2 class="font-normal mb-4 text-gray-600 font-roboto text-2xl">{lesson.title}</h2>
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
                    class="select-text cursor-pointer px-1 font-patrickHandSc bg-transparent border-none p-0 m-0 text-[#367dc2] text-gray-600 text-5xl"
                    style="text-decoration-line: none; text-decoration-color: {wordState[`${paragraph.id}-${lIdx}-${wIdx}`]?.known ? 'gray' : 'green'}; text-decoration-style: dotted; text-decoration-opacity: {wordState[`${paragraph.id}-${lIdx}-${wIdx}`]?.known ? 0.2: .5};"
                    on:click|stopPropagation={() => handleWordClick(`${paragraph.id}-${lIdx}-${wIdx}`)}
                  >
                    {word}
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
                <span class="block text-2xl text-gray-400 mt-2 font-patrickHandSc font-bold tracking-wide">{wordState[`${paragraph.id}-${lIdx}-${wIdx}`].translation}</span>
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