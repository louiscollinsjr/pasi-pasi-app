-- Migration: Enhance word_translations table for multi-language support
-- Created: 2025-07-26T00:59:01+03:00

BEGIN;

-- Add new columns
ALTER TABLE word_translations
ADD COLUMN original_word TEXT NOT NULL DEFAULT '',
ADD COLUMN normalized_word TEXT NOT NULL DEFAULT '',
ADD COLUMN language_code TEXT NOT NULL DEFAULT 'ro',
ADD COLUMN context TEXT,
ADD COLUMN status TEXT NOT NULL DEFAULT 'confirmed' CHECK (status IN ('pending', 'confirmed', 'rejected')),
ADD COLUMN confidence_score FLOAT DEFAULT 1.0;

-- Backfill data from existing romanian_word column
UPDATE word_translations SET
  original_word = romanian_word,
  normalized_word = LOWER(TRIM(romanian_word)),
  language_code = 'ro';

-- Create new index
CREATE INDEX IF NOT EXISTS idx_word_translations_normalized_word 
  ON public.word_translations USING btree (normalized_word);

-- Drop old unique constraint and create new one
ALTER TABLE word_translations
DROP CONSTRAINT word_translations_user_id_document_id_romanian_word_key,
ADD CONSTRAINT word_translations_user_id_document_id_normalized_word_lang_key 
  UNIQUE (user_id, document_id, normalized_word, language_code);

-- Drop old column
ALTER TABLE word_translations DROP COLUMN romanian_word;

-- Update existing indexes to use normalized_word
DROP INDEX IF EXISTS idx_word_translations_user_word;
CREATE INDEX IF NOT EXISTS idx_word_translations_user_word 
  ON public.word_translations USING btree (user_id, normalized_word, language_code);

COMMIT;