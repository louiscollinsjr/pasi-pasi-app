<script lang="ts">
  import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index';
  import { Input } from '$lib/components/ui/input/index';
  import Button from '$lib/components/ui/button/button.svelte';
  import { getPronunciationRules, findPronunciationMatches } from '$lib/pronunciation';

  export let paragraphs = [];
  export let readingMode = true;
  export let showPronunciationGuide = false;
  export let editingWord: string | null = null;
  export let translationInput = '';
  export let handleWordClick;
  export let markKnown;
  export let saveDocumentTranslationOnly;
  export let updateDocumentTranslation;
  export let deleteTranslation;
  export let hasTranslationForWord;
  export let getWordVocabulary;
  export let getTranslationForWord;
  // New props to drive pronunciation rules dynamically
  export let targetLang: string = 'ro';
  export let nativeLang: string = 'en';
  // Occurrence IDs that should temporarily show document translation inline
  export let tempShownIds: string[] = [];

  // Compute rules from target and native languages
  $: rules = getPronunciationRules(targetLang, nativeLang);
</script>

<div>
  {#each paragraphs as paragraph, pIdx}
    {#if readingMode}
      {#each paragraph.text.split(/\n/) as line, lIdx}
        {#if lIdx > 0}<br />{/if}
        {#each line.trim().split(/\s+/) as word, wIdx}
          {#key `${paragraph.id}-${lIdx}-${wIdx}`}
            <span class="inline-flex flex-col items-center align-top ">
              <!-- Popover component for word interactions -->
              <Popover open={editingWord === `${paragraph.id}-${lIdx}-${wIdx}`}> 
                <PopoverTrigger
                  type="button"
                  class="relative m-0 cursor-pointer border-none bg-transparent p-0 {wIdx === 0 ? '' : 'px-1'} select-text"
                  style="text-decoration-line: none; text-decoration-color: {getWordVocabulary(word)?.known ? 'gray' : 'green'}; text-decoration-style: dotted; text-decoration-opacity: {getWordVocabulary(word)?.known ? 0.2 : 0.5};"
                  on:click={(e) => { e.stopPropagation(); handleWordClick(`${paragraph.id}-${lIdx}-${wIdx}`, word); }}
                >
                  {#if showPronunciationGuide}
                    <!-- Pronunciation guide rendering logic: -->
                    <!-- 1. Get pronunciation matches for the current word -->
                    {@const matches = word.pronunciationMatches ?? findPronunciationMatches(word, rules)}
                    
                    {#if matches.length > 0}
                        <!-- Container for pronunciation guide elements -->
                        <div class="inline-flex flex-col items-start">
                            <div class="flex">
                                <!-- Iterate through each character in the word -->
                                {#each word.split('') as char, charIdx}
                                    <!-- Check if current character starts a pronunciation match -->
                                    {#if matches.some((m) => m.startIndex === charIdx)}
                                        <!-- Get the specific match starting at this character index -->
                                        {@const match = matches.find((m) => m.startIndex === charIdx)}
                                        
                                        <!-- Pronunciation guide container for matched segment -->
                                        <span class="pronunciation-guide-text inline-flex flex-col items-center" 
                                          style="flex: 0 0 auto; width: {match.endIndex - match.startIndex + 1}ch;">
                                        
                                        <!-- Render matched characters with red color -->
                                        <span class="flex">
                                            {#each Array(match.endIndex - match.startIndex + 1) as _, i}
                                                <span class="{match ? 'pronunciation-guide-matched' : ''} ">
                                                    {word[charIdx + i]}
                                                </span>
                                            {/each}
                                        </span>
                                        
                                        <!-- Pronunciation text below matched characters -->
                                        <span class="pronunciation-guide-sounds mt-1 rounded px-1 py-0.5 text-center whitespace-nowrap" 
                                              style="display:inline-block;min-width:100%;">
                                            {match.pronunciation}
                                        </span>
                                    </span>
                        
                    {:else if !matches.some((m) => charIdx > m.startIndex && charIdx <= m.endIndex)}
                        <!-- Regular character rendering (no pronunciation guide) -->
                        <span class="pronunciation-guide-text inline-flex flex-col items-center">
                            <span>{char}</span>
                            <!-- Spacer for consistent alignment with guided characters -->
                                            <span class="mt-1 h-4 text-[10px]"></span>
                                        </span>
                                    {/if}
                                {/each}
                            </div>
                        </div>
                    {:else}
                        <!-- Fallback: Show plain word if no pronunciation matches -->
                        <span class="pronunciation-guide-text inline-flex flex-col items-center">{word}</span>
                    {/if}
                {:else}
                    <!-- Fallback: Show plain word when pronunciation guide is disabled -->
                    <span class="pronunciation-guide-text inline-flex flex-col items-center">{word}</span>
                {/if}
                {#if wIdx === line.trim().split(/\s+/).length - 1 && lIdx < line.trim().split(/\n/).length - 1}
                  <!-- Attach punctuation directly to the last word -->
                  <span class="pronunciation-guide-punctuation">
                    {line.trim().split(/\n/)[lIdx + 1]}
                  </span>
                {/if}
                </PopoverTrigger>
                <PopoverContent>
                  <div class="flex flex-col gap-2">
                    <Button type="button" on:click={() => markKnown(word)} variant="ghost" class="mb-2 w-full text-xl">Mark as Known</Button>
                    <form on:submit|preventDefault={() => saveDocumentTranslationOnly(word, `${paragraph.id}-${lIdx}-${wIdx}`)}>
                      <Input
                        placeholder="Add translation"
                        bind:value={translationInput}
                        on:input={() => updateDocumentTranslation(word, translationInput, `${paragraph.id}-${lIdx}-${wIdx}`)}
                        class="mb-2 text-xl"
                        autofocus
                      />
                      <div class="flex gap-2">
                        <Button type="button" on:click={() => {
                          console.log('Reading mode occurrenceId:', `${paragraph.id}-${lIdx}-${wIdx}`);
                          saveDocumentTranslationOnly(word, `${paragraph.id}-${lIdx}-${wIdx}`);
                        }} variant="default" class="flex-1 text-xl font-bold">Update</Button>
                        {#if hasTranslationForWord(word)}
                          <Button type="button" on:click={() => deleteTranslation(word)} variant="destructive" class="text-xl font-bold">Delete</Button>
                        {/if}
                      </div>
                    </form>
                  </div>
                </PopoverContent>
              </Popover>
              {#if getWordVocabulary(word)?.known && getWordVocabulary(word)?.eng_translation}
                <span class="font-libreBaskerville my-1 block text-[12px] font-bold tracking-wide text-gray-200">{getWordVocabulary(word)?.eng_translation}</span>
              {:else if tempShownIds?.includes(`${paragraph.id}-${lIdx}-${wIdx}`) && hasTranslationForWord(word)}
                <span class="font-libreBaskerville my-1 block text-[12px] font-bold tracking-wide text-gray-500">{getTranslationForWord(word)}</span>
              {/if}
            </span>{' '}
          {/key}
        {/each}
      {/each}
    {:else}
      <!-- Split paragraph text into sentences and punctuation marks -->
      {@const sentences = paragraph.text.split(/([.!?]+[\p{P}\p{S}]*)/u).filter((s) => s.trim())}
      {#each sentences as sentence, sIdx}
        <!-- Check if current segment is punctuation -->
        {#if sentence.match(/[.!?]/)}
          <!-- This is punctuation, render it with the previous sentence -->
        {:else if sentence.trim()}
          <!-- Add line breaks between sentences except the first one -->
          {#if sIdx > 0}<br /><br />{/if}
          
          <!-- Split sentence into individual words -->
          {#each sentence.trim().split(/\s+/) as word, wIdx}
            {#key `${paragraph.id}-s${sIdx}-${wIdx}`}
              <span class="inline-flex flex-col items-center align-top">
                <!-- Popover component for word interactions -->
                <Popover open={editingWord === `${paragraph.id}-s${sIdx}-${wIdx}`}> 
                  <PopoverTrigger
                    type="button"
                    class="pronunciation-guide-text relative m-0 cursor-pointer border-none bg-transparent p-0 {wIdx === 0 ? '' : 'px-1'} font-normal select-text"
                    style="text-decoration-line: none; text-decoration-color: {getWordVocabulary(word)?.known ? 'gray' : 'green'}; text-decoration-style: dotted; text-decoration-opacity: {getWordVocabulary(word)?.known ? 0.2 : 0.5};"
                    on:click={(e) => { e.stopPropagation(); handleWordClick(`${paragraph.id}-s${sIdx}-${wIdx}`, word); }}
                  >
                    <!-- Pronunciation guide rendering -->
                    {#if showPronunciationGuide}
                      {@const matches = word.pronunciationMatches ?? findPronunciationMatches(word, rules)}
                      {#if matches.length > 0}
                        <div class="inline-flex flex-col items-start">
                          <div class="flex">
                            {#each word.split('') as char, charIdx}
                              {@const currentMatch = matches.find((m) => m.startIndex === charIdx)}
                              {#if currentMatch}
                                <!-- Matched character sequence with pronunciation -->
                                <span class="inline-flex flex-col items-center" style="flex: 0 0 auto; width: {currentMatch.endIndex - currentMatch.startIndex + 1}ch;">
                                  <span class="flex">
                                    {#each Array(currentMatch.endIndex - currentMatch.startIndex + 1) as _, i}
                                      <span  class="{currentMatch ? 'pronunciation-guide-matched' : ''} ">{word[charIdx + i]}</span>
                                    {/each}
                                  </span>
                                  <!-- Pronunciation text display -->
                                  <span class="pronunciation-guide-sounds mt-1 rounded px-1 py-0.5 text-center whitespace-nowrap " style="display:inline-block;min-width:100%;">
                                    {currentMatch.pronunciation}
                                  </span>
                                </span>
                              {:else if !matches.some((m) => charIdx > m.startIndex && charIdx <= m.endIndex)}
                                <!-- Regular character without pronunciation guide -->
                                <span class="pronunciation-guide-text">{char}</span>
                              {/if}
                            {/each}
                          </div>
                        </div>
                      {:else}
                        <!-- Fallback: Show plain word if no pronunciation matches -->
                        <span class="pronunciation-guide-text">{word}</span>
                      {/if}
                    {:else}
                      <!-- Fallback: Show plain word when pronunciation guide is disabled -->
                      <span class="pronunciation-guide-text">{word}</span>
                    {/if}
                    {#if wIdx === sentence.trim().split(/\s+/).length - 1 && sentences[sIdx + 1] && sentences[sIdx + 1].match(/[.!?]/)}
                      <!-- Attach punctuation directly to the last word -->
                      <span class="pronunciation-guide-punctuation ml-[-0.2rem]">
                        {sentences[sIdx + 1]}
                      </span>
                    {/if}
                  </PopoverTrigger>
                  
                  <!-- Popover content for word actions -->
                  <PopoverContent>
                    <div class="flex flex-col gap-2">
                      <!-- Button to mark word as known -->
                      <Button type="button" on:click={() => markKnown(word)} variant="ghost" class="mb-2 w-full text-xl">Mark as Known</Button>
                      
                      <!-- Form for adding/updating translation -->
                      <form on:submit|preventDefault={() => saveDocumentTranslationOnly(word, `${paragraph.id}-s${sIdx}-${wIdx}`)}>
                        <Input
                          placeholder="Add translation"
                          bind:value={translationInput}
                          on:input={() => updateDocumentTranslation(word, translationInput, `${paragraph.id}-s${sIdx}-${wIdx}`)}
                          class="mb-2 text-xl"
                          autofocus
                        />
                        <div class="flex gap-2">
                          <Button type="button" on:click={() => {
                            console.log('Non-reading mode occurrenceId:', `${paragraph.id}-s${sIdx}-${wIdx}`);
                            saveDocumentTranslationOnly(word, `${paragraph.id}-s${sIdx}-${wIdx}`);
                          }} variant="default" class="flex-1 text-xl font-bold">Update</Button>
                          {#if hasTranslationForWord(word)}
                            <Button type="button" on:click={() => deleteTranslation(word)} variant="destructive" class="text-xl font-bold">Delete</Button>
                          {/if}
                        </div>
                      </form>
                    </div>
                  </PopoverContent>
                </Popover>
                
                <!-- Display translation if available -->
                {#if getWordVocabulary(word)?.known && getWordVocabulary(word)?.eng_translation}
                  <span class="my-1 block text-[12px] font-bold tracking-wide text-gray-200">
                    {getWordVocabulary(word)?.eng_translation}
                  </span>
                {:else if tempShownIds?.includes(`${paragraph.id}-s${sIdx}-${wIdx}`) && hasTranslationForWord(word)}
                  <span class=" my-2 mt-4 block text-xl font-bold tracking-wide text-gray-900">
                    {getTranslationForWord(word)}
                  </span>
                {/if}
              </span>{' '}
            {/key}
          {/each}
        {/if}
      {/each}
    {/if}
    <br /><br />
  {/each}
</div>
