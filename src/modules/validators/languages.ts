import { FORMATTER_LANGUAGES } from "../formatters/languages";
import type { ValidatorLanguage } from "./types";

// Keep language IDs, labels, order, and file extensions in sync with formatters.
export const VALIDATOR_LANGUAGES = FORMATTER_LANGUAGES;

export const VALIDATION_NOTES: Record<ValidatorLanguage, string> = {
  json: "Strict JSON syntax. Comments, trailing commas, and unquoted keys are rejected.",
  yaml: "YAML syntax and duplicate keys, including documents separated by ---. Schemas are not checked.",
  toml: "TOML syntax, table definitions, and duplicate keys.",
  sql: "SQL syntax for the selected dialect. Queries are never executed; tables and columns are not checked.",
  xml: "XML well-formedness, namespaces, and matching tags. DTD, XSD, and custom entities are not supported.",
  html: "HTML tag pairs, duplicate attributes and IDs, and unsafe attribute characters. Fragments are supported.",
  css: "CSS syntax and known property values. Unknown or newer properties are reported as warnings.",
  javascript:
    "JavaScript and JSX syntax. Code is never executed; runtime behavior is not checked.",
  typescript:
    "TypeScript syntax. Type compatibility and imports are not checked; use the TypeScript compiler for those.",
  markdown:
    "Markdown accepts most text. Recommended lint rules report potential mistakes as warnings.",
};
