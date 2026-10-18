"use client";

import { useState, useRef } from "react";
import {
  Upload,
  Copy,
  Check,
  Download,
  Trash2,
  Sparkles,
  FileCode,
  Image as ImageIcon,
  AlertCircle,
  Code2,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type {
  Base64Mode,
  EncodedBase64Result,
  DecodedImageResult,
} from "./types";
import {
  processImageFile,
  parseBase64ToImage,
  downloadDataUri,
  formatBytes,
} from "./base64-utils";

// Sample 1x1 / tiny cute icon in SVG data URI format
const SAMPLE_SVG_DATA_URI =
  "data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHdpZHRoPSIxMDAiIGhlaWdodD0iMTAwIiB2aWV3Qm94PSIwIDAgMTAwIDEwMCI+PGNpcmNsZSBjeD0iNTAiIGN5PSI1MCIgcj0iNDAiIGZpbGw9IiMzYjgyZjYiLz48cGF0aCBkPSJNMzUgNTBMMTUgNTBNNTAgMzVMMzUgNTBNNjUgNTBMNTAgNjVNNTAgNjVMMzUgNTAiIHN0cm9rZT0id2hpdGUiIHN0cm9rZS13aWR0aD0iNCIgc3Ryb2tlLWxpbmVjYXA9InJvdW5kIi8+PC9zdmc+";

export function ImageToBase64Converter() {
  const [mode, setMode] = useState<Base64Mode>("image-to-base64");

  // State for Image -> Base64
  const [encodedResult, setEncodedResult] =
    useState<EncodedBase64Result | null>(null);
  const [isProcessing, setIsProcessing] = useState<boolean>(false);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // State for Base64 -> Image
  const [base64Input, setBase64Input] = useState<string>("");
  const [decodedResult, setDecodedResult] =
    useState<DecodedImageResult | null>(null);
  const [decodeError, setDecodeError] = useState<string | null>(null);

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleFileChange = async (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    if (!file.type.startsWith("image/")) {
      alert("Please upload a valid image file.");
      return;
    }

    setIsProcessing(true);
    try {
      const res = await processImageFile(file);
      setEncodedResult(res);
    } catch {
      alert("Failed to process image file.");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    handleFileChange(e.dataTransfer.files);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleLoadSampleImage = async () => {
    // Create a blob from SAMPLE_SVG_DATA_URI and process
    const res = await fetch(SAMPLE_SVG_DATA_URI);
    const blob = await res.blob();
    const file = new File([blob], "sample-icon.svg", {
      type: "image/svg+xml",
    });
    const result = await processImageFile(file);
    setEncodedResult(result);
  };

  const handleBase64InputChange = async (val: string) => {
    setBase64Input(val);
    if (!val.trim()) {
      setDecodedResult(null);
      setDecodeError(null);
      return;
    }

    try {
      const result = await parseBase64ToImage(val);
      setDecodedResult(result);
      setDecodeError(null);
    } catch (err) {
      setDecodedResult(null);
      setDecodeError(
        err instanceof Error ? err.message : "Invalid Base64 image data"
      );
    }
  };

  const handleLoadSampleBase64 = () => {
    handleBase64InputChange(SAMPLE_SVG_DATA_URI);
  };

  const handleDownloadDecodedImage = () => {
    if (!decodedResult) return;
    const extension = decodedResult.mimeType.split("/")[1] || "png";
    const filename = `decoded-image.${extension === "svg+xml" ? "svg" : extension}`;
    downloadDataUri(decodedResult.dataUri, filename);
  };

  return (
    <div className="space-y-8">
      {/* Mode Switcher */}
      <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-4 sm:flex-row sm:items-center sm:justify-between shadow-xs">
        <div className="flex rounded-lg bg-muted p-1 text-sm font-medium">
          <button
            type="button"
            onClick={() => setMode("image-to-base64")}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 transition-all ${
              mode === "image-to-base64"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <ImageIcon className="size-4 text-primary" /> Image to Base64
          </button>
          <button
            type="button"
            onClick={() => setMode("base64-to-image")}
            className={`flex items-center gap-2 rounded-md px-4 py-1.5 transition-all ${
              mode === "base64-to-image"
                ? "bg-background text-foreground shadow-xs font-semibold"
                : "text-muted-foreground hover:text-foreground"
            }`}
          >
            <Code2 className="size-4 text-primary" /> Base64 to Image
          </button>
        </div>

        <div className="text-xs text-muted-foreground">
          100% Client-Side · Zero uploads to any server
        </div>
      </div>

      {/* MODE 1: IMAGE TO BASE64 */}
      {mode === "image-to-base64" && (
        <div className="space-y-6">
          {/* Upload Dropzone */}
          {!encodedResult ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onClick={() => fileInputRef.current?.click()}
              className="group relative flex flex-col items-center justify-center rounded-2xl border-2 border-dashed border-border bg-card p-12 text-center hover:border-primary/60 hover:bg-muted/30 transition-all cursor-pointer"
            >
              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                onChange={(e) => handleFileChange(e.target.files)}
                className="sr-only"
              />

              <div className="mb-4 rounded-full bg-primary/10 p-4 text-primary group-hover:scale-110 transition-transform">
                <Upload className="size-8" />
              </div>

              <h2 className="text-base font-semibold text-foreground">
                Drop your image here, or{" "}
                <span className="text-primary underline">browse</span>
              </h2>
              <p className="mt-1 text-xs text-muted-foreground">
                Supports PNG, JPEG, WebP, SVG, GIF, AVIF, and ICO
              </p>

              <div className="mt-6 flex items-center gap-2" onClick={(e) => e.stopPropagation()}>
                <span className="text-xs text-muted-foreground">Or try:</span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSampleImage}
                  className="h-7 text-xs"
                >
                  <Sparkles className="mr-1 size-3 text-primary" /> Load Sample SVG
                </Button>
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Header preview & stats */}
              <div className="flex flex-col gap-6 rounded-xl border border-border bg-card p-6 shadow-xs lg:flex-row lg:items-center lg:justify-between">
                <div className="flex items-center gap-5">
                  {/* Thumbnail with checkerboard for transparency */}
                  <div className="relative size-20 shrink-0 overflow-hidden rounded-lg border border-border bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] dark:bg-zinc-900">
                    {/* eslint-disable-next-line @next/next/no-img-element */}
                    <img
                      src={encodedResult.dataUri}
                      alt={encodedResult.metadata.name}
                      className="size-full object-contain p-1"
                    />
                  </div>

                  <div>
                    <h2 className="font-semibold text-foreground text-sm truncate max-w-[280px] sm:max-w-md">
                      {encodedResult.metadata.name}
                    </h2>
                    <div className="mt-1.5 flex flex-wrap gap-2 text-xs">
                      <Badge variant="secondary">
                        {encodedResult.metadata.type}
                      </Badge>
                      {encodedResult.metadata.width &&
                        encodedResult.metadata.height && (
                          <Badge variant="outline">
                            {encodedResult.metadata.width} ×{" "}
                            {encodedResult.metadata.height} px
                          </Badge>
                        )}
                      <Badge variant="outline">
                        Binary: {formatBytes(encodedResult.metadata.sizeBytes)}
                      </Badge>
                      <Badge variant="outline">
                        Base64: {formatBytes(encodedResult.base64Bytes)}
                      </Badge>
                    </div>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex flex-wrap items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      const blob = new Blob([encodedResult.dataUri], {
                        type: "text/plain",
                      });
                      const url = URL.createObjectURL(blob);
                      const a = document.createElement("a");
                      a.href = url;
                      a.download = `${encodedResult.metadata.name}.base64.txt`;
                      a.click();
                      URL.revokeObjectURL(url);
                    }}
                    className="h-8 text-xs"
                  >
                    <Download className="mr-1 size-3.5" /> Download .txt
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setEncodedResult(null)}
                    className="h-8 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="mr-1 size-3.5" /> Clear
                  </Button>
                </div>
              </div>

              {/* Snippets Cards */}
              <div className="space-y-4">
                {/* 1. Data URI */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileCode className="size-3.5 text-primary" /> Full Data URI
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCopy("dataUri", encodedResult.dataUri)
                      }
                      className="h-7 px-2.5 text-xs"
                    >
                      {copiedKey === "dataUri" ? (
                        <>
                          <Check className="mr-1 size-3 text-emerald-500" />{" "}
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 size-3" /> Copy Data URI
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    rows={3}
                    value={encodedResult.dataUri}
                    className="font-mono text-xs bg-muted/40"
                  />
                </div>

                {/* 2. HTML <img> Snippet */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <Code2 className="size-3.5 text-primary" /> HTML &lt;img&gt;
                      Snippet
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCopy("html", encodedResult.htmlSnippet)
                      }
                      className="h-7 px-2.5 text-xs"
                    >
                      {copiedKey === "html" ? (
                        <>
                          <Check className="mr-1 size-3 text-emerald-500" />{" "}
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 size-3" /> Copy HTML
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    rows={2}
                    value={encodedResult.htmlSnippet}
                    className="font-mono text-xs bg-muted/40"
                  />
                </div>

                {/* 3. CSS background-image Snippet */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileText className="size-3.5 text-primary" /> CSS
                      background-image Snippet
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCopy("css", encodedResult.cssSnippet)
                      }
                      className="h-7 px-2.5 text-xs"
                    >
                      {copiedKey === "css" ? (
                        <>
                          <Check className="mr-1 size-3 text-emerald-500" />{" "}
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 size-3" /> Copy CSS
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    rows={2}
                    value={encodedResult.cssSnippet}
                    className="font-mono text-xs bg-muted/40"
                  />
                </div>

                {/* 4. Raw Base64 string */}
                <div className="rounded-xl border border-border bg-card p-4 shadow-xs space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-semibold text-foreground flex items-center gap-1.5">
                      <FileCode className="size-3.5 text-primary" /> Raw Base64
                      String (without prefix)
                    </span>
                    <Button
                      size="sm"
                      variant="outline"
                      onClick={() =>
                        handleCopy("raw", encodedResult.rawBase64)
                      }
                      className="h-7 px-2.5 text-xs"
                    >
                      {copiedKey === "raw" ? (
                        <>
                          <Check className="mr-1 size-3 text-emerald-500" />{" "}
                          Copied
                        </>
                      ) : (
                        <>
                          <Copy className="mr-1 size-3" /> Copy Raw Base64
                        </>
                      )}
                    </Button>
                  </div>
                  <Textarea
                    readOnly
                    rows={3}
                    value={encodedResult.rawBase64}
                    className="font-mono text-xs bg-muted/40"
                  />
                </div>
              </div>
            </div>
          )}
        </div>
      )}

      {/* MODE 2: BASE64 TO IMAGE */}
      {mode === "base64-to-image" && (
        <div className="space-y-6">
          <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 shadow-xs">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-sm font-semibold text-foreground">
                  Paste Base64 or Data URI
                </h2>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Paste raw Base64 or `data:image/...;base64,...` string to
                  preview and download.
                </p>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLoadSampleBase64}
                  className="h-7 text-xs"
                >
                  <Sparkles className="mr-1 size-3 text-primary" /> Sample
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => handleBase64InputChange("")}
                  disabled={!base64Input}
                  className="h-7 text-xs text-muted-foreground hover:text-destructive"
                >
                  <Trash2 className="mr-1 size-3" /> Clear
                </Button>
              </div>
            </div>

            <Textarea
              value={base64Input}
              onChange={(e) => handleBase64InputChange(e.target.value)}
              placeholder="Paste data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAA... or raw Base64 string here"
              rows={6}
              className="font-mono text-xs resize-y"
            />
          </div>

          {/* Decoded Image Output */}
          {decodeError && (
            <div className="flex items-center gap-2 rounded-xl border border-destructive/30 bg-destructive/5 p-4 text-xs text-destructive">
              <AlertCircle className="size-4 shrink-0" />
              <span>{decodeError}</span>
            </div>
          )}

          {decodedResult && (
            <div className="flex flex-col items-center justify-center rounded-2xl border border-border bg-card p-8 shadow-xs space-y-6">
              {/* Image Preview Container with checkerboard background */}
              <div className="relative max-h-[400px] max-w-full overflow-hidden rounded-xl border border-border bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] dark:bg-zinc-900 p-4 shadow-inner flex items-center justify-center">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={decodedResult.dataUri}
                  alt="Decoded result"
                  className="max-h-[350px] max-w-full object-contain rounded"
                />
              </div>

              {/* Metadata tags */}
              <div className="flex flex-wrap items-center justify-center gap-3 text-xs">
                <Badge variant="secondary">{decodedResult.mimeType}</Badge>
                {decodedResult.width && decodedResult.height && (
                  <Badge variant="outline">
                    {decodedResult.width} × {decodedResult.height} px
                  </Badge>
                )}
                <Badge variant="outline">
                  Est. Size: {formatBytes(decodedResult.sizeBytes)}
                </Badge>
              </div>

              {/* Download Button */}
              <Button
                onClick={handleDownloadDecodedImage}
                className="gap-2 px-6"
              >
                <Download className="size-4" /> Download Decoded Image
              </Button>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
