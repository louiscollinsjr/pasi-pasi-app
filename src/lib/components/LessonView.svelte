<script lang="ts">
	import { Popover, PopoverContent, PopoverTrigger } from '$lib/components/ui/popover/index';
	import { Input } from '$lib/components/ui/input/index';
	import Button from '$lib/components/ui/button/button.svelte';
	import FloatingToolbar from '$lib/components/FloatingToolbar.svelte';
	import { findPronunciationMatches } from '$lib/data/pronunciationGuide.js';
	import { VocabularyService } from '$lib/services/vocabularyService';
	import type { VocabularyWord, WordTranslation } from '$lib/services/vocabularyService';
	import { ArrowLeft, BarChart3, Text, Eye, EyeOff, Focus, Speech } from 'lucide-svelte';
	import { writable, get } from 'svelte/store';
	import { onMount } from 'svelte';

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
	let sentencePerLine = false; // Toggle between sentence-per-line vs paragraph mode
	let readingMode = true; // true = reading mode, false = focus mode
	let localVocabulary = vocabulary; // Global known words only
	const documentTranslationsStore = writable(documentTranslations);

	// Sticky header state
	let isHeaderSticky = false;
	let headerElement: HTMLElement;
	let scrollY = 0;

	// Floating toolbar configuration
	let toolbarItems = [
		{
			id: 'back',
			icon: ArrowLeft,
			label: 'Back',
			action: () => history.back()
		},
		{
			id: 'reading-mode',
			icon: Text,
			label: 'Reading Mode',
			action: () => toggleMode('reading'),
			active: readingMode
		},
		{
			id: 'focus-mode',
			icon: Focus,
			label: 'Focus Mode',
			action: () => toggleMode('focus'),
			active: !readingMode
		},
		{
			id: 'pronunciation',
			icon: Speech,
			label: 'Pronunciation Guide',
			action: () => togglePronunciation(),
			active: showPronunciationGuide
		},
		{
			id: 'sentence-mode',
			icon: Eye,
			label: sentencePerLine ? 'Paragraph Mode' : 'Sentence Mode',
			action: () => toggleSentenceMode(),
			active: sentencePerLine
		}
	];

	// Update toolbar items reactively
	$: toolbarItems = [
		// {
		//   id: 'back',
		//   icon: ArrowLeft,
		//   label: 'Back',
		//   action: () => history.back()
		// },
		{
			id: 'reading-mode',
			icon: Text,
			label: 'Reading Mode',
			action: () => toggleMode('reading'),
			active: readingMode
		},
		{
			id: 'focus-mode',
			icon: Focus,
			label: 'Focus Mode',
			action: () => toggleMode('focus'),
			active: !readingMode
		},
		{
			id: 'pronunciation',
			icon: Speech,
			label: 'Pronunciation Guide',
			action: () => togglePronunciation(),
			active: showPronunciationGuide
		},
		{
			id: 'sentence-mode',
			icon: Eye,
			label: sentencePerLine ? 'Paragraph Mode' : 'Sentence Mode',
			action: () => toggleSentenceMode(),
			active: sentencePerLine
		}
	];

	// Toolbar action handlers
	function toggleMode(mode) {
		readingMode = mode === 'reading';
	}

	function togglePronunciation() {
		showPronunciationGuide = !showPronunciationGuide;
	}

	function toggleSentenceMode() {
		sentencePerLine = !sentencePerLine;
	}

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

		const matches = findPronunciationMatches(word);
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
		</div>

		<div class="flex items-center justify-between">
			<h1 class="font-medium break-words text-gray-900 transition-all duration-300 ease-in-out {isHeaderSticky ? 'text-lg' : 'text-2xl'}">
				{lesson.title}
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
<div class="container mx-auto px-6 py-8">
	<div class="font-patrickHandSC text-2xl sm:text-3xl bg-white pt-12 sm:pt-24 leading-relaxed whitespace-pre-wrap">
		{#each lesson.data.paragraphs as paragraph, pIdx}
			{#if sentencePerLine}
				{@const sentences = paragraph.text.split(/([.!?]+)/).filter((s) => s.trim())}
				{#each sentences as sentence, sIdx}
					{#if sentence.match(/[.!?]/)}
						<!-- This is punctuation, render it with the previous sentence -->
					{:else if sentence.trim()}
						{#if sIdx > 0}<br /><br />{/if}
						{#each sentence.trim().split(/\s+/) as word, wIdx}
							{#key `${paragraph.id}-s${sIdx}-${wIdx}`}
								<span class="inline-flex flex-col items-center align-top">
									<!-- Word rendering logic here -->
									<Popover open={editingWord === `${paragraph.id}-s${sIdx}-${wIdx}`}>
										<PopoverTrigger
											type="button"
											class="relative m-0 cursor-pointer border-none bg-transparent p-0 px-1 font-normal text-[#367dc2] text-gray-600 select-text"
											style="text-decoration-line: none; text-decoration-color: {getWordVocabulary(
												word
											)?.known
												? 'gray'
												: 'green'}; text-decoration-style: dotted; text-decoration-opacity: {getWordVocabulary(
												word
											)?.known
												? 0.2
												: 0.5};"
											on:click={(e) => {
												e.stopPropagation();
												handleWordClick(`${paragraph.id}-s${sIdx}-${wIdx}`, word);
											}}
										>
											{#if showPronunciationGuide}
												{@const matches =
													word.pronunciationMatches ?? findPronunciationMatches(word)}
												{#if matches.length > 0}
													<!-- Render word with aligned pronunciation annotations -->
													<div class="inline-flex flex-col items-start">
														<!-- Word with highlighted letters -->
														<div class="flex">
															{#each word.split('') as char, charIdx}
																{@const currentMatch = matches.find(
																	(m) => m.startIndex === charIdx
																)}
																{#if currentMatch}
																	<span
																		class="inline-flex flex-col items-center"
																		style="flex: 0 0 auto; width: {currentMatch.endIndex -
																			currentMatch.startIndex +
																			1}ch;"
																	>
																		<span class="flex">
																			{#each Array(currentMatch.endIndex - currentMatch.startIndex + 1) as _, i}
																				<span style="color: #9D4EDD;">{word[charIdx + i]}</span>
																				<!--#9D4EDD is purple-->
																			{/each}
																		</span>
																		<span
																			class="font-patrickHandSc bg-blue-000 mt-1 rounded px-1 py-0.5 text-center sm:text-2xl whitespace-nowrap text-[#367dc2]"
																			style="display:inline-block;min-width:100%;"
																		>
																			{currentMatch.pronunciation}
																		</span>
																	</span>
																{:else if !matches.some((m) => charIdx > m.startIndex && charIdx <= m.endIndex)}
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
										</PopoverTrigger>
										<PopoverContent>
											<div class="flex flex-col gap-2">
												<Button
													on:click={() => markKnown(word)}
													variant="ghost"
													class="mb-2 w-full text-xl">Mark as Known</Button
												>
												<form on:submit|preventDefault={() => saveDocumentTranslationOnly(word)}>
													<Input
														placeholder="Add translation"
														bind:value={translationInput}
														on:input={() => updateDocumentTranslation(word, translationInput)}
														class="mb-2 text-xl"
														autofocus
													/>
													<div class="flex gap-2">
														<Button type="submit" variant="default" class="flex-1 text-xl font-bold"
															>Update</Button
														>
														{#if hasTranslationForWord(word)}
															<Button
																on:click={() => deleteTranslation(word)}
																variant="destructive"
																class="text-xl font-bold">Delete</Button
															>
														{/if}
													</div>
												</form>
											</div>
										</PopoverContent>
									</Popover>
									{#if getWordVocabulary(word)?.eng_translation}
										<span
											class="font-libreBaskerville my-1 block text-[12px] font-bold tracking-wide text-gray-200"
											>{getWordVocabulary(word)?.eng_translation}</span
										>
									{:else if hasTranslationForWord(word)}
										<span
											class="font-roboto my-2 mt-4 block text-xl font-bold tracking-wide text-gray-900"
											>{getTranslationForWord(word)}</span
										>
									{/if}
								</span>
								{' '}
							{/key}
						{/each}
						<!-- Add punctuation if next item is punctuation -->
						{#if sentences[sIdx + 1] && sentences[sIdx + 1].match(/[.!?]/)}
							<span class="inline-flex flex-col items-center align-top">
								<button
									type="button"
									class="relative m-0 cursor-pointer border-none bg-transparent p-0 px-1 font-normal text-[#367dc2] text-gray-600 select-text"
								>
									{sentences[sIdx + 1]}
								</button>
							</span>
						{/if}
					{/if}
				{/each}
			{:else}
				{#each paragraph.text.split(/\n/) as line, lIdx}
					{#if lIdx > 0}<br />{/if}
					{#each line.trim().split(/\s+/) as word, wIdx}
						{#key `${paragraph.id}-${lIdx}-${wIdx}`}
							<span class="inline-flex flex-col items-center align-top">
								<Popover open={editingWord === `${paragraph.id}-${lIdx}-${wIdx}`}>
									<PopoverTrigger
										type="button"
										class="font-libreBaskerville font-patrickHandSc relative m-0 cursor-pointer border-none bg-transparent p-0 px-1 text-5xl font-normal text-[#367dc2] text-gray-600 select-text"
										style="text-decoration-line: none; text-decoration-color: {getWordVocabulary(
											word
										)?.known
											? 'gray'
											: 'green'}; text-decoration-style: dotted; text-decoration-opacity: {getWordVocabulary(
											word
										)?.known
											? 0.2
											: 0.5};"
										on:click={(e) => {
											e.stopPropagation();
											handleWordClick(`${paragraph.id}-${lIdx}-${wIdx}`, word);
										}}
									>
										{#if showPronunciationGuide}
											{@const matches = word.pronunciationMatches ?? findPronunciationMatches(word)}
											{#if matches.length > 0}
												<!-- Render word with aligned pronunciation annotations -->
												<div class="inline-flex flex-col items-start">
													<!-- Word with highlighted letters -->
													<div class="flex">
														{#each word.split('') as char, charIdx}
															{#if matches.some((m) => m.startIndex === charIdx)}
																{@const match = matches.find((m) => m.startIndex === charIdx)}
																<span
																	class="inline-flex flex-col items-center"
																	style="flex: 0 0 auto; width: {match.endIndex -
																		match.startIndex +
																		1}ch;"
																>
																	<span class="flex">
																		{#each Array(match.endIndex - match.startIndex + 1) as _, i}
																			<span style={match ? 'color: #9D4EDD;' : ''}
																				>{word[charIdx + i]}</span
																			>
																			<!-- #FF2658 is red -->
																		{/each}
																	</span>
																	<span
																		class="font-patrickHandSc bg-blue-000 mt-1 rounded px-1 py-0.5 text-center text-4xl whitespace-nowrap text-[#367dc2]"
																		style="display:inline-block;min-width:100%;"
																	>
																		{match.pronunciation}
																	</span>
																</span>
															{:else if !matches.some((m) => charIdx > m.startIndex && charIdx <= m.endIndex)}
																<span class="inline-flex flex-col items-center">
																	<span>{char}</span>
																	<span class="mt-1 h-4 text-[10px]"></span>
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
									</PopoverTrigger>
									<PopoverContent>
										<div class="flex flex-col gap-2">
											<Button
												on:click={() => markKnown(word)}
												variant="ghost"
												class="mb-2 w-full text-xl">Mark as Known</Button
											>
											<form on:submit|preventDefault={() => saveDocumentTranslationOnly(word)}>
												<Input
													placeholder="Add translation"
													bind:value={translationInput}
													on:input={() => updateDocumentTranslation(word, translationInput)}
													class="mb-2 text-xl"
													autofocus
												/>
												<div class="flex gap-2">
													<Button type="submit" variant="default" class="flex-1 text-xl font-bold"
														>Update</Button
													>
													{#if hasTranslationForWord(word)}
														<Button
															on:click={() => deleteTranslation(word)}
															variant="destructive"
															class="text-xl font-bold">Delete</Button
														>
													{/if}
												</div>
											</form>
										</div>
									</PopoverContent>
								</Popover>
								{#if getWordVocabulary(word)?.eng_translation}
									<span
										class="font-libreBaskerville my-1 block text-[12px] font-bold tracking-wide text-gray-200"
										>{getWordVocabulary(word)?.eng_translation}</span
									>
								{:else if hasTranslationForWord(word)}
									<span
										class="font-libreBaskerville my-1 block text-[12px] font-bold tracking-wide text-gray-500"
										>{getTranslationForWord(word)}</span
									>
								{/if}
							</span>
							{' '}
						{/key}
					{/each}
				{/each}
			{/if}
			<br /><br />
		{/each}
	</div>
</div>

<style>
	.font-mansalva {
		font-family: 'Mansalva', serif;
	}

	.font-libreBaskerville {
		font-family: 'Libre Baskerville', serif;
	}

	.font-patrickHand {
		font-family: 'Patrick Hand', cursive;
	}

	.font-patrickHandSC {
		font-family: 'Patrick Hand SC', cursive;
	}

	.font-roboto {
		font-family: 'Roboto Variable', sans-serif;
	}

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
