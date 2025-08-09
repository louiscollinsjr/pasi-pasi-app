import type { PronunciationRule } from './types';

// Exceptions to initial 'e' -> 'ye' (names/foreign origins)
const exceptions = ['eva', 'elena', 'emanuel', 'erasmus', 'europa'];
const exceptionRegex = new RegExp(`\\be(?!(${exceptions.join('|')})\\b)`);

// Pronunciation rules for native English speakers learning Romanian.
export const ro_en_rules: PronunciationRule[] = [
  // Vowel combinations first
  { pattern: 'ai', phoneme: 'eye', explanation: "like 'eye'" },
  { pattern: 'ei', phoneme: 'yay', explanation: "like 'say'" },
  { pattern: 'oi', phoneme: 'oy', explanation: "like 'boy'" },
  { pattern: 'ui', phoneme: 'wee', explanation: "like 'week', but faster" }, // 'oo-ee' feels clunky
  { pattern: 'au', phoneme: 'ow', explanation: "like 'cow'" },
  { pattern: 'eu', phoneme: 'eh-oo', explanation: "like 'eh-oo' quickly blended" }, // keep original?
  { pattern: 'ou', phoneme: 'oh', explanation: "like 'go'" }, // 'oh-oo' isn't how it's said
  { pattern: 'ia', phoneme: 'ya', explanation: "like 'ya' in 'yard'" },
  { pattern: 'ie', phoneme: 'yeh', explanation: "like 'ye' in 'yes'" },
  { pattern: 'io', phoneme: 'yo', explanation: "like 'yo' in 'yogurt'" },
  { pattern: 'iu', phoneme: 'you', explanation: "like the word 'you'" },

  // Word-initial behaviors
  // Many native Romanian words beginning with 'e' sound like English 'ye' (e.g., 'este' ≈ 'yeste').
  // Exceptions: names/foreign words like 'Eva', 'Elena' retain plain 'eh'.
  { pattern: exceptionRegex, phoneme: 'ye', explanation: "like 'yes' — appears at the beginning of many words; not for names/foreign origins (e.g., 'Eva', 'Elena', 'Emanuel', 'Erasmus', 'Europa')" },

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


// future make sure only regex lowercase words word.toLowerCase().match(rule.pattern)