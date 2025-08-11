-- 010_precompute_lesson_metrics.sql
-- Precompute per-lesson metrics and per-word counts
-- - Stores total token and unique type counts per document
-- - Stores per-word occurrence counts per document
-- - Adds normalization helper, upsert function, and helper RPC to compute known counts for the current user
-- - Enforces RLS by tying access to the owning document's user_id

BEGIN;

-- Ensure helpful extensions are available
CREATE EXTENSION IF NOT EXISTS unaccent;

-- Table: lesson_stats (one row per document)
CREATE TABLE IF NOT EXISTS public.lesson_stats (
  document_id UUID PRIMARY KEY REFERENCES public.documents(id) ON DELETE CASCADE,
  total_tokens INTEGER NOT NULL DEFAULT 0,
  total_types INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Table: lesson_word_counts (per-document, per-normalized-word counts)
CREATE TABLE IF NOT EXISTS public.lesson_word_counts (
  document_id UUID NOT NULL REFERENCES public.documents(id) ON DELETE CASCADE,
  normalized_word TEXT NOT NULL,
  occurrence_count INTEGER NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  CONSTRAINT lesson_word_counts_pkey PRIMARY KEY (document_id, normalized_word)
);

-- Indexes
CREATE INDEX IF NOT EXISTS idx_lwc_document_id ON public.lesson_word_counts(document_id);
CREATE INDEX IF NOT EXISTS idx_lwc_normalized_word ON public.lesson_word_counts(normalized_word);

-- Updated_at trigger helper (reuse if already exists)
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_lesson_stats_updated_at ON public.lesson_stats;
CREATE TRIGGER trg_lesson_stats_updated_at
  BEFORE UPDATE ON public.lesson_stats
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

DROP TRIGGER IF EXISTS trg_lesson_word_counts_updated_at ON public.lesson_word_counts;
CREATE TRIGGER trg_lesson_word_counts_updated_at
  BEFORE UPDATE ON public.lesson_word_counts
  FOR EACH ROW EXECUTE FUNCTION public.update_updated_at_column();

-- RLS
ALTER TABLE public.lesson_stats ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.lesson_word_counts ENABLE ROW LEVEL SECURITY;

-- Users can see/modify only rows tied to their own documents
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lesson_stats' AND policyname = 'Users can view own lesson_stats'
  ) THEN
    CREATE POLICY "Users can view own lesson_stats" ON public.lesson_stats
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = lesson_stats.document_id AND d.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lesson_stats' AND policyname = 'Users can modify own lesson_stats'
  ) THEN
    CREATE POLICY "Users can modify own lesson_stats" ON public.lesson_stats
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = lesson_stats.document_id AND d.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = lesson_stats.document_id AND d.user_id = auth.uid()
        )
      );
  END IF;

  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lesson_word_counts' AND policyname = 'Users can view own lesson_word_counts'
  ) THEN
    CREATE POLICY "Users can view own lesson_word_counts" ON public.lesson_word_counts
      FOR SELECT USING (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = lesson_word_counts.document_id AND d.user_id = auth.uid()
        )
      );
  END IF;
  IF NOT EXISTS (
    SELECT 1 FROM pg_policies WHERE schemaname = 'public' AND tablename = 'lesson_word_counts' AND policyname = 'Users can modify own lesson_word_counts'
  ) THEN
    CREATE POLICY "Users can modify own lesson_word_counts" ON public.lesson_word_counts
      FOR ALL USING (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = lesson_word_counts.document_id AND d.user_id = auth.uid()
        )
      ) WITH CHECK (
        EXISTS (
          SELECT 1 FROM public.documents d
          WHERE d.id = lesson_word_counts.document_id AND d.user_id = auth.uid()
        )
      );
  END IF;
END $$;

-- Normalization helper: lower + unaccent + strip punctuation
CREATE OR REPLACE FUNCTION public.normalize_word_db(w TEXT, lang TEXT DEFAULT 'ro')
RETURNS TEXT
LANGUAGE sql
AS $$
  SELECT NULLIF(
    regexp_replace(
      lower(unaccent(coalesce(w, ''))),
      '[[:punct:]]+',
      '',
      'g'
    ),
    ''
  );
$$;

-- Upsert function to precompute metrics for a document
-- Security: definer, with ownership check on the target document
CREATE OR REPLACE FUNCTION public.upsert_lesson_metrics(
  p_document_id UUID,
  p_language_code TEXT,
  p_tokens TEXT[]
) RETURNS VOID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  _owner UUID;
BEGIN
  -- Ownership check
  SELECT d.user_id INTO _owner FROM public.documents d WHERE d.id = p_document_id;
  IF _owner IS NULL OR _owner <> auth.uid() THEN
    RAISE EXCEPTION 'Not authorized to update metrics for this document';
  END IF;

  -- Build normalized token set and counts
  WITH norm AS (
    SELECT public.normalize_word_db(t, p_language_code) AS w
    FROM unnest(p_tokens) AS t
  ), filtered AS (
    SELECT w FROM norm WHERE w IS NOT NULL AND w <> ''
  ), counts AS (
    SELECT w AS normalized_word, COUNT(*)::int AS cnt
    FROM filtered
    GROUP BY w
  )
  -- Upsert per-word counts
  INSERT INTO public.lesson_word_counts(document_id, normalized_word, occurrence_count)
  SELECT p_document_id, c.normalized_word, c.cnt FROM counts c
  ON CONFLICT (document_id, normalized_word)
  DO UPDATE SET occurrence_count = EXCLUDED.occurrence_count,
                updated_at = NOW();

  -- Upsert aggregate stats
  INSERT INTO public.lesson_stats(document_id, total_tokens, total_types)
  SELECT p_document_id,
         (SELECT COUNT(*) FROM filtered),
         (SELECT COUNT(*) FROM counts)
  ON CONFLICT (document_id)
  DO UPDATE SET total_tokens = EXCLUDED.total_tokens,
                total_types = EXCLUDED.total_types,
                updated_at = NOW();
END;
$$;

-- Helper RPC: known counts for current user on a document
CREATE OR REPLACE FUNCTION public.get_lesson_known_counts(p_document_id UUID)
RETURNS TABLE(known_token_count INTEGER, known_type_count INTEGER)
LANGUAGE sql
SECURITY INVOKER
AS $$
  SELECT
    COALESCE(SUM(lwc.occurrence_count), 0)::int AS known_token_count,
    COALESCE(COUNT(lwc.normalized_word), 0)::int AS known_type_count
  FROM public.lesson_word_counts lwc
  JOIN public.user_vocabulary uv
    ON uv.user_id = auth.uid()
   AND uv.known = true
   AND uv.romanian_word = lwc.normalized_word
  WHERE lwc.document_id = p_document_id;
$$;

-- Function execution grants (001 revoked default EXECUTE on functions from PUBLIC)
GRANT EXECUTE ON FUNCTION public.upsert_lesson_metrics(UUID, TEXT, TEXT[]) TO authenticated, service_role;
GRANT EXECUTE ON FUNCTION public.get_lesson_known_counts(UUID) TO authenticated, service_role;

COMMIT;
