import type { WordCounterStats, WordFrequencyItem, TextTransformType } from "./types";

export const COMMON_STOP_WORDS = new Set([
  "a", "about", "above", "after", "again", "against", "all", "am", "an", "and", "any", "are",
  "aren't", "as", "at", "be", "because", "been", "before", "being", "below", "between", "both",
  "but", "by", "can", "cannot", "could", "did", "do", "does", "doing", "don't", "down", "during",
  "each", "few", "for", "from", "further", "had", "has", "have", "having", "he", "her", "here",
  "hers", "herself", "him", "himself", "his", "how", "i", "if", "in", "into", "is", "it", "its",
  "itself", "just", "me", "more", "most", "my", "myself", "no", "nor", "not", "of", "off", "on",
  "once", "only", "or", "other", "our", "ours", "ourselves", "out", "over", "own", "same", "she",
  "should", "so", "some", "such", "than", "that", "the", "their", "theirs", "them", "themselves",
  "then", "there", "these", "they", "this", "those", "through", "to", "too", "under", "until",
  "up", "very", "was", "we", "were", "what", "when", "where", "which", "while", "who", "whom",
  "why", "with", "won't", "would", "you", "your", "yours", "yourself", "yourselves"
]);

export function calculateStats(text: string): WordCounterStats {
  if (!text || text.trim().length === 0) {
    return {
      words: 0,
      characters: 0,
      charactersNoSpaces: 0,
      sentences: 0,
      paragraphs: 0,
      lines: 0,
      readingTimeMinutes: 0,
      speakingTimeMinutes: 0,
      averageWordLength: 0,
      longestWord: "",
    };
  }

  const characters = text.length;
  const charactersNoSpaces = text.replace(/\s/g, "").length;
  
  // Extract words using Unicode aware regex
  const wordsArray = text.match(/[\p{L}\p{N}'’_-]+/gu) || [];
  const words = wordsArray.length;

  // Sentences
  const sentenceMatches = text.trim().match(/[^.!?]+[.!?]+(\s+|$)|[^.!?]+$/gu) || [];
  const sentences = sentenceMatches.filter((s) => s.trim().length > 0).length;

  // Paragraphs
  const paragraphs = text
    .split(/\n\s*\n/)
    .map((p) => p.trim())
    .filter((p) => p.length > 0).length;

  // Lines
  const lines = text.split(/\r\n|\r|\n/).length;

  // Reading time (225 words per minute) & Speaking time (135 words per minute)
  const readingTimeMinutes = Math.ceil((words / 225) * 10) / 10;
  const speakingTimeMinutes = Math.ceil((words / 135) * 10) / 10;

  // Word statistics
  let totalWordLength = 0;
  let longestWord = "";

  for (const word of wordsArray) {
    totalWordLength += word.length;
    if (word.length > longestWord.length) {
      longestWord = word;
    }
  }

  const averageWordLength = words > 0 ? Math.round((totalWordLength / words) * 10) / 10 : 0;

  return {
    words,
    characters,
    charactersNoSpaces,
    sentences,
    paragraphs,
    lines,
    readingTimeMinutes,
    speakingTimeMinutes,
    averageWordLength,
    longestWord,
  };
}

export function getWordFrequencies(
  text: string,
  excludeStopWords: boolean,
  limit: number = 10
): WordFrequencyItem[] {
  const wordsArray = text.toLowerCase().match(/[\p{L}\p{N}'’_-]+/gu) || [];
  if (wordsArray.length === 0) return [];

  const counts = new Map<string, number>();

  for (const rawWord of wordsArray) {
    // Strip leading and trailing punctuation
    const word = rawWord.replace(/^['’_-]+|['’_-]+$/g, "");
    if (!word || word.length < 2) continue;
    if (excludeStopWords && COMMON_STOP_WORDS.has(word)) continue;

    counts.set(word, (counts.get(word) || 0) + 1);
  }

  const totalWords = wordsArray.length;
  const sorted = Array.from(counts.entries())
    .sort((a, b) => b[1] - a[1])
    .slice(0, limit);

  return sorted.map(([word, count]) => ({
    word,
    count,
    percentage: Math.round((count / totalWords) * 1000) / 10,
  }));
}

export function transformText(text: string, type: TextTransformType): string {
  switch (type) {
    case "uppercase":
      return text.toUpperCase();
    case "lowercase":
      return text.toLowerCase();
    case "titlecase":
      return text.replace(/\b\p{L}+/gu, (w) => w.charAt(0).toUpperCase() + w.slice(1).toLowerCase());
    case "sentencecase":
      return text.toLowerCase().replace(/(^\s*|[.!?]\s+)(\p{L})/gu, (_, sep, char) => sep + char.toUpperCase());
    case "remove-extra-spaces":
      return text
        .split("\n")
        .map((line) => line.replace(/[ \t]+/g, " ").trim())
        .join("\n");
    case "remove-empty-lines":
      return text
        .split(/\r\n|\r|\n/)
        .filter((line) => line.trim().length > 0)
        .join("\n");
    default:
      return text;
  }
}

export function formatDuration(minutes: number): string {
  if (minutes <= 0) return "0 sec";
  const totalSeconds = Math.round(minutes * 60);
  if (totalSeconds < 60) {
    return `${totalSeconds} sec`;
  }
  const mins = Math.floor(totalSeconds / 60);
  const remainingSecs = totalSeconds % 60;
  return remainingSecs > 0 ? `${mins} min ${remainingSecs} sec` : `${mins} min`;
}
