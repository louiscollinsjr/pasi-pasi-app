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
  original_word: string;
  normalized_word: string;
  translation: string;
  language_code: string;
  status: string;
  created_at: string;
  updated_at: string;
  occurrence_ids?: string[] | null;
  context_left?: string | null;
  context_right?: string | null;
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
    
    // Normalize words for lookup
    const normalizedWords = words.map((word) =>
      word.toLowerCase().replace(/[\p{P}\p{S}]/gu, '')
    );
    
    const { data, error } = await supabase
      .from('word_translations')
      .select('*')
      .eq('document_id', documentId)
      .in('normalized_word', normalizedWords);

    if (error) {
      console.error('Error fetching document translations:', error);
      return {};
    }

    // Create lookup by normalized word
    const translations: Record<string, WordTranslation> = {};
    data.forEach((translation: any) => {
      translations[translation.normalized_word] = translation as WordTranslation;
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
      .eq('normalized_word', romanianWord);

    return true;
  }

  /** Delete an entire document-specific translation row for a word */
  static async deleteDocumentTranslation(
    documentId: string,
    normalizedWord: string,
    languageCode: string = 'ro'
  ): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { error } = await supabase
      .from('word_translations')
      .delete()
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .eq('normalized_word', normalizedWord)
      .eq('language_code', languageCode);

    if (error) {
      console.error('Error deleting document translation:', error);
      return false;
    }
    return true;
  }

  /**
   * Save or update a document-specific translation
   */
  static async saveDocumentTranslation(
    documentId: string,
    originalWord: string,
    normalizedWord: string,
    translation: string,
    languageCode: string = 'ro',
    occurrenceId?: string,
    contextLeft?: string,
    contextRight?: string
  ): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user || !translation?.trim()) return false;

    // Fetch existing row to merge occurrence_ids
    const { data: existingRows, error: fetchError } = await supabase
      .from('word_translations')
      .select('id, occurrence_ids')
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .eq('normalized_word', normalizedWord)
      .eq('language_code', languageCode)
      .limit(1);

    if (fetchError) {
      console.error('Error reading existing translation:', fetchError);
    }

    const existing = existingRows?.[0] as { id?: string; occurrence_ids?: string[] } | undefined;
    const mergedOccurrenceIds = Array.from(
      new Set([...(existing?.occurrence_ids ?? []), ...(occurrenceId ? [occurrenceId] : [])])
    );

    const payload: any = {
      user_id: user.id,
      document_id: documentId,
      original_word: originalWord,
      normalized_word: normalizedWord,
      translation: translation.trim(),
      language_code: languageCode,
      status: 'confirmed',
      occurrence_ids: mergedOccurrenceIds,
    };
    if (contextLeft !== undefined) payload.context_left = contextLeft;
    if (contextRight !== undefined) payload.context_right = contextRight;

    console.log('[VocabularyService.saveDocumentTranslation] upsert payload', {
      normalizedWord,
      occurrenceId,
      mergedOccurrenceIds,
      hasExisting: !!existing,
    });

    const { data: upserted, error } = await supabase
      .from('word_translations')
      .upsert(payload, {
        onConflict: 'user_id,document_id,normalized_word,language_code'
      })
      .select('id, occurrence_ids')
      .limit(1);

    if (error) {
      console.error('Error saving document translation:', error);
      return false;
    }

    console.log('[VocabularyService.saveDocumentTranslation] upsert success', upserted);
    return true;
  }

  /** Remove a specific occurrence from a document translation. If none left, keep the row (no inline display) */
  static async removeOccurrenceFromDocumentTranslation(
    documentId: string,
    normalizedWord: string,
    occurrenceId: string,
    languageCode: string = 'ro'
  ): Promise<boolean> {
    const { data: { user } } = await supabase.auth.getUser();
    if (!user) return false;

    const { data, error } = await supabase
      .from('word_translations')
      .select('id, occurrence_ids')
      .eq('user_id', user.id)
      .eq('document_id', documentId)
      .eq('normalized_word', normalizedWord)
      .eq('language_code', languageCode)
      .limit(1)
      .maybeSingle();

    if (error) {
      console.error('Error fetching for removal:', error);
      return false;
    }

    const current = (data?.occurrence_ids ?? []) as string[];
    const next = current.filter((id) => id !== occurrenceId);

    const { error: updateError } = await supabase
      .from('word_translations')
      .update({ occurrence_ids: next })
      .eq('id', data?.id);

    if (updateError) {
      console.error('Error removing occurrence id:', updateError);
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
            // Normalize word (remove all Unicode punctuation/symbols, lowercase)
            const normalizedWord = word.rom.toLowerCase().replace(/[\p{P}\p{S}]/gu, '');
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
