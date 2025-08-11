<script lang="ts">
  import { onMount } from 'svelte';
  import { browser } from '$app/environment';
  import { supabase } from '$lib/supabaseClient';
  import { BarChart3 } from 'lucide-svelte';

  export let lessonId: string;
  export let lesson: any = null; // expects lesson.data.paragraphs structure
  export let languageCode: string = 'ro';
  export let compact: boolean = true;
  export let isHeaderSticky: boolean = false;

  let loading = true;
  let totalTokens = 0;
  let totalTypes = 0;
  let knownTokenCount = 0;
  let knownTypeCount = 0;

  // Derived values
  $: coverageByTokens = totalTokens ? Math.round((knownTokenCount / totalTokens) * 100) : 0;
  $: coverageByTypes = totalTypes ? Math.round((knownTypeCount / totalTypes) * 100) : 0;

  function normalizeWord(w: string): string | null {
    if (!w) return null;
    const stripped = w.toLowerCase().replace(/[\p{P}\p{S}]/gu, '');
    return stripped || null;
  }

  function tokensFromLesson(): string[] {
    const tokens: string[] = [];
    const paragraphs = lesson?.data?.paragraphs || lesson?.content?.paragraphs || [];
    for (const p of paragraphs) {
      const sentences = p?.sentences || [];
      for (const s of sentences) {
        const words = s?.words || [];
        for (const w of words) {
          const raw = w?.rom ?? '';
          const n = normalizeWord(raw);
          if (n) tokens.push(n);
        }
      }
    }
    return tokens;
  }

  async function ensureMetrics() {
    if (!browser || !lessonId) return;

    // 1) Try read precomputed totals
    const { data: statsRow } = await supabase
      .from('lesson_stats')
      .select('total_tokens, total_types')
      .eq('document_id', lessonId)
      .maybeSingle();

    if (!statsRow) {
      // 2) No stats yet: attempt lazy backfill via RPC if lesson content is available
      const toks = tokensFromLesson();
      if (toks.length > 0) {
        await supabase.rpc('upsert_lesson_metrics', {
          p_document_id: lessonId,
          p_language_code: languageCode || 'ro',
          p_tokens: toks
        });
      }
    }

    // 3) Read (or re-read) totals
    const { data: stats } = await supabase
      .from('lesson_stats')
      .select('total_tokens, total_types')
      .eq('document_id', lessonId)
      .maybeSingle();

    totalTokens = stats?.total_tokens ?? 0;
    totalTypes = stats?.total_types ?? 0;

    // 4) Known counts for current user
    const { data: kc } = await supabase.rpc('get_lesson_known_counts', {
      p_document_id: lessonId
    });

    knownTokenCount = kc?.known_token_count ?? 0;
    knownTypeCount = kc?.known_type_count ?? 0;

    loading = false;
  }

  onMount(() => {
    ensureMetrics();
  });
</script>

{#if !loading}
  <div class="flex items-center gap-4 text-sm text-gray-500 transition-all duration-300 ease-in-out {isHeaderSticky ? 'opacity-70' : 'opacity-100'}">
    <div class="flex items-center gap-1">
      <BarChart3 size={14} class="text-gray-400" />
      <span class="hidden sm:inline">{coverageByTokens}%</span>
      <span class="text-xs text-gray-400 sm:hidden">cov</span>
    </div>
    <div class="h-4 w-px bg-gray-200"></div>
    <div class="flex items-center gap-1">
      <span class="hidden sm:inline">{knownTypeCount}/{totalTypes}</span>
      <span class="text-xs text-gray-400">types</span>
    </div>
  </div>
{:else}
  <div class="flex items-center gap-2 text-sm text-gray-400">
    <BarChart3 size={14} class="animate-pulse" />
    <span>Loading metrics…</span>
  </div>
{/if}
