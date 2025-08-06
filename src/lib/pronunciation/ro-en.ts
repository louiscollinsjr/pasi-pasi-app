import type { PronunciationRule } from './types';

// Pronunciation rules for native English speakers learning Romanian.
export const ro_en_rules: PronunciationRule[] = [
  // Vowel combinations first
  { pattern: 'ai', phoneme: 'ah-ee', explanation: "like 'eye'" },
  { pattern: 'ei', phoneme: 'ay', explanation: "like 'hay'" },
  { pattern: 'oi', phoneme: 'oy', explanation: "like 'boy'" },
  { pattern: 'ui', phoneme: 'oo-ee', explanation: "like gooey, but faster" },
  { pattern: 'au', phoneme: 'ah-oo', explanation: "like 'ow' in 'cow'" },
  { pattern: 'eu', phoneme: 'eh-oo', explanation: "a quick 'eh' followed by 'oo'" },
  { pattern: 'ou', phoneme: 'oh-oo', explanation: "like 'oh'" },
  { pattern: 'ia', phoneme: 'yah', explanation: "like 'ya' in 'yard'" },
  { pattern: 'ie', phoneme: 'yeh', explanation: "like 'ye' in 'yes'" },
  { pattern: 'io', phoneme: 'yoh', explanation: "like 'yo' in 'yonder'" },
  { pattern: 'iu', phoneme: 'yoo', explanation: "like the word 'you'" },

  // Special Romanian vowels
  { pattern: 'ă', phoneme: 'uh', explanation: "like 'a' in 'about' (schwa sound)" },
  { pattern: 'â', phoneme: 'uh', explanation: "a guttural 'uh', similar to 'î'" },
  { pattern: 'î', phoneme: 'uh', explanation: "a guttural 'uh', from the back of the throat" },

  // Regular vowels
  { pattern: 'a', phoneme: 'ah', explanation: "like 'a' in 'father'" },
  { pattern: 'e', phoneme: 'eh', explanation: "like 'e' in 'bet'" },
  { pattern: 'i', phoneme: 'ee', explanation: "like 'ee' in 'see'" },
  { pattern: 'o', phoneme: 'oh', explanation: "like 'o' in 'go'" },
  { pattern: 'u', phoneme: 'oo', explanation: "like 'oo' in 'moon'" }
];
