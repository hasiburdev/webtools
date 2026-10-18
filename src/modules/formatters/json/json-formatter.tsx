"use client";

import { useId, useMemo, useRef, useState, useSyncExternalStore, useTransition } from "react";
import {
  AlertCircle,
  ArrowRightLeft,
  Check,
  CheckCircle2,
  ChevronDown,
  Copy,
  Download,
  FileCode,
  Sparkles,
  Trash2,
  Upload,
  WrapText,
} from "lucide-react";

import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import {
  ResizableHandle,
  ResizablePanel,
  ResizablePanelGroup,
} from "@/components/ui/resizable";
import { Switch } from "@/components/ui/switch";
import { cn } from "@/lib/utils";

import { formatJson } from "./format-json";
import { JSON_SAMPLES } from "./sample-json";
import type { IndentType, JsonFormatOptions } from "../types";

const INDENT_OPTIONS: { value: IndentType; label: string }[] = [
  { value: "2", label: "2 Spaces" },
  { value: "4", label: "4 Spaces" },
  { value: "tab", label: "Tab" },
  { value: "minify", label: "Minify" },
];

function useIsMobile() {
  return useSyncExternalStore(
    (callback) => {
      const mq = window.matchMedia("(max-width: 767px)");
      mq.addEventListener("change", callback);
      return () => mq.removeEventListener("change", callback);
    },
    () => window.matchMedia("(max-width: 767px)").matches,
    () => false,
  );
}

export function JsonFormatter() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [isDragging, setIsDragging] = useState(false);
  const [optionsOpen, setOptionsOpen] = useState(false);
  const [sampleMenuOpen, setSampleMenuOpen] = useState(false);

  const isMobile = useIsMobile();
  const [, startTransition] = useTransition();

  const fileInputRef = useRef<HTMLInputElement>(null);
  const inputId = useId();

  const [options, setOptions] = useState<JsonFormatOptions>({
    indent: "2",
    sortKeys: false,
    lenient: true,
    escapeUnicode: false,
    wrapLines: true,
  });

  // Purely derived result — no cascading setState in useEffect
  const result = useMemo(() => {
    return formatJson(input, options);
  }, [input, options]);

  const hasInput = input.trim().length > 0;
  const hasOutput = result.success && result.output.length > 0;

  // Formatting helpers
  const handleCopy = async () => {
    if (!result.output) return;
    try {
      await navigator.clipboard.writeText(result.output);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // Fallback
    }
  };

  const handleDownload = () => {
    if (!result.output) return;
    const blob = new Blob([result.output], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = options.indent === "minify" ? "minified.json" : "formatted.json";
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handlePaste = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        startTransition(() => {
          setInput(text);
        });
      }
    } catch {
      // Clipboard permission denied or unavailable
    }
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result;
      if (typeof content === "string") {
        startTransition(() => {
          setInput(content);
        });
      }
    };
    reader.readAsText(file);
    e.target.value = "";
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      const reader = new FileReader();
      reader.onload = (event) => {
        const content = event.target?.result;
        if (typeof content === "string") {
          startTransition(() => {
            setInput(content);
          });
        }
      };
      reader.readAsText(file);
    }
  };

  const loadSample = (content: string) => {
    startTransition(() => {
      setInput(content);
    });
    setSampleMenuOpen(false);
  };

  const handleUseAsInput = () => {
    if (!result.output) return;
    startTransition(() => {
      setInput(result.output);
    });
  };

  const setIndent = (indent: IndentType) => {
    setOptions((prev) => ({ ...prev, indent }));
  };

  const toggleOption = <K extends keyof JsonFormatOptions>(key: K) => {
    setOptions((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  // Compression/expansion percentage calculation
  const sizeDiffPercentage = useMemo(() => {
    if (!result.stats || result.stats.inputBytes === 0 || !hasOutput) return null;
    const diff = result.stats.outputBytes - result.stats.inputBytes;
    const percent = ((diff / result.stats.inputBytes) * 100).toFixed(1);
    return {
      percent,
      isReduction: diff < 0,
    };
  }, [result.stats, hasOutput]);

  const outputLines = useMemo(() => {
    if (!result.output) return [];
    return result.output.split("\n");
  }, [result.output]);

  return (
    <div className="flex flex-col gap-6">
      {/* ── Action & Option Bar ── */}
      <Card className="border border-border bg-card/80 shadow-xs backdrop-blur">
        <CardContent className="flex flex-wrap items-center justify-between gap-4 p-4">
          {/* Indentation Selector */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">
              Format:
            </span>
            <div className="flex rounded-md border border-border bg-background p-0.5">
              {INDENT_OPTIONS.map((opt) => (
                <button
                  key={opt.value}
                  type="button"
                  onClick={() => setIndent(opt.value)}
                  className={cn(
                    "rounded px-2.5 py-1 text-xs font-medium transition-colors",
                    options.indent === opt.value
                      ? "bg-primary text-primary-foreground shadow-xs"
                      : "text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {opt.label}
                </button>
              ))}
            </div>

            {/* Quick action: Sort Keys toggle */}
            <Button
              variant={options.sortKeys ? "default" : "outline"}
              size="sm"
              onClick={() => toggleOption("sortKeys")}
              className="text-xs"
              title="Sort object keys alphabetically"
            >
              <Sparkles className="size-3.5" />
              Sort Keys
            </Button>
          </div>

          {/* Right side controls: Samples & Advanced Options */}
          <div className="flex items-center gap-2">
            {/* Samples Menu */}
            <div className="relative">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSampleMenuOpen(!sampleMenuOpen)}
                className="text-xs"
                aria-expanded={sampleMenuOpen}
              >
                <FileCode className="size-3.5" />
                Samples
                <ChevronDown className="size-3 text-muted-foreground" />
              </Button>

              {sampleMenuOpen && (
                <>
                  <div
                    className="fixed inset-0 z-40"
                    onClick={() => setSampleMenuOpen(false)}
                  />
                  <div className="absolute right-0 z-50 mt-1 w-64 rounded-lg border border-border bg-popover p-1.5 text-popover-foreground shadow-lg">
                    <p className="px-2 py-1 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                      Load Sample Payload
                    </p>
                    {JSON_SAMPLES.map((sample) => (
                      <button
                        key={sample.id}
                        type="button"
                        onClick={() => loadSample(sample.content)}
                        className="flex w-full flex-col items-start rounded-md px-2.5 py-1.5 text-left text-xs transition-colors hover:bg-muted"
                      >
                        <span className="font-medium text-foreground">{sample.label}</span>
                        <span className="text-[11px] text-muted-foreground line-clamp-1">
                          {sample.description}
                        </span>
                      </button>
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Advanced Options Toggle */}
            <Button
              variant={optionsOpen ? "secondary" : "outline"}
              size="sm"
              onClick={() => setOptionsOpen(!optionsOpen)}
              className="text-xs"
              aria-expanded={optionsOpen}
            >
              Settings
              <ChevronDown
                className={cn(
                  "size-3 transition-transform",
                  optionsOpen && "rotate-180",
                )}
              />
            </Button>
          </div>
        </CardContent>

        {/* Collapsible Advanced Options Tray */}
        {optionsOpen && (
          <div className="border-t border-border bg-muted/30 px-4 py-3">
            <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
              {/* Lenient parser */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <Label htmlFor="toggle-lenient" className="cursor-pointer text-xs font-medium">
                    Lenient Mode
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Fix comments & trailing commas
                  </span>
                </div>
                <Switch
                  id="toggle-lenient"
                  checked={options.lenient}
                  onCheckedChange={() => toggleOption("lenient")}
                />
              </div>

              {/* Escape Unicode */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <Label htmlFor="toggle-unicode" className="cursor-pointer text-xs font-medium">
                    Escape Unicode
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Convert non-ASCII to \uXXXX
                  </span>
                </div>
                <Switch
                  id="toggle-unicode"
                  checked={options.escapeUnicode}
                  onCheckedChange={() => toggleOption("escapeUnicode")}
                />
              </div>

              {/* Wrap Lines */}
              <div className="flex items-center justify-between gap-2">
                <div className="flex flex-col">
                  <Label htmlFor="toggle-wrap" className="cursor-pointer text-xs font-medium">
                    Wrap Lines
                  </Label>
                  <span className="text-[11px] text-muted-foreground">
                    Soft wrap long code lines
                  </span>
                </div>
                <Switch
                  id="toggle-wrap"
                  checked={options.wrapLines}
                  onCheckedChange={() => toggleOption("wrapLines")}
                />
              </div>
            </div>
          </div>
        )}
      </Card>

      {/* ── Main Dual Editor using shadcn Resizable Panel Group ── */}
      <div className="w-full">
        <ResizablePanelGroup
          orientation={isMobile ? "vertical" : "horizontal"}
          className="h-[680px] w-full rounded-xl border border-border bg-card shadow-xs overflow-hidden"
        >
          {/* ── Left / Top Panel: Input ── */}
          <ResizablePanel
            defaultSize="50%"
            minSize="20%"
            maxSize="80%"
            className="flex h-full min-h-0 min-w-0 flex-col p-4"
          >
            {/* Header */}
            <div className="mb-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <Label htmlFor={inputId} className="text-sm font-semibold text-foreground">
                  Input JSON
                </Label>
                {hasInput && result.stats && (
                  <span className="text-xs text-muted-foreground">
                    {result.stats.inputLines} {result.stats.inputLines === 1 ? "line" : "lines"} ·{" "}
                    {result.stats.inputBytes.toLocaleString()} bytes
                  </span>
                )}
              </div>

              {/* Input Actions */}
              <div className="flex items-center gap-1.5">
                <Button
                  variant="ghost"
                  size="xs"
                  onClick={handlePaste}
                  title="Paste from clipboard"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  Paste
                </Button>

                <Button
                  variant="ghost"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload .json or .txt file"
                  className="text-xs text-muted-foreground hover:text-foreground"
                >
                  <Upload className="size-3" />
                  Upload
                </Button>
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".json,.txt"
                  className="hidden"
                  onChange={handleFileUpload}
                />

                {hasInput && (
                  <Button
                    variant="ghost"
                    size="xs"
                    onClick={() => setInput("")}
                    title="Clear input"
                    className="text-xs text-destructive hover:bg-destructive/10 hover:text-destructive"
                  >
                    <Trash2 className="size-3" />
                    Clear
                  </Button>
                )}
              </div>
            </div>

            {/* Input Textbox Container (exact same height as output, scrolls internally) */}
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setIsDragging(true);
              }}
              onDragLeave={() => setIsDragging(false)}
              onDrop={handleDrop}
              className={cn(
                "relative flex flex-1 min-h-0 flex-col rounded-lg border bg-background font-mono text-sm transition-all overflow-hidden",
                isDragging
                  ? "border-primary ring-2 ring-primary/20 bg-primary/5"
                  : "border-border",
              )}
            >
              <textarea
                id={inputId}
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder='Paste or type JSON here, or drop a .json file…&#10;e.g. {"name": "webtools", "active": true}'
                spellCheck={false}
                className={cn(
                  "h-full w-full resize-none p-4 font-mono text-xs leading-relaxed outline-none md:text-sm",
                  options.wrapLines
                    ? "whitespace-pre-wrap break-all overflow-y-auto overflow-x-hidden"
                    : "whitespace-pre overflow-auto",
                )}
              />

              {/* Drag overlay notice */}
              {isDragging && (
                <div className="pointer-events-none absolute inset-0 flex items-center justify-center rounded-lg bg-background/80 backdrop-blur-xs">
                  <div className="flex flex-col items-center gap-2 text-primary">
                    <Upload className="size-8 animate-bounce" />
                    <span className="text-sm font-medium">Drop your JSON file here</span>
                  </div>
                </div>
              )}
            </div>
          </ResizablePanel>

          {/* ── Resizable Handle (shadcn ResizableHandle with Grip) ── */}
          <ResizableHandle withHandle />

          {/* ── Right / Bottom Panel: Output ── */}
          <ResizablePanel
            defaultSize="50%"
            minSize="20%"
            maxSize="80%"
            className="flex h-full min-h-0 min-w-0 flex-col p-4"
          >
            {/* Header */}
            <div className="mb-2 flex items-center justify-between shrink-0">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Formatted Output
                </span>

                {/* Validation Status Badge */}
                {hasInput ? (
                  result.success ? (
                    <Badge variant="outline" className="gap-1 border-emerald-500/30 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400">
                      <CheckCircle2 className="size-3" />
                      Valid JSON
                    </Badge>
                  ) : (
                    <Badge variant="outline" className="gap-1 border-destructive/30 bg-destructive/10 text-destructive">
                      <AlertCircle className="size-3" />
                      Syntax Error
                    </Badge>
                  )
                ) : (
                  <Badge variant="outline" className="text-muted-foreground">
                    Ready
                  </Badge>
                )}

                {/* Compression stats */}
                {sizeDiffPercentage && (
                  <span
                    className={cn(
                      "text-xs font-medium",
                      sizeDiffPercentage.isReduction ? "text-emerald-600 dark:text-emerald-400" : "text-muted-foreground",
                    )}
                  >
                    {sizeDiffPercentage.isReduction ? "" : "+"}
                    {sizeDiffPercentage.percent}%
                  </span>
                )}
              </div>

              {/* Output Actions */}
              <div className="flex items-center gap-1.5">
                {hasOutput && (
                  <>
                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleUseAsInput}
                      title="Swap output into input"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <ArrowRightLeft className="size-3" />
                      Use as Input
                    </Button>

                    <Button
                      variant="ghost"
                      size="xs"
                      onClick={handleDownload}
                      title="Download formatted file"
                      className="text-xs text-muted-foreground hover:text-foreground"
                    >
                      <Download className="size-3" />
                      Download
                    </Button>
                  </>
                )}

                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleCopy}
                  disabled={!hasOutput}
                  className="gap-1 text-xs"
                >
                  {copied ? (
                    <>
                      <Check className="size-3 text-emerald-500" />
                      Copied
                    </>
                  ) : (
                    <>
                      <Copy className="size-3" />
                      Copy
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Output Textbox Container (exact same height as input, scrolls internally) */}
            <div
              className={cn(
                "relative flex flex-1 min-h-0 flex-col rounded-lg border bg-muted/20 font-mono text-sm overflow-hidden",
                result.error ? "border-destructive/40 bg-destructive/5" : "border-border",
              )}
            >
              {/* If there is a parsing error */}
              {result.error ? (
                <div className="flex flex-1 min-h-0 flex-col p-4 overflow-auto">
                  <div className="flex items-start gap-2.5 rounded-md border border-destructive/30 bg-destructive/10 p-3 text-destructive shrink-0">
                    <AlertCircle className="mt-0.5 size-4 shrink-0" />
                    <div className="flex flex-col gap-1">
                      <span className="font-semibold text-xs tracking-wide uppercase">
                        Syntax Error
                        {result.error.line !== undefined && (
                          <span>
                            {" "}— Line {result.error.line}, Column {result.error.column}
                          </span>
                        )}
                      </span>
                      <p className="text-xs font-sans text-foreground/90">{result.error.message}</p>
                    </div>
                  </div>

                  {/* Error Snippet Preview */}
                  {result.error.snippet && (
                    <div className="mt-4 flex-1 min-h-0">
                      <p className="mb-2 text-[11px] font-semibold text-muted-foreground uppercase tracking-wider">
                        Error Location:
                      </p>
                      <pre className="overflow-auto rounded-md border border-destructive/20 bg-background/80 p-3 text-xs leading-relaxed text-foreground">
                        <code>{result.error.snippet}</code>
                      </pre>
                    </div>
                  )}
                </div>
              ) : hasOutput ? (
                /* Valid Formatted Output with Line Numbers (scrolls internally) */
                <div className="relative flex flex-1 min-h-0 overflow-hidden">
                  <div className="flex flex-1 min-h-0 overflow-auto">
                    {/* Line Numbers Gutter */}
                    <div
                      aria-hidden="true"
                      className="sticky left-0 select-none border-r border-border bg-muted/40 px-3 py-4 text-right font-mono text-xs text-muted-foreground/60 leading-relaxed shrink-0 z-10"
                    >
                      {outputLines.map((_, i) => (
                        <div key={i}>{i + 1}</div>
                      ))}
                    </div>

                    {/* Code display */}
                    <pre
                      tabIndex={0}
                      className={cn(
                        "flex-1 p-4 font-mono text-xs leading-relaxed text-foreground outline-none md:text-sm select-text",
                        options.wrapLines ? "whitespace-pre-wrap break-all" : "whitespace-pre",
                      )}
                    >
                      <code>{result.output}</code>
                    </pre>
                  </div>
                </div>
              ) : (
                /* Empty state placeholder */
                <div className="flex flex-1 flex-col items-center justify-center p-8 text-center text-muted-foreground">
                  <FileCode className="mb-3 size-10 stroke-[1.2] text-muted-foreground/50" />
                  <p className="text-sm font-medium text-foreground">Formatted JSON will appear here</p>
                  <p className="mt-1 max-w-xs text-xs text-muted-foreground">
                    Paste JSON in the left panel or click{" "}
                    <button
                      type="button"
                      onClick={() => loadSample(JSON_SAMPLES[0].content)}
                      className="text-primary underline underline-offset-2 hover:opacity-80"
                    >
                      load sample
                    </button>{" "}
                    to test.
                  </p>
                </div>
              )}
            </div>

            {/* Footer metrics inside Output panel */}
            {hasOutput && result.stats && (
              <div className="mt-2 flex items-center justify-between text-xs text-muted-foreground shrink-0">
                <span>
                  {result.stats.outputLines} {result.stats.outputLines === 1 ? "line" : "lines"} ·{" "}
                  {result.stats.outputBytes.toLocaleString()} bytes
                </span>
                <span className="flex items-center gap-1">
                  <WrapText className="size-3" />
                  {options.wrapLines ? "Wrapping on" : "Wrapping off"}
                </span>
              </div>
            )}
          </ResizablePanel>
        </ResizablePanelGroup>
      </div>
    </div>
  );
}
