-- Migration: Add language_code to the documents table
-- This will store the ISO 639-1 code for the content's language.

BEGIN;

ALTER TABLE public.documents
ADD COLUMN language_code VARCHAR(5) NOT NULL DEFAULT 'ro';

-- Add a comment to describe the column's purpose
COMMENT ON COLUMN public.documents.language_code IS 'ISO 639-1 language code of the document content (e.g., ro, en, fr).';

-- We default to 'ro' since the app is currently Romanian-focused.
-- This ensures all existing documents are correctly tagged without breaking anything.

COMMIT;