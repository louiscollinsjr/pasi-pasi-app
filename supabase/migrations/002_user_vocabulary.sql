-- Create user vocabulary table for global word knowledge
CREATE TABLE user_vocabulary (
  id UUID DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL,
  romanian_word TEXT NOT NULL,
  eng_translation TEXT,
  known BOOLEAN DEFAULT false,
  first_learned_at TIMESTAMPTZ,
  updated_at TIMESTAMPTZ DEFAULT NOW(),
  created_at TIMESTAMPTZ DEFAULT NOW(),
  
  UNIQUE(user_id, romanian_word)
);

-- Indexes for efficient lookups
CREATE INDEX idx_user_vocabulary_user_id ON user_vocabulary(user_id);
CREATE INDEX idx_user_vocabulary_user_word ON user_vocabulary(user_id, romanian_word);
CREATE INDEX idx_user_vocabulary_known ON user_vocabulary(user_id, known);

-- RLS policies
ALTER TABLE user_vocabulary ENABLE ROW LEVEL SECURITY;

-- Users can only access their own vocabulary
CREATE POLICY "Users can view own vocabulary" ON user_vocabulary
  FOR SELECT USING (auth.uid() = user_id);

CREATE POLICY "Users can insert own vocabulary" ON user_vocabulary
  FOR INSERT WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update own vocabulary" ON user_vocabulary
  FOR UPDATE USING (auth.uid() = user_id);

CREATE POLICY "Users can delete own vocabulary" ON user_vocabulary
  FOR DELETE USING (auth.uid() = user_id);

-- Trigger to update updated_at timestamp
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_user_vocabulary_updated_at 
  BEFORE UPDATE ON user_vocabulary 
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
