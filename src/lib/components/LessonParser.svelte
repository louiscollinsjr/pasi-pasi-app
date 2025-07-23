<script lang="ts">
  import { parseLesson, type ParsedLesson, reconstructLesson } from '$lib/utils/parseLesson';
  import Button from '$lib/components/ui/button/button.svelte';
  import * as Card from '$lib/components/ui/card/index';
  import { Textarea } from '$lib/components/ui/textarea/index';

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

  function enrichParsedLesson(parsedLesson: ParsedLesson) {
    for (const paragraph of parsedLesson.paragraphs) {
      for (const sentence of paragraph.sentences) {
        // If you have parallel arrays for eng/decode, align them here; fallback to empty string if not available
        sentence.words = sentence.words.map((word: string, i: number) => ({
          rom: word,
          eng: sentence.eng ? sentence.eng[i] : '',
          decode: sentence.decode ? sentence.decode[i] : '',
          userInput: '',
          aiTranslation: sentence.decode ? sentence.decode[i] : '',
          known: false
        }));
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

  function saveLesson() {
    if (!parsedLesson) return;
    localStorage.removeItem('pasi_lessons'); // Clear old lessons
    const lessons = [];
    const meta = {
      id: `${Date.now()}_${Math.random().toString(36).slice(2, 8)}`,
      title: parsedLesson.title,
      date: new Date().toISOString(),
      data: parsedLesson
    };
    lessons.push(meta);
    localStorage.setItem('pasi_lessons', JSON.stringify(lessons));
    alert('Lesson saved!');
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
                          {word}
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
    <div class="flex justify-end">
      <Button onclick={saveLesson} variant="default" class="mb-4">
        Save Lesson
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
