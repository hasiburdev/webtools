"use client";

import { useEffect, useId, useRef, useState } from "react";
import {
  AlertCircle,
  Check,
  CheckCircle2,
  Copy,
  FileCode,
  Loader2,
  ShieldCheck,
  Sparkles,
  Trash2,
  Upload,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { LANGUAGE_SAMPLES } from "@/modules/formatters/samples";
import { VALIDATION_NOTES, VALIDATOR_LANGUAGES } from "./languages";
import {
  MAX_VALIDATION_LENGTH,
  SQL_DIALECTS,
  validateCode,
} from "./validate-code";
import type {
  SqlDialect,
  ValidationIssue,
  ValidationResult,
  ValidatorLanguage,
} from "./types";

interface CompletedValidation {
  input: string;
  language: ValidatorLanguage;
  dialect: SqlDialect;
  revision: number;
  result: ValidationResult;
}

export function ValidatorsTool() {
  const [language, setLanguage] = useState<ValidatorLanguage>("json");
  const [input, setInput] = useState("");
  const [dialect, setDialect] = useState<SqlDialect>("MySQL");
  const [revision, setRevision] = useState(0);
  const [completed, setCompleted] = useState<CompletedValidation | null>(null);
  const [notice, setNotice] = useState("");
  const [copied, setCopied] = useState(false);
  const [dragging, setDragging] = useState(false);
  const fileRef = useRef<HTMLInputElement>(null);
  const editorRef = useRef<HTMLTextAreaElement>(null);
  const importVersion = useRef(0);
  const editorId = useId();
  const dialectId = useId();
  const sampleId = useId();

  const info = VALIDATOR_LANGUAGES.find((item) => item.id === language)!;
  const samples = LANGUAGE_SAMPLES[language];
  const hasInput = input.trim().length > 0;
  const result =
    hasInput &&
    completed?.input === input &&
    completed.language === language &&
    completed.dialect === dialect &&
    completed.revision === revision
      ? completed.result
      : null;
  const pending = hasInput && !result;
  const errors =
    result?.issues.filter((issue) => issue.severity === "error").length ?? 0;
  const warnings =
    result?.issues.filter((issue) => issue.severity === "warning").length ?? 0;

  useEffect(() => {
    if (!input.trim()) return;
    let current = true;
    const timer = window.setTimeout(() => {
      void validateCode(input, language, dialect)
        .then((result) => {
          if (current)
            setCompleted({ input, language, dialect, revision, result });
        })
        .catch(() => {
          if (current)
            setCompleted({
              input,
              language,
              dialect,
              revision,
              result: {
                status: "unavailable",
                issues: [
                  {
                    severity: "error",
                    message: "Validation could not finish. Try Validate again.",
                  },
                ],
              },
            });
        });
    }, 300);
    return () => {
      current = false;
      window.clearTimeout(timer);
    };
  }, [input, language, dialect, revision]);

  useEffect(() => {
    if (!copied) return;
    const timer = window.setTimeout(() => setCopied(false), 2000);
    return () => window.clearTimeout(timer);
  }, [copied]);

  function updateInput(value: string) {
    importVersion.current += 1;
    setInput(value);
    setNotice("");
    setCopied(false);
  }

  async function readFile(file: File) {
    const version = ++importVersion.current;
    setNotice("");
    if (file.size > 1_000_000) {
      setNotice("Choose a text file smaller than 1 MB.");
      return;
    }
    try {
      const content = await file.text();
      if (version !== importVersion.current) return;
      if (content.length > MAX_VALIDATION_LENGTH) {
        setNotice("Choose a file with 200,000 characters or fewer.");
        return;
      }
      updateInput(content);
    } catch {
      if (version === importVersion.current)
        setNotice("This file could not be read. Try another text file.");
    }
  }

  async function pasteInput() {
    const version = ++importVersion.current;
    try {
      const text = await navigator.clipboard.readText();
      if (version === importVersion.current) updateInput(text);
    } catch {
      if (version === importVersion.current)
        setNotice(
          "Clipboard access is unavailable. Paste directly into the editor.",
        );
    }
  }

  function focusIssue(issue: ValidationIssue) {
    if (!issue.line || !editorRef.current) return;
    const lines = input.split("\n");
    const lineIndex = Math.min(issue.line - 1, lines.length - 1);
    const offset = lines
      .slice(0, lineIndex)
      .reduce((total, line) => total + line.length + 1, 0);
    const start =
      offset +
      Math.min(Math.max(0, (issue.column ?? 1) - 1), lines[lineIndex].length);
    editorRef.current.focus();
    editorRef.current.setSelectionRange(
      start,
      Math.min(start + 1, input.length),
    );
    editorRef.current.scrollTop = Math.max(0, (lineIndex - 3) * 24);
  }

  async function copyReport() {
    if (!result) return;
    const title =
      result.status === "unavailable"
        ? "Validation unavailable"
        : result.status === "invalid"
          ? "Invalid"
          : warnings
            ? "Valid with warnings"
            : "Valid";
    const report = [
      `${info.label}: ${title}`,
      ...result.issues.map(
        (issue) =>
          `${issue.severity.toUpperCase()}${issue.line ? ` (line ${issue.line}${issue.column ? `, column ${issue.column}` : ""})` : ""}: ${issue.message}${issue.rule ? ` [${issue.rule}]` : ""}`,
      ),
    ].join("\n");
    try {
      await navigator.clipboard.writeText(report);
      setCopied(true);
    } catch {
      setNotice(
        "The report could not be copied. You can select the results and copy them manually.",
      );
    }
  }

  return (
    <div className="flex flex-col gap-6">
      <div className="flex flex-col gap-2">
        <div className="flex items-center justify-between gap-2 text-xs text-muted-foreground">
          <p className="font-semibold uppercase tracking-widest">
            Select Language
          </p>
          <span>{VALIDATOR_LANGUAGES.length} validators available</span>
        </div>
        <div
          className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-1.5 shadow-2xs"
          role="group"
          aria-label="Validation language"
        >
          {VALIDATOR_LANGUAGES.map((item) => (
            <button
              key={item.id}
              type="button"
              aria-pressed={language === item.id}
              onClick={() => {
                importVersion.current += 1;
                setLanguage(item.id);
                setNotice("");
                setCopied(false);
              }}
              className={cn(
                "rounded-lg px-3 py-1.5 text-xs font-medium transition-colors",
                language === item.id
                  ? "bg-primary text-primary-foreground shadow-xs"
                  : "text-muted-foreground hover:bg-muted hover:text-foreground",
              )}
            >
              {item.label}
            </button>
          ))}
        </div>
      </div>

      <Card>
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          <p className="flex items-center gap-2 text-xs text-muted-foreground">
            <ShieldCheck className="size-4 shrink-0 text-primary" />
            Live validation · Your code stays in your browser
          </p>
          {language === "sql" && (
            <div className="flex items-center gap-2">
              <label htmlFor={dialectId} className="text-xs font-medium">
                SQL dialect
              </label>
              <select
                id={dialectId}
                value={dialect}
                onChange={(event) => {
                  setDialect(event.target.value as SqlDialect);
                  setCopied(false);
                }}
                className="rounded-md border border-border bg-background px-2 py-1.5 text-xs"
              >
                {SQL_DIALECTS.map((value) => (
                  <option key={value}>{value}</option>
                ))}
              </select>
            </div>
          )}
          <Button
            size="sm"
            disabled={!hasInput || pending}
            onClick={() => {
              setRevision((value) => value + 1);
              setCopied(false);
            }}
          >
            {pending ? (
              <Loader2 className="size-3.5 animate-spin" />
            ) : (
              <ShieldCheck className="size-3.5" />
            )}
            {pending ? "Validating…" : "Validate"}
          </Button>
        </CardContent>
      </Card>

      {notice && (
        <p
          role="alert"
          className="rounded-lg border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive"
        >
          {notice}
        </p>
      )}

      <div className="grid min-w-0 gap-6 lg:grid-cols-2">
        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <label htmlFor={editorId} className="text-sm font-semibold">
              {info.label} Input
            </label>
            <div className="flex flex-wrap gap-1.5">
              <Button variant="outline" size="xs" onClick={pasteInput}>
                Paste
              </Button>
              <input
                type="file"
                ref={fileRef}
                className="hidden"
                accept={`${info.extension},.txt${language === "yaml" ? ",.yml" : language === "javascript" ? ",.jsx,.mjs,.cjs" : language === "markdown" ? ",.markdown" : ""}`}
                onChange={(event) => {
                  const file = event.target.files?.[0];
                  if (file) void readFile(file);
                  event.target.value = "";
                }}
              />
              <Button
                variant="outline"
                size="xs"
                onClick={() => fileRef.current?.click()}
              >
                <Upload className="size-3" />
                Upload
              </Button>
              <Button
                variant="ghost"
                size="xs"
                disabled={!input}
                onClick={() => updateInput("")}
              >
                <Trash2 className="size-3" />
                Clear
              </Button>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Sparkles className="size-3.5 text-muted-foreground" />
            <label htmlFor={sampleId} className="text-xs text-muted-foreground">
              Load sample
            </label>
            <select
              id={sampleId}
              value=""
              onChange={(event) => {
                const sample = samples.find(
                  (sample) => sample.id === event.target.value,
                );
                if (sample) updateInput(sample.content);
              }}
              className="min-w-0 flex-1 rounded-md border border-border bg-background px-2 py-1.5 text-xs"
            >
              <option value="" disabled>
                Choose a {info.label} sample
              </option>
              {samples.map((sample) => (
                <option key={sample.id} value={sample.id}>
                  {sample.label}
                </option>
              ))}
            </select>
          </div>
          <div
            onDragOver={(event) => {
              event.preventDefault();
              setDragging(true);
            }}
            onDragLeave={() => setDragging(false)}
            onDrop={(event) => {
              event.preventDefault();
              setDragging(false);
              const file = event.dataTransfer.files[0];
              if (file) void readFile(file);
            }}
            className={cn(
              "relative flex flex-1 rounded-lg border bg-muted/20 transition-colors",
              dragging ? "border-primary bg-primary/5" : "border-border",
            )}
          >
            <textarea
              ref={editorRef}
              id={editorId}
              value={input}
              onChange={(event) => updateInput(event.target.value)}
              placeholder={`Paste your ${info.label} here, drop a text file, or load a sample…`}
              spellCheck={false}
              autoCapitalize="off"
              autoCorrect="off"
              aria-describedby={`${editorId}-help`}
              className="min-h-96 w-full resize-y rounded-lg bg-transparent p-4 font-mono text-sm leading-6 outline-none placeholder:text-muted-foreground/60 focus-visible:ring-2 focus-visible:ring-ring lg:min-h-120"
            />
          </div>
          <div
            id={`${editorId}-help`}
            className="flex flex-wrap justify-between gap-2 text-xs text-muted-foreground"
          >
            <span>
              {input.length.toLocaleString()} characters ·{" "}
              {input ? input.split("\n").length.toLocaleString() : 0} lines
            </span>
            <span>
              Limit: {MAX_VALIDATION_LENGTH.toLocaleString()} characters
            </span>
          </div>
        </div>

        <div className="flex min-w-0 flex-col gap-3">
          <div className="flex min-h-6 items-center justify-between gap-2">
            <h2 className="text-sm font-semibold">Validation Results</h2>
            <Button
              variant="outline"
              size="xs"
              onClick={copyReport}
              disabled={!result}
            >
              {copied ? (
                <Check className="size-3" />
              ) : (
                <Copy className="size-3" />
              )}
              {copied ? "Copied" : "Copy report"}
            </Button>
          </div>
          <p className="min-h-8 text-xs leading-relaxed text-muted-foreground">
            {VALIDATION_NOTES[language]}
          </p>
          <div
            className="min-h-80 flex-1 rounded-lg border border-border bg-muted/20"
            aria-busy={pending}
          >
            <div role="status" aria-live="polite" aria-atomic="true">
              {pending ? (
                <div className="flex flex-col items-center gap-3 p-12 text-center text-muted-foreground">
                  <Loader2 className="size-8 animate-spin" />
                  <p className="text-sm">Validating {info.label}…</p>
                </div>
              ) : !result ? (
                <div className="flex flex-col items-center gap-3 px-6 py-16 text-center text-muted-foreground">
                  <FileCode className="size-10 stroke-[1.2]" />
                  <p className="text-sm font-medium text-foreground">
                    Check your {info.label}
                  </p>
                  <p className="max-w-xs text-xs leading-relaxed">
                    Paste code or load a sample to see errors, warnings, and
                    their locations.
                  </p>
                </div>
              ) : (
                <div
                  className={cn(
                    "m-4 flex items-start gap-3 rounded-lg border p-4",
                    result.status === "invalid" ||
                      result.status === "unavailable"
                      ? "border-destructive/30 bg-destructive/5"
                      : warnings
                        ? "border-amber-500/30 bg-amber-500/5"
                        : "border-emerald-500/30 bg-emerald-500/5",
                  )}
                >
                  {errors ? (
                    <AlertCircle className="mt-0.5 size-5 shrink-0 text-destructive" />
                  ) : (
                    <CheckCircle2
                      className={cn(
                        "mt-0.5 size-5 shrink-0",
                        warnings
                          ? "text-amber-600 dark:text-amber-400"
                          : "text-emerald-600 dark:text-emerald-400",
                      )}
                    />
                  )}
                  <div>
                    <p className="text-sm font-semibold">
                      {result.status === "unavailable"
                        ? "Validation unavailable"
                        : result.status === "invalid"
                          ? `Invalid ${info.label}`
                          : warnings
                            ? `${info.label} checked with warnings`
                            : `${info.label} checks passed`}
                    </p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {result.status === "unavailable"
                        ? "Validation did not finish."
                        : `${errors} ${errors === 1 ? "error" : "errors"} · ${warnings} ${warnings === 1 ? "warning" : "warnings"}`}
                    </p>
                  </div>
                </div>
              )}
            </div>
            {result && result.issues.length > 0 && (
              <ol
                className="flex max-h-144 flex-col gap-3 overflow-auto px-4 pb-4"
                aria-label="Validation issues"
              >
                {result.issues.length > 100 && (
                  <li className="text-xs text-muted-foreground">
                    Showing the first 100 of{" "}
                    {result.issues.length.toLocaleString()} issues. Copy the
                    report for the full list.
                  </li>
                )}
                {result.issues.slice(0, 100).map((issue, index) => (
                  <li
                    key={index}
                    className="rounded-lg border border-border bg-background p-3"
                  >
                    <div className="flex flex-wrap items-center justify-between gap-2 text-xs">
                      <span
                        className={cn(
                          "font-semibold uppercase",
                          issue.severity === "error"
                            ? "text-destructive"
                            : "text-amber-600 dark:text-amber-400",
                        )}
                      >
                        {issue.severity}
                      </span>
                      {issue.line !== undefined && (
                        <button
                          type="button"
                          onClick={() => focusIssue(issue)}
                          className="text-primary underline underline-offset-2"
                        >
                          Line {issue.line}
                          {issue.column !== undefined
                            ? `, column ${issue.column}`
                            : ""}
                        </button>
                      )}
                    </div>
                    <p className="mt-2 whitespace-pre-wrap wrap-anywhere text-xs leading-relaxed">
                      {issue.message}
                    </p>
                    {issue.rule && (
                      <p className="mt-1 text-[11px] text-muted-foreground">
                        {issue.rule}
                      </p>
                    )}
                    {issue.snippet && (
                      <pre className="mt-3 overflow-auto rounded-md bg-muted/50 p-3 font-mono text-xs leading-relaxed">
                        <code>{issue.snippet}</code>
                      </pre>
                    )}
                  </li>
                ))}
              </ol>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
