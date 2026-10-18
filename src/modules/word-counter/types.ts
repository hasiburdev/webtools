export interface WordCounterStats {
  words: number;
  characters: number;
  charactersNoSpaces: number;
  sentences: number;
  paragraphs: number;
  lines: number;
  readingTimeMinutes: number;
  speakingTimeMinutes: number;
  averageWordLength: number;
  longestWord: string;
}

export interface WordFrequencyItem {
  word: string;
  count: number;
  percentage: number;
}

export type TextTransformType =
  | "uppercase"
  | "lowercase"
  | "titlecase"
  | "sentencecase"
  | "remove-extra-spaces"
  | "remove-empty-lines";
