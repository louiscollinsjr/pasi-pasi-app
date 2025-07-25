-- Migration: Rename document_specific_translation to translation
-- Created: 2025-07-26T01:12:02+03:00

BEGIN;

-- Add new translation column
ALTER TABLE word_translations
ADD COLUMN translation TEXT;

-- Backfill data from document_specific_translation
UPDATE word_translations SET
  translation = document_specific_translation;

-- Set not null
ALTER TABLE word_translations
ALTER COLUMN translation SET NOT NULL;

-- Drop old column
ALTER TABLE word_translations
DROP COLUMN document_specific_translation;

COMMIT;
