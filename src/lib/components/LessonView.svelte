<script lang="ts">
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index';
	import { Input } from '$lib/components/ui/input/index';
	import Button from '$lib/components/ui/button/button.svelte';
	import FloatingToolbar from '$lib/components/FloatingToolbar.svelte';
	import { getPronunciationRules, findPronunciationMatches, getLanguageLabel } from '$lib/pronunciation';
	import PronunciationGuideModal from '$lib/components/PronunciationGuideModal.svelte';
	import { userProfile } from '$lib/stores/userProfileStore';
	import { VocabularyService } from '$lib/services/vocabularyService';
	import type { VocabularyWord, WordTranslation } from '$lib/services/vocabularyService';
	import { ArrowLeft, BarChart3, Text, Eye, EyeOff, Focus, Speech } from 'lucide-svelte';
	import { writable, get } from 'svelte/store';
	import { onMount } from 'svelte';
	import { tick } from 'svelte';
	import DisplayContent from './DisplayContent.svelte';

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
	let readingMode = true; // true = reading mode (paragraphs), false = focus mode (sentence-per-line)
	let localVocabulary = vocabulary; // Global known words only
	const documentTranslationsStore = writable(documentTranslations);

	// Target and native language for pronunciation guide
	let targetLang: string = lesson?.language_code || 'ro';
	$: targetLang = lesson?.language_code || 'ro';
	let selectedNativeLang: string = $userProfile.profile?.native_language || 'en';
	let rules = getPronunciationRules(targetLang, selectedNativeLang);
	let showGuideModal = false;

	// Detect mobile viewport to disable modal on small screens
	let isMobile = false;
	function updateIsMobile() {
		if (typeof window !== 'undefined' && 'matchMedia' in window) {
			isMobile = window.matchMedia('(max-width: 639px)').matches; // Tailwind 'sm' breakpoint
		}
	}

	// Ensure profile is loaded to get default native language
	onMount(async () => {
		// initialize and listen for viewport changes
		updateIsMobile();
		window.addEventListener('resize', updateIsMobile);

		if (!$userProfile.profile) {
			await userProfile.fetchProfile();
			selectedNativeLang = $userProfile.profile?.native_language || selectedNativeLang;
		}

		// cleanup listener on destroy
		return () => {
			window.removeEventListener('resize', updateIsMobile);
		};
	});

	// Recompute when selection or target changes
	$: rules = getPronunciationRules(targetLang, selectedNativeLang);

	// Default native language for pronunciation; make dynamic later
	// const nativeLang = 'en';
	// const rules = getPronunciationRules(nativeLang);

	// Sticky header state
	let isHeaderSticky = false;
	let headerElement: HTMLElement;
	let scrollY = 0;

	// Ensure modal never stays open on mobile
	$: if (isMobile && showGuideModal) showGuideModal = false;

	// Update toolbar items reactively
	$: toolbarItems = [
		{
			id: 'reading-mode',
			icon: Text,
			label: 'Reading',
			action: () => toggleMode('reading'),
			active: readingMode
		},
		{
			id: 'focus-mode',
			icon: Focus,
			label: 'Focus',
			action: () => toggleMode('focus'),
			active: !readingMode
		},
		{
			id: 'pronunciation',
			icon: Speech,
			label: 'Pronunciation',
			action: () => togglePronunciation(),
			active: showPronunciationGuide
		}
	];

	// Toolbar action handlers
	function toggleMode(mode) {
		readingMode = mode === 'reading';
		
		// Disable pronunciation guide when switching to reading mode
		if (mode === 'reading') {
			showPronunciationGuide = false;
		}
	}

	function togglePronunciation() {
		showPronunciationGuide = !showPronunciationGuide;
		
		// Switch to focus mode if currently in reading mode
		if (readingMode) {
			toggleMode('focus');
		}
	}

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

			documentTranslationsStore.update((translations) => ({
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
			documentTranslationsStore.update((translations) => {
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
		documentTranslationsStore.update((translations) => {
			const { [normalized]: _, ...rest } = translations;
			return rest;
		});

		// Save to database
		const success = await VocabularyService.markWordAsKnown(
			lessonId,
			normalized,
			translationInput.trim()
		);

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

		const matches = findPronunciationMatches(word, rules);
		if (matches.length === 0) {
			return word; // No pronunciation matches found
		}

		// This will be handled in the template with special rendering
		return { word, matches, wordId };
	}

	// Handle scroll for sticky header
	function handleScroll() {
		if (headerElement) {
			const scrollPosition = window.scrollY;
			// Set sticky when scrolled past the header
			isHeaderSticky = scrollPosition > 100; // Adjust this value based on when you want the header to stick
		}
	}

	// Add and remove scroll event listener
	onMount(() => {
		if (typeof window !== 'undefined') {
			window.addEventListener('scroll', handleScroll, { passive: true });
		}

		return () => {
			if (typeof window !== 'undefined') {
				window.removeEventListener('scroll', handleScroll);
			}
		};
	});
</script>

<!-- Floating Toolbar -->
<FloatingToolbar
	items={toolbarItems}
	on:toggle-mode={(e) => toggleMode(e.detail)}
	on:toggle-pronunciation={togglePronunciation}
	on:item-click={(e) => console.log('Toolbar item clicked:', e.detail)}
/>

<!-- Header Section -->
<div 
	bind:this={headerElement}
	class="sticky top-20 z-30 bg-white border-b border-gray-100 transition-all duration-300 ease-in-out {isHeaderSticky ? 'shadow-none' : ''}"
>
	<div class="container mx-auto px-6 transition-all duration-300 ease-in-out {isHeaderSticky ? 'py-3' : 'py-4'}">
		<!-- Breadcrumb Navigation - hide when sticky -->
		<div class="flex items-center gap-3 mb-2 transition-all duration-300 ease-in-out {isHeaderSticky ? 'opacity-0 h-0 overflow-hidden' : 'opacity-100'}">
			<a href="/library" class="text-sm text-gray-400 transition-colors hover:text-gray-600">
				Library
			</a>
			{#if collection}
				<span class="text-gray-300">/</span>
				<a
					href="/library/collections/{collection.id}"
					class="text-sm text-gray-400 transition-colors hover:text-gray-600"
				>
					{collection.title}
				</a>
			{/if}
			<span class="text-gray-300">/</span>
			<div class="rounded-lg bg-gray-50 p-1.5">
				<Text size={14} class="text-gray-400" />
			</div>

<!-- Pronunciation Guide Modal (disabled on mobile: not rendered) -->
{#if !isMobile}
  <PronunciationGuideModal
    bind:isOpen={showGuideModal}
    {targetLang}
    currentNativeLang={selectedNativeLang}
    on:close={() => (showGuideModal = false)}
    on:select={(e) => {
      const { native } = e.detail;
      selectedNativeLang = native;
      showGuideModal = false;
    }}
  />
{/if}

		</div>

		<div class="flex items-center justify-between">
			<h1 class="font-medium break-words text-gray-900 transition-all duration-300 ease-in-out {isHeaderSticky ? 'text-lg' : 'text-2xl'}">
				{lesson.title}
				<!-- Language badge -->
				{#if lesson.language_code}
					<span
						class="inline-flex items-center px-2 py-0.5 rounded-md text-xs font-medium bg-gray-200 text-gray-700 uppercase tracking-wide"
						title={`Lesson language: ${getLanguageLabel(lesson.language_code)}`}
					>
						{lesson.language_code}
					</span>
					<!-- Guide badge (desktop/tablet): clickable opens modal -->
          <button
            type="button"
            class="hidden sm:inline-flex items-center ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-700 uppercase tracking-wide hover:bg-gray-200"
            on:click={() => { if (!isMobile) showGuideModal = true; }}
            title={`Select pronunciation guide (current: ${getLanguageLabel(selectedNativeLang)} for ${getLanguageLabel(lesson.language_code)})`}
          >
            {selectedNativeLang.toUpperCase()}
          </button>
          <!-- Guide badge (mobile): non-interactive -->
          <span
            class="inline-flex sm:hidden items-center ml-2 px-2 py-0.5 rounded-md text-xs font-medium bg-gray-100 text-gray-500 uppercase tracking-wide cursor-not-allowed opacity-70"
            title="Pronunciation guide selection is disabled on mobile"
          >
            {selectedNativeLang.toUpperCase()}
          </span>
        {/if}
			</h1>

			<!-- Lesson Metrics - show compact version when sticky -->
				{#if lessonMetrics}
					<div class="flex items-center gap-4 text-sm text-gray-500 transition-all duration-300 ease-in-out {isHeaderSticky ? 'opacity-70' : 'opacity-100'}">
						<div class="flex items-center gap-1">
							<BarChart3 size={14} class="text-gray-400" />
							<span class="hidden sm:inline">{lessonMetrics.comprehensionRate}%</span>
						</div>
						<div class="h-4 w-px bg-gray-200"></div>
						<div class="flex items-center gap-1">
							<span class="hidden sm:inline">{lessonMetrics.knownWords}/{lessonMetrics.totalWords}</span>
							<span class="text-xs text-gray-400">words</span>
						</div>
					</div>
				{/if}
			</div>
		</div>
	</div>

<!-- Main Content -->
<div class="container mx-auto px-6 py-8 max-w-[710px] {readingMode ? 'typography-reading-mode' : 'typography-focus-mode'}">
  <div class="bg-white pt-12 sm:pt-24 leading-relaxed whitespace-pre-wrap">
    <DisplayContent
      paragraphs={lesson.data.paragraphs}
      {readingMode}
      {showPronunciationGuide}
      {editingWord}
      {translationInput}
      handleWordClick={handleWordClick}
      markKnown={markKnown}
      saveDocumentTranslationOnly={saveDocumentTranslationOnly}
      updateDocumentTranslation={updateDocumentTranslation}
      deleteTranslation={deleteTranslation}
      hasTranslationForWord={hasTranslationForWord}
      getWordVocabulary={getWordVocabulary}
      getTranslationForWord={getTranslationForWord}
      targetLang={targetLang}
      nativeLang={selectedNativeLang}
    />
  </div>
</div>

<style>
  .pronunciation-guide {
    font-family: 'Patrick Hand SC', cursive;
    font-size: 0.75rem;
    line-height: 1.2;
    color: #4b5563;
  }

  :global(body) {
    font-family: 'Roboto Variable', sans-serif;
  }

  .popover-content {
    z-index: 50;
    min-width: 8rem;
    overflow: hidden;
    @apply rounded-md border bg-white p-1 text-popover-foreground shadow-md outline-none;
  }
</style>
