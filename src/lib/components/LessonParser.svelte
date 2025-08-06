<script lang="ts">
  import { createEventDispatcher } from 'svelte';
  import { supabase } from '$lib/supabaseClient';
  import { parseLesson, type ParsedLesson, reconstructLesson } from '$lib/utils/parseLesson';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card/index';
  import { Textarea } from '$lib/components/ui/textarea/index';

  export let collectionId: number | null = null;
  const dispatch = createEventDispatcher();

  let inputText = '';
  let parsedLesson: ParsedLesson | null = null;
  let isProcessing = false;

  function getLeadingSpaces(line: string): number {
    return (line.match(/^\s*/) || [''])[0].length;
  }

  // Sample Romanian text for demonstration
  const sampleText = `Învățarea limbii române

Limba română este o limbă frumoasă și melodioasă. Ea face parte din familia limbilor romanice, alături de italiană, spaniolă, franceză și portugheză.

România este o țară situată în sud-estul Europei. Capitala României este București, un oraș mare și modern. În România trăiesc aproximativ 19 milioane de oameni.

Cultura română este bogată și diversă. Românii sunt cunoscuți pentru ospitalitatea lor. Mâncarea tradițională românească include sarmale, mici și papanași.`;

  import { getPronunciationRules, findPronunciationMatches } from '$lib/pronunciation';

  function enrichParsedLesson(parsedLesson: ParsedLesson) {
    // Defaulting to 'en' for now. This can be dynamic later.
    const nativeLang = 'en';
    const rules = getPronunciationRules(nativeLang);

    for (const paragraph of parsedLesson.paragraphs) {
      for (const sentence of paragraph.sentences) {
        sentence.words = sentence.words.map((word: any, i: number) => {
          const rom = typeof word === 'string' ? word : word.rom;
          return {
            rom,
            eng: sentence.eng ? sentence.eng[i] : '',
            decode: sentence.decode ? sentence.decode[i] : '',
            userInput: '',
            aiTranslation: sentence.decode ? sentence.decode[i] : '',
            known: false,
            pronunciationMatches: findPronunciationMatches(rom, rules)
          };
        });
      }
    }
    return parsedLesson;
  }

  function handleProcess() {
    if (!inputText.trim()) return;
    isProcessing = true;
    setTimeout(() => {
      parsedLesson = parseLesson(inputText);
      parsedLesson = enrichParsedLesson(parsedLesson);
      isProcessing = false;
    }, 300);
  }

  function loadSample() {
    inputText = sampleText;
  }

  function clearAll() {
    inputText = '';
    parsedLesson = null;
  }

  let saveStatus = '';
  let isSaving = false;

  async function saveDocument() {
    if (!parsedLesson) return;

    const { data: { user } } = await supabase.auth.getUser();
    if (!user) {
      saveStatus = 'You must be logged in to save.';
      setTimeout(() => (saveStatus = ''), 3000);
      return;
    }

    isSaving = true;
    saveStatus = 'Saving...';

    const documentData = {
      collection_id: collectionId,
      user_id: user.id,
      title: parsedLesson.title,
      content: parsedLesson, // The full parsed object for the JSONB column
      original_text: inputText
    };

    const { data, error } = await supabase
      .from('documents')
      .insert(documentData)
      .select()
      .single();

    if (error) {
      saveStatus = `Error: ${error.message}`;
      console.error('Error saving document:', error);
    } else {
      saveStatus = 'Document saved successfully!';
      dispatch('documentAdded', data);
      
      // Optionally clear the parser
      clearAll();
    }

    isSaving = false;
    setTimeout(() => saveStatus = '', 3000);
  }
</script>

<div class="space-y-6">
  <Card.Root>
    <Card.Header>
      <Card.Title>Romanian Lesson Parser</Card.Title>
      <Card.Description>
        Paste Romanian lesson text below to parse it into structured paragraphs and sentences.
      </Card.Description>
    </Card.Header>
    <Card.Content class="space-y-4">
      <div class="space-y-2">
        <label for="lesson-input" class="text-sm font-medium">Lesson Text</label>
        <Textarea
          id="lesson-input"
          bind:value={inputText}
          placeholder="Paste your Romanian lesson text here..."
          class="min-h-[200px] resize-y"
        />
      </div>
      
      <div class="flex gap-2">
        <Button
          onclick={handleProcess}
          disabled={!inputText.trim() || isProcessing}
          class="flex-1"
        >
          {isProcessing ? 'Processing...' : 'Process Lesson'}
        </Button>
        <Button variant="outline" onclick={loadSample}>
          Load Sample
        </Button>
        <Button variant="outline" onclick={clearAll}>
          Clear
        </Button>
      </div>
    </Card.Content>
  </Card.Root>

  {#if parsedLesson}
    <Card.Root>
      <Card.Header>
        <Card.Title>Parsed Lesson: {parsedLesson.title}</Card.Title>
        <Card.Description>
          {parsedLesson.paragraphs.length} paragraph{parsedLesson.paragraphs.length !== 1 ? 's' : ''} • 
          {parsedLesson.paragraphs.reduce((total, p) => total + p.sentences.length, 0)} sentence{parsedLesson.paragraphs.reduce((total, p) => total + p.sentences.length, 0) !== 1 ? 's' : ''}
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="space-y-6">
          {#each parsedLesson.paragraphs as paragraph, pIndex}
            <div class="border-l-4 border-blue-200 pl-4">
              <div class="mb-2">
                <span class="text-xs font-mono text-muted-foreground">Paragraph {pIndex + 1} (ID: {paragraph.id})</span>
              </div>
              
              <div class="space-y-3">
                {#each paragraph.sentences as sentence, sIndex}
                  <div class="bg-gray-50 rounded-lg p-3">
                    <div class="mb-2">
                      <span class="text-xs font-mono text-muted-foreground">
                        Sentence {sIndex + 1} (ID: {sentence.id}) • {sentence.words.length} words
                      </span>
                    </div>
                    
                    <div class="mb-2">
                      <p class="text-sm font-medium text-gray-900">{sentence.text}</p>
                    </div>
                    
                    <div class="flex flex-wrap gap-1">
                      {#each sentence.words as word}
                        <span class="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {typeof word === 'string' ? word : word.rom}
                        </span>
                      {/each}
                    </div>
                  </div>
                {/each}
              </div>
            </div>
          {/each}
        </div>
      </Card.Content>
    </Card.Root>
  {/if}

  {#if parsedLesson}
    <div class="flex justify-end items-center gap-3">
      {#if saveStatus}
        <span class="text-sm text-green-600 font-medium">{saveStatus}</span>
      {/if}
      <Button onclick={saveDocument} variant="default" class="mb-4" disabled={isSaving}>
        {isSaving ? 'Saving...' : (collectionId ? 'Save Document to Collection' : 'Save Document')}
      </Button>
    </div>
    <Card.Root>
      <Card.Header>
        <Card.Title>Readable Lesson Text</Card.Title>
        <Card.Description>
          This is the lesson reconstructed from the parsed data, preserving punctuation and paragraph breaks.
        </Card.Description>
      </Card.Header>
      <Card.Content>
        <div class="font-sans text-base leading-relaxed bg-gray-50 rounded p-4 whitespace-pre-wrap">
  {#each parsedLesson.paragraphs as paragraph, pIdx}
    {#if pIdx > 0}
      <br><br>
    {/if}
    {#each paragraph.text.split(/\n/) as line, lIdx}
      {#if lIdx > 0}
        <br>
        {#each Array(getLeadingSpaces(line)) as _, sIdx}
          <span>&nbsp;</span>
        {/each}
      {/if}
      {#if lIdx === 0}
        <!-- No indentation for first line -->
      {/if}
      {#each line.trim().split(/\s+/) as word, wIdx}
        <span
          class="select-text cursor-text px-0.5" style="text-decoration-line: underline; text-decoration-style: dotted; text-underline-offset: 4px; text-decoration-thickness: 1px; text-decoration-color: #94a3b8;"
          >{word}</span>{wIdx < line.trim().split(/\s+/).length - 1 ? ' ' : ''}
      {/each}
    {/each}
  {/each}
</div>
      </Card.Content>
    </Card.Root>
  {/if}
</div>
