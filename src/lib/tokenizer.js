/**
 * Romanian text tokenizer that splits text by whitespace and punctuation
 */

export function tokenizeRomanian(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split by whitespace and common punctuation, keeping the delimiters
  const tokens = text
    .trim()
    .split(/(\s+|[.,;:!?()[\]{}""„"«»—–-])/)
    .filter(token => token.trim().length > 0)
    .map(token => token.trim());

  return tokens;
}

export function splitIntoSentences(text) {
  if (!text || typeof text !== 'string') {
    return [];
  }

  // Split by sentence-ending punctuation
  const sentences = text
    .split(/[.!?]+/)
    .map(sentence => sentence.trim())
    .filter(sentence => sentence.length > 0);

  return sentences;
}

export function alignWords(romanianWords, decodeWords, englishWords = []) {
  const maxLength = Math.max(
    romanianWords.length,
    decodeWords.length,
    englishWords.length
  );

  const aligned = [];
  for (let i = 0; i < maxLength; i++) {
    aligned.push({
      rom: romanianWords[i] || '',
      decode: decodeWords[i] || '',
      eng: englishWords[i] || '',
      status: 'unknown' // unknown, known, blank
    });
  }

  return aligned;
}
