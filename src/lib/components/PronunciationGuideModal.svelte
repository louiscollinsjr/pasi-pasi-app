<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { listGuidesForTarget, getLanguageLabel } from '$lib/pronunciation';
  import { X, Check } from 'lucide-svelte';

  export let isOpen: boolean = false;
  export let targetLang: string = 'ro';
  export let currentNativeLang: string = 'en';

  const dispatch = createEventDispatcher();

  let selectedNative = currentNativeLang;
  $: selectedNative = currentNativeLang; // keep in sync when prop changes

  function closeModal() {
    dispatch('close');
    isOpen = false;
  }

  function handleKeydown(event: KeyboardEvent) {
    if (event.key === 'Escape') {
      closeModal();
    }
  }

  function applySelection() {
    dispatch('select', { native: selectedNative });
  }

  $: options = listGuidesForTarget(targetLang);
</script>

<svelte:window on:keydown={handleKeydown} />

{#if isOpen}
  <!-- Modal backdrop with blur -->
  <div 
    class="fixed inset-0 bg-white/10 backdrop-blur-sm z-50 flex items-center justify-center p-4 overflow-y-auto pt-[env(safe-area-inset-top)] pb-[env(safe-area-inset-bottom)]"
    on:click={closeModal}
    role="dialog"
    aria-modal="true"
    aria-labelledby="modal-title"
  >
    <!-- Modal content -->
    <div 
      class="bg-white rounded-2xl shadow-2xl w-full max-w-lg p-6 sm:p-8 relative max-h-[85vh] overflow-y-auto translate-y-16 sm:translate-y-0"
      on:click|stopPropagation
    >
      <!-- Close button -->
      <button
        on:click={closeModal}
        class="absolute top-6 right-6 text-gray-300 hover:text-gray-500 transition-colors"
        aria-label="Close modal"
      >
        <X size={24} />
      </button>

      <!-- Modal header -->
      <div class="mb-6">
        <h2 id="modal-title" class="text-2xl font-medium text-gray-900 mb-1">
          Pronunciation Guide
        </h2>
        <p class="text-gray-500">
          Source language: <span class="font-medium">{getLanguageLabel(targetLang)}</span>
        </p>
      </div>

      <!-- Options -->
      {#if options.length > 0}
        <div class="space-y-3">
          {#each options as opt}
            <label class="flex items-center justify-between border rounded-xl px-4 py-3 cursor-pointer hover:bg-gray-50">
              <div class="flex items-center gap-3">
                <input
                  type="radio"
                  name="native"
                  value={opt.native}
                  bind:group={selectedNative}
                />
                <div>
                  <div class="text-gray-900 font-medium">{opt.label}</div>
                  <div class="text-gray-500 text-sm">Pronunciation Guide: {targetLang}-{opt.native}</div>
                </div>
              </div>
              {#if selectedNative === opt.native}
                <Check size={18} class="text-green-600" />
              {/if}
            </label>
          {/each}
        </div>
      {:else}
        <div class="text-gray-500">No pronunciation guides available for {getLanguageLabel(targetLang)} yet.</div>
      {/if}

      <!-- Actions -->
      <div class="flex gap-4 pt-6">
        <button
          on:click={closeModal}
          class="flex-1 px-6 py-3 text-gray-600 bg-gray-50 hover:bg-gray-100 rounded-xl transition-colors font-medium"
        >
          Cancel
        </button>
        <button
          on:click={applySelection}
          class="flex-1 px-6 py-3 bg-black hover:bg-gray-800 text-white rounded-xl transition-colors font-medium"
        >
          Apply
        </button>
      </div>
    </div>
  </div>
{/if}
