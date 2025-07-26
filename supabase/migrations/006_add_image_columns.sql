-- Migration: Add image columns to collections and documents
-- Created: 2025-07-26T15:32:26+03:00

BEGIN;

-- Add image_url column to collections table
ALTER TABLE collections
ADD COLUMN image_url TEXT;

-- Add image_url column to documents table  
ALTER TABLE documents
ADD COLUMN image_url TEXT;

-- Add description column to collections for better gallery display
-- ALTER TABLE collections
-- ADD COLUMN description TEXT;

-- Add description column to documents for better gallery display
ALTER TABLE documents
ADD COLUMN description TEXT;

COMMIT;
