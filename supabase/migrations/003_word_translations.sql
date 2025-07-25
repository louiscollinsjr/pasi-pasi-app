-- Create word_translations table for document-specific translations
CREATE TABLE word_translations (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  document_id UUID REFERENCES documents(id) ON DELETE CASCADE NOT NULL,
  romanian_word TEXT NOT NULL,
  document_specific_translation TEXT NOT NULL,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, document_id, romanian_word)
);

-- Indexes for efficient lookups
CREATE INDEX idx_word_translations_user_document ON word_translations(user_id, document_id);
CREATE INDEX idx_word_translations_user_word ON word_translations(user_id, romanian_word);

-- RLS policies
ALTER TABLE word_translations ENABLE ROW LEVEL SECURITY;

-- Users can only access their own word translations
CREATE POLICY "Users can view own word translations" ON word_translations
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own word translations" ON word_translations
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own word translations" ON word_translations
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own word translations" ON word_translations
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE TRIGGER update_word_translations_updated_at 
  BEFORE UPDATE ON word_translations 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
