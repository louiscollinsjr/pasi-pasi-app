import { supabase } from '$lib/supabaseClient';
import { VocabularyService } from '$lib/services/vocabularyService';
import type { PageLoad } from './$types';

export const load: PageLoad = async ({ params }) => {
  const { id } = params;

  try {
    // Fetch lesson data with collection information
    const { data, error } = await supabase
      .from('documents')
      .select(`
        *,
        collection:collections(
          id,
          title
        )
      `)
      .eq('id', id)
      .single();

    if (error) {
      throw new Error('Lesson not found');
    }

    if (!data) {
      throw new Error('Lesson data is null');
    }

    // Validate lesson content structure
    if (typeof data.content !== 'object' || data.content === null || !Array.isArray(data.content.paragraphs)) {
      throw new Error('Invalid lesson content structure');
    }

    // Extract words from lesson content and fetch both global vocabulary and document translations
    const wordsInLesson = VocabularyService.extractWordsFromLesson(data.content);

    // Return early if no words found
    if (!wordsInLesson || wordsInLesson.length === 0) {
      return {
        lesson: data,
        collection: data.collection,
        vocabulary: {},
        documentTranslations: {},
        lessonMetrics: {
          totalWords: 0,
          knownWords: 0,
          comprehensionRate: 0
        }
      };
    }

    // Helper function to normalize words
    function normalizeWord(word: string): string {
      return word.toLowerCase().replace(/[.,!?;:"'()]/g, '');
    }

    const normalizedWordsInLesson = wordsInLesson.map(normalizeWord);

    const [vocabulary, documentTranslations] = await Promise.all([
      VocabularyService.getVocabularyForWords(wordsInLesson),
      VocabularyService.getDocumentTranslations(data.id, normalizedWordsInLesson)
    ]);

    // Calculate lesson metrics
    const totalWords = wordsInLesson.length;
    const knownWords = wordsInLesson.filter(word => {
      const normalized = normalizeWord(word);
      return vocabulary[normalized]?.known;
    }).length;
    const comprehensionRate = totalWords > 0 ? Math.round((knownWords / totalWords) * 100) : 0;

    return {
      lesson: data,
      collection: data.collection,
      vocabulary,
      documentTranslations,
      lessonMetrics: {
        totalWords,
        knownWords,
        comprehensionRate
      },
      error: null
    };
  } catch (error) {
    return { lesson: null, collection: null, vocabulary: {}, documentTranslations: {}, error: error.message };
  }
};
