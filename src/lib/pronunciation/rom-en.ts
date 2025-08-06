import type { PronunciationRule } from './types';

// --- Romani to English Pronunciation Guide (Vlax Dialect) ---
//
// This file provides pronunciation rules for native English speakers learning Romani.
// It is based on the common Vlax Romani orthography, which is largely phonetic.
// Unlike English, letters in Romani almost always represent a single, consistent sound.
//
// NOTE: The order of these rules is important. Longer patterns (like 'čh') must
// come before shorter ones (like 'č' or 'h') to be matched correctly.

export const rm_en_rules: PronunciationRule[] = [
  // --- Aspirated Consonants (Digraphs) ---
  // These are crucial and distinct from their non-aspirated counterparts.
  // Aspiration is the strong puff of air that follows the sound.
  { pattern: 'čh', phoneme: 'ch-h', explanation: "like 'ch' in 'church', but with a strong puff of air (aspirated)" },
  { pattern: 'kh', phoneme: 'k-h', explanation: "like 'k' in 'key', but with a strong puff of air; similar to the 'c-h' in 'back-hand'" },
  { pattern: 'ph', phoneme: 'p-h', explanation: "like 'p' in 'pot', but with a strong puff of air; similar to the 'p-h' in 'uphill'" },
  { pattern: 'th', phoneme: 't-h', explanation: "like 't' in 'top', but with a strong puff of air; similar to 't-h' in 'anthill'. IMPORTANT: Never like 'th' in 'the' or 'thin'" },

  // --- Other Consonant Combinations (Digraphs) ---
  { pattern: 'dž', phoneme: 'j', explanation: "like 'j' in 'judge' or 'g' in 'gem'" },

  // --- Special Single Consonants ---
  // These have pronunciations that are not obvious to English speakers.
  { pattern: 'č', phoneme: 'ch', explanation: "like 'ch' in 'church' (unaspirated, no puff of air)" },
  { pattern: 'š', phoneme: 'sh', explanation: "like 'sh' in 'shoe'" },
  { pattern: 'ž', phoneme: 'zh', explanation: "like the 's' in 'treasure' or the 'g' in 'beige'" },
  { pattern: 'c', phoneme: 'ts', explanation: "like 'ts' in 'cats' or 'pizza'" },
  { pattern: 'j', phoneme: 'y', explanation: "like 'y' in 'yes' or 'yellow'" },
  { pattern: 'r', phoneme: 'rr', explanation: "a rolled or tapped 'r', as in Spanish 'pero' or Scottish English" },
  { pattern: 'x', phoneme: 'kh', explanation: "a guttural sound from the back of the throat, like the 'ch' in Scottish 'loch' or German 'Bach'" },

  // --- Vowels (Simple and Consistent) ---
  // Romani vowels are pure and do not glide like many English vowels.
  { pattern: 'a', phoneme: 'ah', explanation: "like 'a' in 'father' or 'spa'" },
  { pattern: 'e', phoneme: 'eh', explanation: "like 'e' in 'bet' or 'met'" },
  { pattern: 'i', phoneme: 'ee', explanation: "like 'ee' in 'see' or 'machine'" },
  { pattern: 'o', phoneme: 'oh', explanation: "like 'o' in 'go' or 'boat'" },
  { pattern: 'u', phoneme: 'oo', explanation: "like 'oo' in 'moon' or 'flute'" },

  // --- Standard Consonants (mostly as in English) ---
  // Included for completeness.
//   { pattern: 'b', phoneme: 'b', explanation: "like 'b' in 'bed'" },
//   { pattern: 'd', phoneme: 'd', explanation: "like 'd' in 'dog'" },
//   { pattern: 'f', phoneme: 'f', explanation: "like 'f' in 'fish'" },
//   { pattern: 'g', phoneme: 'g', explanation: "like 'g' in 'go' (always hard, never like in 'gem')" },
//   { pattern: 'h', phoneme: 'h', explanation: "like 'h' in 'hat'" },
//   { pattern: 'k', phoneme: 'k', explanation: "like 'k' in 'king' (unaspirated, no puff of air)" },
//   { pattern: 'l', phoneme: 'l', explanation: "like 'l' in 'love'" },
//   { pattern: 'm', phoneme: 'm', explanation: "like 'm' in 'man'" },
//   { pattern: 'n', phoneme: 'n', explanation: "like 'n' in 'no'" },
//   { pattern: 'p', phoneme: 'p', explanation: "like 'p' in 'spy' (unaspirated, no puff of air)" },
//   { pattern: 's', phoneme: 's', explanation: "like 's' in 'see' (never like 'z')" },
//   { pattern: 't', phoneme: 't', explanation: "like 't' in 'stop' (unaspirated, no puff of air)" },
//   { pattern: 'v', phoneme: 'v', explanation: "like 'v' in 'vest'" },
//   { pattern: 'z', phoneme: 'z', explanation: "like 'z' in 'zoo'" }
];