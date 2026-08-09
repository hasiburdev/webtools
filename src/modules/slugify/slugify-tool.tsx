"use client";

import { useState } from "react";
import { Copy, Check, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

import { slugify, describeSlug, type SlugifyOptions } from "./slugify";

const SEPARATORS: { value: SlugifyOptions["separator"]; label: string }[] = [
  { value: "-", label: "─ Hyphen" },
  { value: "_", label: "_ Underscore" },
];

export function SlugifyTool() {
  const [input, setInput] = useState("");
  const [copied, setCopied] = useState(false);
  const [options, setOptions] = useState<SlugifyOptions>({
    separator: "-",
    lowercase: true,
  });

  const slug = slugify(input, options);
  const hasOutput = slug.length > 0;
  const summary = describeSlug(input, slug);

  const copy = async () => {
    if (!slug) return;
    await navigator.clipboard.writeText(slug);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const setOption = <K extends keyof SlugifyOptions>(
    key: K,
    value: SlugifyOptions[K],
  ) => setOptions((prev) => ({ ...prev, [key]: value }));

  return (
    <Card className="w-full">
      <CardHeader>
        <CardTitle className="text-base font-semibold">Slugify Text</CardTitle>
      </CardHeader>

      <CardContent className="flex flex-col gap-6">
        {/* ── Input ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Input</Label>
            <div className="flex items-center gap-3">
              {input.length > 0 && (
                <span className="text-xs text-muted-foreground">
                  {input.length} chars
                </span>
              )}
              {input.length > 0 && (
                <button
                  onClick={() => setInput("")}
                  className="flex items-center gap-1 text-xs text-muted-foreground transition-colors hover:text-foreground"
                  aria-label="Clear input"
                >
                  <X className="size-3" />
                  Clear
                </button>
              )}
            </div>
          </div>
          <Textarea
            className="min-h-28 resize-y font-mono"
            placeholder="Paste or type text here… e.g. Hello, World!"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            autoFocus
          />
        </div>

        <div className="h-px bg-border" />

        {/* ── Options ── */}
        <div className="flex flex-col gap-4">
          <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            Options
          </p>

          {/* Separator */}
          <div className="flex items-center justify-between gap-4">
            <Label>Separator</Label>
            <div className="flex border border-border">
              {SEPARATORS.map(({ value, label }, i) => (
                <button
                  key={value}
                  onClick={() => setOption("separator", value)}
                  className={cn(
                    "flex h-8 items-center px-3 font-mono text-xs font-medium transition-colors",
                    i < SEPARATORS.length - 1 && "border-r border-border",
                    options.separator === value
                      ? "bg-primary text-primary-foreground"
                      : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                  )}
                >
                  {label}
                </button>
              ))}
            </div>
          </div>

          {/* Lowercase */}
          <div className="flex items-center justify-between">
            <div className="flex flex-col gap-0.5">
              <Label htmlFor="toggle-lowercase" className="cursor-pointer font-medium">
                Lowercase
              </Label>
              <span className="text-xs text-muted-foreground">
                Convert all characters to lowercase
              </span>
            </div>
            <Switch
              id="toggle-lowercase"
              checked={options.lowercase}
              onCheckedChange={(checked) => setOption("lowercase", checked)}
            />
          </div>
        </div>

        <div className="h-px bg-border" />

        {/* ── Output ── */}
        <div className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <Label>Slug</Label>
            {hasOutput && (
              <span className="text-xs text-muted-foreground">
                {slug.length} chars
              </span>
            )}
          </div>

          <div className="flex items-stretch gap-2">
            <div
              className={cn(
                "flex min-h-10 flex-1 items-center break-all border border-border px-4 py-3 font-mono text-sm",
                hasOutput ? "bg-muted" : "bg-muted/40",
              )}
            >
              {hasOutput ? (
                slug
              ) : (
                <span className="italic text-muted-foreground">
                  {input.length > 0
                    ? "No sluggable characters found"
                    : "Your slug will appear here"}
                </span>
              )}
            </div>
            <Button
              variant="outline"
              size="icon"
              onClick={copy}
              disabled={!hasOutput}
              aria-label="Copy slug"
            >
              {copied ? (
                <Check className="size-4 text-emerald-500" />
              ) : (
                <Copy className="size-4" />
              )}
            </Button>
          </div>

          {/* Summary */}
          {summary && (
            <p className="text-xs text-muted-foreground">{summary}</p>
          )}
        </div>
      </CardContent>
    </Card>
  );
}
