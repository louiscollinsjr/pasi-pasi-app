<script>
  import { createEventDispatcher } from 'svelte';
  
  export let sentence;
  export let showEnglish = true;
  export let showAIDecode = false;
  
  const dispatch = createEventDispatcher();
  
  function handleWordStatusChange(wordIndex, status) {
    dispatch('wordStatusChange', { wordIndex, status });
  }
  
  function handleDecodeChange(wordIndex, value) {
    dispatch('decodeChange', { wordIndex, value });
  }
  
  function getWordStatusClass(status) {
    switch (status) {
      case 'known':
        return 'text-green-600 bg-green-50 border-green-200';
      case 'unknown':
        return 'text-red-600 bg-red-50 border-red-200';
      default:
        return 'text-gray-600 bg-gray-50 border-gray-200';
    }
  }
</script>

<div class="sentence-editor bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-4">
  <div class="grid gap-2" style="grid-template-columns: repeat({sentence.words.length}, minmax(0, 1fr));">
    
    <!-- Romanian words row -->
    <div class="contents">
      {#each sentence.words as word, index}
        <div class="text-center">
          <button
            class="w-full px-2 py-1 text-sm font-medium rounded border transition-colors {getWordStatusClass(word.status)}"
            on:click={() => {
              const nextStatus = word.status === 'known' ? 'unknown' : word.status === 'unknown' ? 'blank' : 'known';
              handleWordStatusChange(index, nextStatus);
            }}
            title="Click to cycle: known → unknown → blank"
          >
            {word.rom}
          </button>
        </div>
      {/each}
    </div>
    
    <!-- Decode row (editable) -->
    <div class="contents">
      {#each sentence.words as word, index}
        <div class="text-center">
          <input
            type="text"
            class="w-full px-2 py-1 text-sm text-center border border-gray-300 rounded focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            value={word.decode}
            on:input={(e) => handleDecodeChange(index, e.target.value)}
            placeholder="decode"
          />
        </div>
      {/each}
    </div>
    
    <!-- English translation row (optional) -->
    {#if showEnglish}
      <div class="contents">
        {#each sentence.words as word, index}
          <div class="text-center">
            <div class="px-2 py-1 text-sm text-gray-500 bg-gray-50 rounded border border-gray-200">
              {word.eng}
            </div>
          </div>
        {/each}
      </div>
    {/if}
    
  </div>
  
  <!-- Sentence controls -->
  <div class="mt-4 flex items-center justify-between text-sm text-gray-500">
    <div class="flex items-center space-x-4">
      <label class="flex items-center">
        <input
          type="checkbox"
          bind:checked={showEnglish}
          class="mr-2 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
        />
        Show English
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
    
    <div class="text-xs">
      Known: {sentence.words.filter(w => w.status === 'known').length} / 
      Total: {sentence.words.filter(w => w.rom.trim()).length}
    </div>
  </div>
</div>

<style>
  .sentence-editor {
    font-family: 'Inter', -apple-system, BlinkMacSystemFont, sans-serif;
  }
</style>
