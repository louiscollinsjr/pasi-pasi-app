import { ro_en_rules } from './ro-en';
import { ro_fr_rules } from './ro-fr';
import type { PronunciationRule, PronunciationMatch } from './types';

const guides: Record<string, PronunciationRule[]> = {
  en: ro_en_rules,
  fr: ro_fr_rules,
};

export function getPronunciationRules(nativeLang: string = 'en'): PronunciationRule[] {
  return guides[nativeLang] || guides['en'];
}

export function findPronunciationMatches(word: string, rules: PronunciationRule[]): PronunciationMatch[] {
  const matches: PronunciationMatch[] = [];
  const lowerWord = word.toLowerCase();
  
  const sortedRules = [...rules].sort((a, b) => b.pattern.length - a.pattern.length);

  let i = 0;
  while (i < lowerWord.length) {
    let matched = false;
    for (const rule of sortedRules) {
      if (lowerWord.startsWith(String(rule.pattern), i)) {
        const patternStr = String(rule.pattern);
        matches.push({
          text: word.substring(i, i + patternStr.length),
          pronunciation: rule.phoneme,
          explanation: rule.explanation,
          startIndex: i,
          endIndex: i + patternStr.length - 1
        });
        i += patternStr.length;
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

export * from './types';
