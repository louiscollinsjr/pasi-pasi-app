/**
 * Sentence processing utilities for the Romanian language learning app
 */

import { tokenizeRomanian, alignWords } from './tokenizer.js';

export function processSentence(romanianText, decodeText = '', englishText = '') {
  const romanianWords = tokenizeRomanian(romanianText);
  const decodeWords = decodeText ? tokenizeRomanian(decodeText) : [];
  const englishWords = englishText ? tokenizeRomanian(englishText) : [];

  return {
    id: generateSentenceId(),
    romanian: romanianText,
    decode: decodeText,
    english: englishText,
    words: alignWords(romanianWords, decodeWords, englishWords),
    createdAt: new Date().toISOString(),
    lastModified: new Date().toISOString()
  };
}

export function updateSentenceWord(sentence, wordIndex, field, value) {
  if (!sentence.words[wordIndex]) {
    return sentence;
  }

  const updatedSentence = {
    ...sentence,
    words: sentence.words.map((word, index) => {
      if (index === wordIndex) {
        return { ...word, [field]: value };
      }
      return word;
    }),
    lastModified: new Date().toISOString()
  };

  return updatedSentence;
}

export function markWordStatus(sentence, wordIndex, status) {
  return updateSentenceWord(sentence, wordIndex, 'status', status);
}

export function updateWordDecode(sentence, wordIndex, decode) {
  return updateSentenceWord(sentence, wordIndex, 'decode', decode);
}

export function generateSentenceId() {
  return 'sentence_' + Date.now() + '_' + Math.random().toString(36).substr(2, 9);
}

export function calculateProgress(sentences) {
  if (!sentences || sentences.length === 0) {
    return { total: 0, known: 0, unknown: 0, blank: 0, percentage: 0 };
  }

  let totalWords = 0;
  let knownWords = 0;
  let unknownWords = 0;
  let blankWords = 0;

  sentences.forEach(sentence => {
    sentence.words.forEach(word => {
      if (word.rom.trim()) { // Only count actual words, not punctuation
        totalWords++;
        switch (word.status) {
          case 'known':
            knownWords++;
            break;
          case 'unknown':
            unknownWords++;
            break;
          default:
            blankWords++;
        }
      }
    });
  });

  return {
    total: totalWords,
    known: knownWords,
    unknown: unknownWords,
    blank: blankWords,
    percentage: totalWords > 0 ? Math.round((knownWords / totalWords) * 100) : 0
  };
}
