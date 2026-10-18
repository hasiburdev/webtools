"use client";

import { useState, useId, useRef } from "react";
import {
  Copy,
  Check,
  Trash2,
  Upload,
  Download,
  Clock,
  Mic,
  BarChart2,
  Sparkles,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";

import {
  calculateStats,
  getWordFrequencies,
  transformText,
  formatDuration,
} from "./word-counter-utils";
import type { TextTransformType } from "./types";

const SAMPLE_TEXT = `WebTools is a fast, free, browser-based suite of privacy-first utilities designed specifically for developers, designers, and content creators. 

Everything runs directly in your client browser using modern web standards. No accounts are required, no personal data is collected or tracked, and your sensitive files never leave your machine. From code formatters to image utilities and cryptographic generators, WebTools helps you streamline daily workflows without friction!`;

export function WordCounter() {
  const [text, setText] = useState("");
  const [copied, setCopied] = useState(false);
  const [excludeStopWords, setExcludeStopWords] = useState(true);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const switchId = useId();

  const stats = calculateStats(text);
  const frequencies = getWordFrequencies(text, excludeStopWords, 8);

  const handleCopy = async () => {
    if (!text) return;
    await navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleClear = () => {
    setText("");
  };

  const handleLoadSample = () => {
    setText(SAMPLE_TEXT);
  };

  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      const content = event.target?.result as string;
      if (typeof content === "string") {
        setText(content);
      }
    };
    reader.readAsText(file);
    // Reset file input so same file can be chosen again
    e.target.value = "";
  };

  const handleDownload = () => {
    if (!text) return;
    const blob = new Blob([text], { type: "text/plain;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = "document.txt";
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  const handleTransform = (type: TextTransformType) => {
    if (!text) return;
    setText(transformText(text, type));
  };

  return (
    <div className="flex flex-col gap-6">
      {/* Quick stats ribbon */}
      <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
        <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Words</span>
          <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {stats.words.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Characters</span>
          <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {stats.characters.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Chars (no spaces)</span>
          <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {stats.charactersNoSpaces.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Sentences</span>
          <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {stats.sentences.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Paragraphs</span>
          <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {stats.paragraphs.toLocaleString()}
          </span>
        </div>
        <div className="flex flex-col rounded-xl border border-border bg-card p-4 shadow-xs">
          <span className="text-xs font-medium text-muted-foreground">Lines</span>
          <span className="mt-1 text-2xl font-bold tracking-tight text-foreground">
            {stats.lines.toLocaleString()}
          </span>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Main Editor Section (2 columns on lg) */}
        <div className="flex flex-col gap-4 lg:col-span-2">
          <Card className="flex flex-col">
            <CardHeader className="flex flex-row items-center justify-between pb-3">
              <div>
                <CardTitle className="text-base font-semibold">Text Input</CardTitle>
                <CardDescription className="text-xs">
                  Type, paste, or upload text to analyze in real-time.
                </CardDescription>
              </div>

              <div className="flex items-center gap-1.5">
                <input
                  type="file"
                  ref={fileInputRef}
                  onChange={handleFileUpload}
                  accept=".txt,.md,.csv,.json,.html"
                  className="hidden"
                />
                <Button
                  variant="outline"
                  size="xs"
                  onClick={() => fileInputRef.current?.click()}
                  title="Upload text file"
                >
                  <Upload className="size-3.5" />
                  Upload
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleLoadSample}
                  title="Load sample text"
                >
                  <Sparkles className="size-3.5" />
                  Sample
                </Button>
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleClear}
                  disabled={!text}
                  title="Clear text"
                >
                  <Trash2 className="size-3.5 text-destructive" />
                  Clear
                </Button>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              <Textarea
                placeholder="Paste or write your text here to count words, characters, and sentences..."
                className="min-h-72 font-mono text-sm leading-relaxed"
                value={text}
                onChange={(e) => setText(e.target.value)}
              />

              <div className="flex flex-wrap items-center justify-between gap-2 pt-2">
                {/* Text transformation options */}
                <div className="flex flex-wrap items-center gap-1.5 text-xs">
                  <span className="mr-1 text-muted-foreground">Transform:</span>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!text}
                    onClick={() => handleTransform("uppercase")}
                  >
                    UPPER
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!text}
                    onClick={() => handleTransform("lowercase")}
                  >
                    lower
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!text}
                    onClick={() => handleTransform("titlecase")}
                  >
                    Title Case
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!text}
                    onClick={() => handleTransform("sentencecase")}
                  >
                    Sentence case
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!text}
                    onClick={() => handleTransform("remove-extra-spaces")}
                  >
                    Clean Spaces
                  </Button>
                  <Button
                    variant="outline"
                    size="xs"
                    disabled={!text}
                    onClick={() => handleTransform("remove-empty-lines")}
                  >
                    Clean Lines
                  </Button>
                </div>

                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    disabled={!text}
                    onClick={handleDownload}
                  >
                    <Download className="size-3.5" />
                    Download .txt
                  </Button>
                  <Button
                    size="sm"
                    disabled={!text}
                    onClick={handleCopy}
                  >
                    {copied ? (
                      <>
                        <Check className="size-3.5 text-emerald-500" />
                        Copied
                      </>
                    ) : (
                      <>
                        <Copy className="size-3.5" />
                        Copy Text
                      </>
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Analytics (1 column on lg) */}
        <div className="flex flex-col gap-4">
          {/* Reading & Speaking Times */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">Estimates & Summary</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3 text-sm">
              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Clock className="size-4 text-primary" />
                  <span>Reading Time</span>
                </div>
                <span className="font-semibold text-foreground">
                  {formatDuration(stats.readingTimeMinutes)}
                </span>
              </div>

              <div className="flex items-center justify-between rounded-lg border border-border bg-muted/30 p-2.5">
                <div className="flex items-center gap-2 text-muted-foreground">
                  <Mic className="size-4 text-emerald-600 dark:text-emerald-400" />
                  <span>Speaking Time</span>
                </div>
                <span className="font-semibold text-foreground">
                  {formatDuration(stats.speakingTimeMinutes)}
                </span>
              </div>

              <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                <span>Avg. Word Length:</span>
                <span className="font-mono font-medium text-foreground">
                  {stats.averageWordLength} chars
                </span>
              </div>

              {stats.longestWord && (
                <div className="flex items-center justify-between px-1 text-xs text-muted-foreground">
                  <span>Longest Word:</span>
                  <span
                    className="max-w-[140px] truncate font-mono font-medium text-foreground"
                    title={stats.longestWord}
                  >
                    {stats.longestWord}
                  </span>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Word Frequency & Density */}
          <Card className="flex flex-col">
            <CardHeader className="pb-2">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-1.5">
                  <BarChart2 className="size-4 text-muted-foreground" />
                  <CardTitle className="text-sm font-semibold">Keyword Density</CardTitle>
                </div>
                <Badge variant="secondary" className="text-xs">
                  Top {frequencies.length}
                </Badge>
              </div>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <Label htmlFor={switchId} className="cursor-pointer text-xs text-muted-foreground">
                  Filter common stop words
                </Label>
                <Switch
                  id={switchId}
                  checked={excludeStopWords}
                  onCheckedChange={setExcludeStopWords}
                />
              </div>

              {frequencies.length === 0 ? (
                <div className="py-6 text-center text-xs text-muted-foreground">
                  {text ? "No matching keywords found." : "Enter text to view keyword density."}
                </div>
              ) : (
                <div className="flex flex-col gap-2">
                  {frequencies.map((item) => (
                    <div
                      key={item.word}
                      className="flex items-center justify-between text-xs"
                    >
                      <span className="font-medium text-foreground">{item.word}</span>
                      <div className="flex items-center gap-2">
                        <span className="text-muted-foreground">
                          {item.count} {item.count === 1 ? "time" : "times"}
                        </span>
                        <Badge variant="outline" className="font-mono text-[11px]">
                          {item.percentage}%
                        </Badge>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
