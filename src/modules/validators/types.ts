import type { FormatterLanguage } from "../formatters/types";

export type ValidatorLanguage = FormatterLanguage;
export type SqlDialect = "MySQL" | "PostgreSQL" | "SQLite";

export interface ValidationIssue {
  severity: "error" | "warning";
  message: string;
  line?: number;
  column?: number;
  rule?: string;
  snippet?: string;
}

export interface ValidationResult {
  status: "empty" | "valid" | "invalid" | "unavailable";
  issues: ValidationIssue[];
}
