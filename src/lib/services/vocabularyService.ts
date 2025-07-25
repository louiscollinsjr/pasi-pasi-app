import { supabase } from '$lib/supabaseClient';

export interface VocabularyWord {
  id: string;
  romanian_word: string;
  eng_translation: string | null;
  known: boolean;
  first_learned_at: string | null;
  updated_at: string;
}

export interface WordTranslation {
  id: string;
  romanian_word: string;
  document_specific_translation: string;
  created_at: string;
  updated_at: string;
}

export class VocabularyService {
  /**
   * Get all vocabulary for the current user
   */
  static async getUserVocabulary(): Promise<VocabularyWord[]> {
    const { data, error } = await supabase
      .from('user_vocabulary')
      .select('*')
      .order('romanian_word');

    if (error) {
      console.error('Error fetching vocabulary:', error);
      return [];
    }

    return data || [];
  }

  /**
   * Get vocabulary for specific words (useful for lesson loading)
   */
  static async getVocabularyForWords(words: string[]): Promise<Record<string, VocabularyWord>> {
    if (words.length === 0) return {};

    const { data, error } = await supabase
      .from('user_vocabulary')
      .select('*')
      .in('romanian_word', words);

    if (error) {
      console.error('Error fetching vocabulary for words:', error);
      return {};
    }

    // Convert to lookup object
    const vocabulary: Record<string, VocabularyWord> = {};
    data?.forEach(word => {
      vocabulary[word.romanian_word] = word;
    });

    return vocabulary;
  }

  /**
   * Get document-specific translations for a lesson
   */
  static async getDocumentTranslations(documentId: string, words: string[]): Promise<Record<string, WordTranslation>> {
    if (words.length === 0) return {};

    const { data, error } = await supabase
      .from('word_translations')
      .select('*')
      .eq('document_id', documentId)
      .in('romanian_word', words);

    if (error) {
      console.error('Error fetching document translations:', error);
      return {};
    }

    // Convert to lookup object
    const translations: Record<string, WordTranslation> = {};
    data?.forEach(translation => {
      translations[translation.romanian_word] = translation;
    });

    return translations;
  }

  /**
   * Mark a word as known with translation (promotes from document-specific to global)
   */
  static async markWordAsKnown(documentId: string, romanianWord: string, engTranslation: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !engTranslation?.trim()) return false;

    // Save to global vocabulary
    const { error: vocabError } = await supabase
      .from('user_vocabulary')
      .upsert({
        user_id: user.id,
        romanian_word: romanianWord,
        eng_translation: engTranslation.trim(),
        known: true,
        first_learned_at: new Date().toISOString()
      }, {
        onConflict: 'user_id,romanian_word'
      });

    if (vocabError) {
      console.error('Error marking word as known:', vocabError);
      return false;
    }

    // Optionally remove from document-specific translations since it's now global
    // (or keep for historical tracking - your choice)
    await supabase
      .from('word_translations')
      .delete()
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .eq('romanian_word', romanianWord);

    return true;
  }

  /**
   * Save or update a document-specific translation
   */
  static async saveDocumentTranslation(documentId: string, romanianWord: string, translation: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !translation?.trim()) return false;

    const { error } = await supabase
      .from('word_translations')
      .upsert({
        user_id: user.id,
        document_id: documentId,
        romanian_word: romanianWord,
        document_specific_translation: translation.trim()
      }, {
        onConflict: 'user_id,document_id,romanian_word'
      });

    if (error) {
      console.error('Error saving document translation:', error);
      return false;
    }

    return true;
  }

  /**
   * Mark word as unknown (removes from known vocabulary)
   */
  static async markWordAsUnknown(romanianWord: string): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('user_vocabulary')
      .delete()
      .eq('user_id', user.id)
      .eq('romanian_word', romanianWord);

    if (error) {
      console.error('Error removing word from vocabulary:', error);
      return false;
    }

    return true;
  }

  /**
   * Extract unique Romanian words from lesson content
   */
  static extractWordsFromLesson(lessonContent: any): string[] {
    const words = new Set<string>();

    if (!lessonContent?.paragraphs) return [];

    lessonContent.paragraphs.forEach((paragraph: any) => {
      paragraph.sentences?.forEach((sentence: any) => {
        sentence.words?.forEach((word: any) => {
          if (word.rom && word.rom.trim()) {
            // Normalize word (remove punctuation, lowercase)
            const normalizedWord = word.rom.toLowerCase().replace(/[.,!?;:"'()]/g, '');
            if (normalizedWord) {
              words.add(normalizedWord);
            }
          }
        });
      });
    });

    return Array.from(words);
  }
}
