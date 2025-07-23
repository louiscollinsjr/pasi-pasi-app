<script>
  import { createEventDispatcher } from 'svelte';
  import { splitIntoSentences } from '../lib/tokenizer.js';
  
  const dispatch = createEventDispatcher();
  
  let textInput = '';
  let fileInput;
  
  function handleTextSubmit() {
    if (textInput.trim()) {
      const sentences = splitIntoSentences(textInput);
      dispatch('textSubmitted', { text: textInput, sentences });
      textInput = '';
    }
  }
  
  function handleFileUpload(event) {
    const file = event.target.files[0];
    if (file && file.type === 'text/plain') {
      const reader = new FileReader();
      reader.onload = (e) => {
        const text = e.target.result;
        const sentences = splitIntoSentences(text);
        dispatch('textSubmitted', { text, sentences });
      };
      reader.readAsText(file);
    }
  }
  
  function handleKeydown(event) {
    if (event.key === 'Enter' && event.ctrlKey) {
      handleTextSubmit();
    }
  }
</script>

<div class="text-input bg-white rounded-lg shadow-sm border border-gray-200 p-6 mb-6">
  <h2 class="text-xl font-semibold text-gray-800 mb-4">Add Romanian Text</h2>
  
  <div class="space-y-4">
    <!-- Text area input -->
    <div>
      <label for="text-input" class="block text-sm font-medium text-gray-700 mb-2">
        Paste Romanian text (Ctrl+Enter to submit)
      </label>
      <textarea
        id="text-input"
        bind:value={textInput}
        on:keydown={handleKeydown}
        class="w-full h-32 px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-vertical"
        placeholder="Paste your Romanian text here..."
      ></textarea>
    </div>
    
    <!-- File upload -->
    <div>
      <label for="file-input" class="block text-sm font-medium text-gray-700 mb-2">
        Or upload a text file
      </label>
      <input
        id="file-input"
        type="file"
        accept=".txt"
        bind:this={fileInput}
        on:change={handleFileUpload}
        class="block w-full text-sm text-gray-500 file:mr-4 file:py-2 file:px-4 file:rounded-full file:border-0 file:text-sm file:font-semibold file:bg-blue-50 file:text-blue-700 hover:file:bg-blue-100"
      />
    </div>
    
    <!-- Submit button -->
    <div class="flex justify-end">
      <button
        on:click={handleTextSubmit}
        disabled={!textInput.trim()}
        class="px-6 py-2 bg-blue-600 text-white font-medium rounded-md hover:bg-blue-700 focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
      >
        Process Text
      </button>
    </div>
  </div>
</div>
