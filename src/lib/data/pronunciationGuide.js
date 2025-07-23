/**
 * Romanian Pronunciation Guide
 * Maps Romanian letters and letter combinations to their phonetic sounds
 */

export const romanianPronunciationGuide = {
  // Special vowels
  'ă': 'uh',
  'â': 'uh', 
  'î': 'ah',
  
  // Regular vowels in specific contexts
  'a': 'ah',
  'e': 'eh',
  'i': 'ee',
  'o': 'oh',
  'u': 'oo',
  
  // Common vowel combinations
  'ai': 'ah-ee',
  'ei': 'ay',
  'oi': 'oy',
  'ui': 'oo-ee',
  'au': 'ah-oo',
  'eu': 'eh-oo',
  'ou': 'oh-oo',
  'ia': 'yah',
  'ie': 'yeh',
  'io': 'yoh',
  'iu': 'yoo',
};

/**
 * Get pronunciation for a Romanian word or letter combination
 * @param {string} text - The Romanian text to get pronunciation for
 * @returns {string|null} - The phonetic pronunciation or null if not found
 */
export function getPronunciation(text) {
  const lowerText = text.toLowerCase();
  return romanianPronunciationGuide[lowerText] || null;
}

/**
 * Find all vowels and vowel combinations in a Romanian word that have pronunciation guides
 * @param {string} word - The Romanian word to analyze
 * @returns {Array} - Array of objects with {text, pronunciation, startIndex, endIndex}
 */
export function findPronunciationMatches(word) {
  const matches = [];
  const lowerWord = word.toLowerCase();
  
  // Sort keys by length (longest first) to match combinations before individual letters
  const sortedKeys = Object.keys(romanianPronunciationGuide).sort((a, b) => b.length - a.length);
  
  let i = 0;
  while (i < lowerWord.length) {
    let matched = false;
    
    // Try to match the longest possible combination first
    for (const key of sortedKeys) {
      if (lowerWord.substring(i, i + key.length) === key) {
        matches.push({
          text: word.substring(i, i + key.length), // Preserve original case
          pronunciation: romanianPronunciationGuide[key],
          startIndex: i,
          endIndex: i + key.length - 1
        });
        i += key.length;
        matched = true;
        break;
      }
    }
    
    if (!matched) {
      i++;
    }
  }
  
  return matches;
}
