"use client";

import { useState, useId, useMemo, useEffect } from "react";
import {
  Copy,
  Check,
  Trash2,
  ArrowUpDown,
  Plus,
  Sparkles,
  AlertCircle,
  ExternalLink,
  Sliders,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import type {
  EncodeMode,
  EncodingStandard,
  SpaceEncoding,
  QueryParamItem,
  ParsedUrlBreakdown,
} from "./types";
import {
  encodeUrlText,
  decodeUrlText,
  parseUrlBreakdown,
  buildUrlFromBreakdown,
} from "./url-utils";

const SAMPLE_URLS = [
  {
    name: "OAuth Redirect",
    value:
      "https://auth.example.com/oauth/authorize?client_id=web-app-123&redirect_uri=https%3A%2F%2Fmyapp.dev%2Fcallback&response_type=code&scope=openid%20profile%20email&state=xyz%2B987%3D",
  },
  {
    name: "Search Query with Symbols",
    value:
      "https://www.google.com/search?q=Next.js+16+%26+React+19+%23best-practices%21&hl=en&gl=us",
  },
  {
    name: "Complex Query Parameters",
    value:
      "https://api.shop.com/v1/products?category=apparel%20%26%20shoes&sort=price_desc&filter=%7B%22color%22%3A%22navy%20blue%22%2C%22min%22%3A50%7D&page=1&limit=20",
  },
  {
    name: "Plain Text String",
    value: "Hello World! @# WebTools — Privacy-First & 100% Client-Side 🚀",
  },
];

export function UrlEncoderDecoder() {
  const [mode, setMode] = useState<EncodeMode>("encode");
  const [standard, setStandard] = useState<EncodingStandard>("component");
  const [spaceRule, setSpaceRule] = useState<SpaceEncoding>("percent");
  const [input, setInput] = useState<string>(
    "https://api.example.com/v1/search?query=hello world & fast dev=true&category=tools#results"
  );
  const [copied, setCopied] = useState<boolean>(false);

  // Parsed breakdown state for the interactive table
  const [urlBreakdown, setUrlBreakdown] = useState<ParsedUrlBreakdown>({
    isValidUrl: false,
    params: [],
  });

  // Calculate output based on input, mode, standard, spaceRule
  const { output, error } = useMemo(() => {
    if (mode === "encode") {
      return encodeUrlText(input, standard, spaceRule);
    } else {
      return decodeUrlText(input, standard, spaceRule);
    }
  }, [input, mode, standard, spaceRule]);

  // Synchronize breakdown whenever input changes
  useEffect(() => {
    const textToParse = mode === "encode" ? input : (output || input);
    const parsed = parseUrlBreakdown(textToParse);
    setUrlBreakdown(parsed);
  }, [input, output, mode]);

  const handleCopy = async () => {
    if (!output) return;
    await navigator.clipboard.writeText(output);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleSwap = () => {
    if (!output) return;
    setInput(output);
    setMode((prev) => (prev === "encode" ? "decode" : "encode"));
  };

  const handleClear = () => {
    setInput("");
  };

  const handleUpdateParamKey = (id: string, newKey: string) => {
    const updated = urlBreakdown.params.map((p) =>
      p.id === id ? { ...p, key: newKey } : p
    );
    setUrlBreakdown((prev) => ({ ...prev, params: updated }));
    const newUrl = buildUrlFromBreakdown(urlBreakdown, updated);
    if (mode === "encode") {
      setInput(newUrl);
    }
  };

  const handleUpdateParamValue = (id: string, newVal: string) => {
    const updated = urlBreakdown.params.map((p) =>
      p.id === id ? { ...p, value: newVal } : p
    );
    setUrlBreakdown((prev) => ({ ...prev, params: updated }));
    const newUrl = buildUrlFromBreakdown(urlBreakdown, updated);
    if (mode === "encode") {
      setInput(newUrl);
    }
  };

  const handleToggleParam = (id: string) => {
    const updated = urlBreakdown.params.map((p) =>
      p.id === id ? { ...p, enabled: !p.enabled } : p
    );
    setUrlBreakdown((prev) => ({ ...prev, params: updated }));
    const newUrl = buildUrlFromBreakdown(urlBreakdown, updated);
    if (mode === "encode") {
      setInput(newUrl);
    }
  };

  const handleDeleteParam = (id: string) => {
    const updated = urlBreakdown.params.filter((p) => p.id !== id);
    setUrlBreakdown((prev) => ({ ...prev, params: updated }));
    const newUrl = buildUrlFromBreakdown(urlBreakdown, updated);
    if (mode === "encode") {
      setInput(newUrl);
    }
  };

  const handleAddParam = () => {
    const newParam: QueryParamItem = {
      id: Math.random().toString(36).slice(2, 9),
      key: `param_${urlBreakdown.params.length + 1}`,
      value: "",
      enabled: true,
    };
    const updated = [...urlBreakdown.params, newParam];
    setUrlBreakdown((prev) => ({ ...prev, params: updated }));
    const newUrl = buildUrlFromBreakdown(urlBreakdown, updated);
    if (mode === "encode") {
      setInput(newUrl);
    }
  };

  const inputBytes = new Blob([input]).size;
  const outputBytes = new Blob([output]).size;

  return (
    <div className="space-y-8">
      {/* Top Controls: Mode, Standard, Space Encoding */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        {/* Encode / Decode Mode Tabs */}
        <div className="flex rounded-lg bg-muted p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("encode")}
            className={`rounded-md px-4 py-1.5 transition-all ${
              mode === "encode"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Encode
          </button>
          <button
            type="button"
            onClick={() => setMode("decode")}
            className={`rounded-md px-4 py-1.5 transition-all ${
              mode === "decode"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            Decode
          </button>
        </div>

        {/* Encoding Scheme Selector */}
        <div className="flex flex-wrap items-center gap-2">
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 text-xs">
            <button
              type="button"
              onClick={() => setStandard("component")}
              className={`rounded px-2.5 py-1 transition-all ${
                standard === "component"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Component
            </button>
            <button
              type="button"
              onClick={() => setStandard("full-url")}
              className={`rounded px-2.5 py-1 transition-all ${
                standard === "full-url"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Full URI
            </button>
            <button
              type="button"
              onClick={() => setStandard("base64-url")}
              className={`rounded px-2.5 py-1 transition-all ${
                standard === "base64-url"
                  ? "bg-primary text-primary-foreground font-semibold"
                  : "text-muted-foreground hover:text-foreground"
              }`}
            >
              Base64 URL
            </button>
          </div>

          {/* Space rule selector */}
          <div className="flex items-center gap-1 rounded-lg border border-border bg-background p-1 text-xs">
            <button
              type="button"
              onClick={() => setSpaceRule("percent")}
              className={`rounded px-2 py-1 transition-all ${
                spaceRule === "percent"
                  ? "bg-secondary text-secondary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Encode spaces as %20 (RFC 3986 standard)"
            >
              Space as %20
            </button>
            <button
              type="button"
              onClick={() => setSpaceRule("plus")}
              className={`rounded px-2 py-1 transition-all ${
                spaceRule === "plus"
                  ? "bg-secondary text-secondary-foreground font-medium"
                  : "text-muted-foreground hover:text-foreground"
              }`}
              title="Encode spaces as + (application/x-www-form-urlencoded)"
            >
              Space as +
            </button>
          </div>
        </div>
      </div>

      {/* Samples Bar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        <span className="flex items-center gap-1 text-muted-foreground">
          <Sparkles className="size-3.5" /> Sample inputs:
        </span>
        {SAMPLE_URLS.map((sample) => (
          <button
            key={sample.name}
            type="button"
            onClick={() => setInput(sample.value)}
            className="rounded-md border border-border bg-card px-2.5 py-1 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
          >
            {sample.name}
          </button>
        ))}
      </div>

      {/* Dual Panel Editor: Input and Output */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Input Panel */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {mode === "encode" ? "Raw Input" : "Encoded Input"}
              </span>
              <Badge variant="outline" className="text-[11px] font-normal">
                {input.length} chars · {inputBytes} B
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleClear}
                disabled={!input}
                className="h-7 px-2 text-xs text-muted-foreground hover:text-destructive"
              >
                <Trash2 className="mr-1 size-3" /> Clear
              </Button>
            </div>
          </div>

          <Textarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder={
              mode === "encode"
                ? "Enter text or URL to encode..."
                : "Paste URL-encoded string to decode..."
            }
            rows={8}
            className="font-mono text-xs resize-y"
          />
        </div>

        {/* Output Panel */}
        <div className="flex flex-col gap-2 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <span className="text-sm font-semibold text-foreground">
                {mode === "encode" ? "Encoded Output" : "Decoded Output"}
              </span>
              <Badge variant="outline" className="text-[11px] font-normal">
                {output.length} chars · {outputBytes} B
              </Badge>
            </div>
            <div className="flex items-center gap-1">
              <Button
                variant="ghost"
                size="sm"
                onClick={handleSwap}
                disabled={!output}
                className="h-7 px-2 text-xs"
                title="Swap input and output"
              >
                <ArrowUpDown className="mr-1 size-3" /> Swap
              </Button>
              <Button
                size="sm"
                onClick={handleCopy}
                disabled={!output}
                className="h-7 px-2.5 text-xs"
              >
                {copied ? (
                  <>
                    <Check className="mr-1 size-3 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <Copy className="mr-1 size-3" /> Copy
                  </>
                )}
              </Button>
            </div>
          </div>

          {error ? (
            <div className="flex flex-1 flex-col items-center justify-center rounded-lg border border-destructive/30 bg-destructive/5 p-6 text-center text-destructive">
              <AlertCircle className="mb-2 size-6" />
              <p className="text-sm font-semibold">Malformed URL string</p>
              <p className="mt-1 text-xs opacity-90">{error}</p>
            </div>
          ) : (
            <Textarea
              readOnly
              value={output}
              placeholder="Output will appear here automatically..."
              rows={8}
              className="font-mono text-xs resize-y bg-muted/40 cursor-text"
            />
          )}
        </div>
      </div>

      {/* Interactive Query Parameter Breakdown Table */}
      {urlBreakdown.params.length > 0 && (
        <div className="space-y-4 rounded-xl border border-border bg-card p-5 shadow-xs">
          <div className="flex items-center justify-between border-b border-border pb-3">
            <div>
              <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
                <Sliders className="size-4 text-primary" /> Query Parameters
                Breakdown
              </h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                Inspect, modify, or add query parameters in real-time. Changes
                will sync directly with the input.
              </p>
            </div>
            <Button
              size="sm"
              variant="outline"
              onClick={handleAddParam}
              className="h-7 text-xs"
            >
              <Plus className="mr-1 size-3" /> Add Parameter
            </Button>
          </div>

          {/* Breakdown metadata */}
          {urlBreakdown.isValidUrl && (
            <div className="flex flex-wrap items-center gap-4 rounded-lg bg-muted/50 p-3 text-xs">
              <div>
                <span className="font-semibold text-muted-foreground">
                  Host:{" "}
                </span>
                <span className="font-mono text-foreground">
                  {urlBreakdown.host}
                </span>
              </div>
              <div>
                <span className="font-semibold text-muted-foreground">
                  Path:{" "}
                </span>
                <span className="font-mono text-foreground">
                  {urlBreakdown.pathname}
                </span>
              </div>
              {urlBreakdown.hash && (
                <div>
                  <span className="font-semibold text-muted-foreground">
                    Hash:{" "}
                  </span>
                  <span className="font-mono text-foreground">
                    {urlBreakdown.hash}
                  </span>
                </div>
              )}
            </div>
          )}

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="border-b border-border bg-muted/40 text-muted-foreground">
                <tr>
                  <th className="py-2 px-3 w-10">Active</th>
                  <th className="py-2 px-3 w-1/3">Key</th>
                  <th className="py-2 px-3">Value</th>
                  <th className="py-2 px-3 w-12 text-right">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-border">
                {urlBreakdown.params.map((param) => (
                  <tr key={param.id} className="hover:bg-muted/20">
                    <td className="py-2 px-3 align-middle">
                      <input
                        type="checkbox"
                        checked={param.enabled}
                        onChange={() => handleToggleParam(param.id)}
                        className="rounded border-border text-primary focus:ring-primary size-3.5 cursor-pointer"
                      />
                    </td>
                    <td className="py-2 px-3 align-middle">
                      <Input
                        type="text"
                        value={param.key}
                        onChange={(e) =>
                          handleUpdateParamKey(param.id, e.target.value)
                        }
                        className="h-7 font-mono text-xs"
                        placeholder="key"
                      />
                    </td>
                    <td className="py-2 px-3 align-middle">
                      <Input
                        type="text"
                        value={param.value}
                        onChange={(e) =>
                          handleUpdateParamValue(param.id, e.target.value)
                        }
                        className="h-7 font-mono text-xs"
                        placeholder="value"
                      />
                    </td>
                    <td className="py-2 px-3 align-middle text-right">
                      <Button
                        variant="ghost"
                        size="icon-xs"
                        onClick={() => handleDeleteParam(param.id)}
                        className="text-muted-foreground hover:text-destructive size-6"
                      >
                        <Trash2 className="size-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}
