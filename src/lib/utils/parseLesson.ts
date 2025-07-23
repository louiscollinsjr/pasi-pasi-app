export type ParsedLesson = {
  title: string;
  paragraphs: {
    id: string;            // unique ID
    text: string;          // full paragraph
    sentences: {
      id: string;          // unique ID
      text: string;        // sentence
      words: string[];     // tokenized words
    }[]
  }[]
}

/**
 * Generates a simple hash-based ID from a string
 */
function generateId(text: string, index: number): string {
  const hash = text.split('').reduce((a, b) => {
    a = ((a << 5) - a) + b.charCodeAt(0);
    return a & a;
  }, 0);
  return `${Math.abs(hash).toString(36)}-${index}`;
}

/**
 * Splits text into sentences based on Romanian punctuation
 */
function splitIntoSentences(text: string): string[] {
  // Match sentences ending with . ? ! or … (ellipsis), keeping the punctuation
  const regex = /[^.!?…]+[.!?…]+(?:\s+|$)|[^.!?…]+$/g;
  return (text.match(regex) || []).map(s => s.trim()).filter(Boolean);
}

/**
 * Tokenizes a sentence into words, removing punctuation
 */
function tokenizeWords(sentence: string): string[] {
  // Allow hyphens and apostrophes inside words, don't split on them
  // Keep Romanian diacritics: ă, â, î, ș, ț
  const cleanText = sentence.replace(/[^\w\săâîșțĂÂÎȘȚ'-]/g, '');
  return cleanText
    .split(/\s+/)
    .map(word => word.trim())
    .filter(word => word.length > 0);
}

/**
 * Extracts title from the first line or first sentence
 */
function extractTitle(text: string): string {
  const lines = text.split('\n').map(line => line.trim()).filter(line => line.length > 0);
  
  if (lines.length === 0) return 'Untitled Lesson';
  
  const firstLine = lines[0];
  
  // If first line is short (likely a title), use it
  if (firstLine.length < 100 && !firstLine.includes('.')) {
    return firstLine;
  }
  
  // Otherwise, use first sentence as title
  const sentences = splitIntoSentences(firstLine);
  return sentences[0] || 'Untitled Lesson';
}

/**
 * Parses Romanian lesson text into structured data
 */
export function reconstructLesson(parsed: ParsedLesson): string {
  return parsed.paragraphs
    .map(p => p.sentences.map(s => s.text).join(' '))
    .join('\n\n');
}

export function parseLesson(lessonText: string): ParsedLesson {
  if (!lessonText || lessonText.trim().length === 0) {
    return {
      title: 'Empty Lesson',
      paragraphs: []
    };
  }
  
  const cleanText = lessonText.trim();
  const title = extractTitle(cleanText);
  
  // Split into paragraphs (double newlines or single newlines with significant spacing)
  const paragraphTexts = cleanText
    .split(/\n\s*\n|\n(?=\s{2,})/)
    .map(p => p.replace(/\n/g, ' ').trim())
    .filter(p => p.length > 0);
  
  // If no paragraph breaks found, treat as single paragraph
  const finalParagraphs = paragraphTexts.length > 0 ? paragraphTexts : [cleanText];
  
  const paragraphs = finalParagraphs.map((paragraphText, pIndex) => {
    const sentences = splitIntoSentences(paragraphText).map((sentenceText, sIndex) => {
      const words = tokenizeWords(sentenceText);
      
      return {
        id: generateId(sentenceText, sIndex),
        text: sentenceText,
        words
      };
    });
    
    return {
      id: generateId(paragraphText, pIndex),
      text: paragraphText,
      sentences
    };
  });
  
  return {
    title,
    paragraphs
  };
}
