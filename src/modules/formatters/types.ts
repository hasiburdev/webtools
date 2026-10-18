export type FormatterLanguage =
  | "json"
  | "yaml"
  | "toml"
  | "sql"
  | "xml"
  | "html"
  | "css"
  | "javascript"
  | "typescript"
  | "markdown";

export interface FormatterLanguageInfo {
  id: FormatterLanguage;
  label: string;
  extension: string;
  mimeType: string;
  available: boolean;
  badge?: string;
  description: string;
}

export type IndentType = "2" | "4" | "tab" | "minify";

export interface UniversalFormatOptions {
  indent: IndentType;
  wrapLines: boolean;
  sortKeys?: boolean;
  lenient?: boolean;
  escapeUnicode?: boolean;
  semi?: boolean;
  singleQuote?: boolean;
  sqlKeywordCase?: "upper" | "lower" | "preserve";
}

export type JsonFormatOptions = UniversalFormatOptions;

export interface FormatError {
  message: string;
  line?: number;
  column?: number;
  snippet?: string;
}

export interface FormatStats {
  inputChars: number;
  outputChars: number;
  inputBytes: number;
  outputBytes: number;
  inputLines: number;
  outputLines: number;
}

export interface FormatResult {
  success: boolean;
  output: string;
  error?: FormatError;
  stats?: FormatStats;
}
