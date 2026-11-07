"use client";

import { useState, useRef, useMemo, useEffect } from "react";
import {
  Download,
  Copy,
  Check,
  Sparkles,
  Sliders,
  Type,
  Palette,
  Maximize2,
  Lock,
  Unlock,
  Layers,
  FileCode,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type {
  ThumbnailConfig,
  ThumbnailPreset,
  PatternType,
  BackgroundStyle,
  FontFamily,
} from "./types";
import {
  THUMBNAIL_PRESETS,
  generateSvgMarkup,
  renderThumbnailToCanvas,
  downloadBlob,
} from "./thumbnail-utils";

export function PlaceholderThumbnailGenerator() {
  const [config, setConfig] = useState<ThumbnailConfig>({
    width: 1200,
    height: 630,
    backgroundStyle: "gradient",
    bgColor1: "#1e293b", // slate-800
    bgColor2: "#0f172a", // slate-900
    gradientAngle: 135,
    textColor: "#f8fafc",
    title: "",
    subtitle: "Preview Placeholder",
    fontFamily: "sans",
    fontSize: 0,
    pattern: "grid",
    patternOpacity: 0.15,
    borderWidth: 0,
    borderColor: "#3b82f6",
  });

  const [aspectRatioLocked, setAspectRatioLocked] = useState<boolean>(false);
  const [lockedRatio, setLockedRatio] = useState<number>(1200 / 630);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const hiddenCanvasRef = useRef<HTMLCanvasElement>(null);

  // Computed SVG markup
  const svgMarkup = useMemo(() => generateSvgMarkup(config), [config]);
  const svgDataUri = useMemo(() => {
    return `data:image/svg+xml;charset=utf-8,${encodeURIComponent(svgMarkup)}`;
  }, [svgMarkup]);

  const handleWidthChange = (newWidth: number) => {
    const w = Math.max(10, Math.min(newWidth, 4000));
    if (aspectRatioLocked && lockedRatio > 0) {
      const h = Math.round(w / lockedRatio);
      setConfig((prev) => ({ ...prev, width: w, height: h }));
    } else {
      setConfig((prev) => ({ ...prev, width: w }));
    }
  };

  const handleHeightChange = (newHeight: number) => {
    const h = Math.max(10, Math.min(newHeight, 4000));
    if (aspectRatioLocked && lockedRatio > 0) {
      const w = Math.round(h * lockedRatio);
      setConfig((prev) => ({ ...prev, width: w, height: h }));
    } else {
      setConfig((prev) => ({ ...prev, height: h }));
    }
  };

  const handleApplyPreset = (preset: ThumbnailPreset) => {
    setConfig((prev) => ({
      ...prev,
      width: preset.width,
      height: preset.height,
    }));
    setLockedRatio(preset.width / preset.height);
  };

  const toggleAspectRatioLock = () => {
    if (!aspectRatioLocked) {
      setLockedRatio(config.width / config.height);
    }
    setAspectRatioLocked(!aspectRatioLocked);
  };

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPng = async () => {
    if (!hiddenCanvasRef.current) return;
    await renderThumbnailToCanvas(hiddenCanvasRef.current, config);
    hiddenCanvasRef.current.toBlob((blob) => {
      if (blob) {
        downloadBlob(
          blob,
          `placeholder-${config.width}x${config.height}.png`
        );
      }
    }, "image/png");
  };

  const handleDownloadWebp = async () => {
    if (!hiddenCanvasRef.current) return;
    await renderThumbnailToCanvas(hiddenCanvasRef.current, config);
    hiddenCanvasRef.current.toBlob(
      (blob) => {
        if (blob) {
          downloadBlob(
            blob,
            `placeholder-${config.width}x${config.height}.webp`
          );
        }
      },
      "image/webp",
      0.95
    );
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgMarkup], {
      type: "image/svg+xml;charset=utf-8",
    });
    downloadBlob(blob, `placeholder-${config.width}x${config.height}.svg`);
  };

  return (
    <div className="space-y-8">
      {/* Hidden canvas for off-screen rasterization */}
      <canvas ref={hiddenCanvasRef} className="hidden" />

      {/* Preset Quick Chips */}
      <div className="flex flex-wrap items-center gap-2 rounded-xl border border-border bg-card p-4 shadow-xs">
        <span className="flex items-center gap-1 text-xs font-semibold text-muted-foreground mr-1">
          <Sparkles className="size-3.5 text-primary" /> Popular Presets:
        </span>
        {THUMBNAIL_PRESETS.map((preset) => (
          <button
            key={preset.name}
            type="button"
            onClick={() => handleApplyPreset(preset)}
            className={`rounded-md border px-2.5 py-1 text-xs transition-colors ${
              config.width === preset.width && config.height === preset.height
                ? "border-primary bg-primary/10 text-primary font-medium"
                : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {preset.name} ({preset.width}×{preset.height})
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Side: Controls & Customization (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          {/* 1. Dimensions & Ratio */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Maximize2 className="size-4 text-primary" /> Dimensions
            </h2>

            <div className="flex items-center gap-3">
              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Width (px)</label>
                <Input
                  type="number"
                  min={10}
                  max={4000}
                  value={config.width}
                  onChange={(e) =>
                    handleWidthChange(parseInt(e.target.value, 10) || 100)
                  }
                  className="font-mono text-xs"
                />
              </div>

              <button
                type="button"
                onClick={toggleAspectRatioLock}
                title={
                  aspectRatioLocked
                    ? "Unlock aspect ratio"
                    : "Lock aspect ratio"
                }
                className={`mt-5 rounded-lg border p-2 transition-colors ${
                  aspectRatioLocked
                    ? "border-primary bg-primary/10 text-primary"
                    : "border-border text-muted-foreground hover:text-foreground"
                }`}
              >
                {aspectRatioLocked ? (
                  <Lock className="size-4" />
                ) : (
                  <Unlock className="size-4" />
                )}
              </button>

              <div className="flex-1 space-y-1">
                <label className="text-xs text-muted-foreground">Height (px)</label>
                <Input
                  type="number"
                  min={10}
                  max={4000}
                  value={config.height}
                  onChange={(e) =>
                    handleHeightChange(parseInt(e.target.value, 10) || 100)
                  }
                  className="font-mono text-xs"
                />
              </div>
            </div>
          </div>

          {/* 2. Text & Typography */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Type className="size-4 text-primary" /> Label & Typography
            </h2>

            <div className="space-y-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Title Text</label>
                <Input
                  type="text"
                  placeholder={`${config.width} × ${config.height}`}
                  value={config.title}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, title: e.target.value }))
                  }
                  className="text-xs"
                />
              </div>

              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Subtitle Text</label>
                <Input
                  type="text"
                  placeholder="Optional secondary text"
                  value={config.subtitle}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, subtitle: e.target.value }))
                  }
                  className="text-xs"
                />
              </div>

              <div className="grid grid-cols-2 gap-3 pt-1">
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Font Family</label>
                  <select
                    value={config.fontFamily}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        fontFamily: e.target.value as FontFamily,
                      }))
                    }
                    className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                  >
                    <option value="sans">Sans-serif</option>
                    <option value="serif">Serif</option>
                    <option value="mono">Monospace</option>
                  </select>
                </div>

                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Text Color</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.textColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          textColor: e.target.value,
                        }))
                      }
                      className="size-7 rounded border border-border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.textColor}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          textColor: e.target.value,
                        }))
                      }
                      className="h-7 font-mono text-xs"
                    />
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* 3. Background & Pattern */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Palette className="size-4 text-primary" /> Colors & Patterns
            </h2>

            {/* Background Style Switcher */}
            <div className="flex rounded-lg bg-muted p-1 text-xs">
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({ ...prev, backgroundStyle: "solid" }))
                }
                className={`flex-1 rounded py-1 font-medium transition-all ${
                  config.backgroundStyle === "solid"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Solid Color
              </button>
              <button
                type="button"
                onClick={() =>
                  setConfig((prev) => ({ ...prev, backgroundStyle: "gradient" }))
                }
                className={`flex-1 rounded py-1 font-medium transition-all ${
                  config.backgroundStyle === "gradient"
                    ? "bg-background text-foreground shadow-xs"
                    : "text-muted-foreground hover:text-foreground"
                }`}
              >
                Linear Gradient
              </button>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div className="space-y-1">
                <label className="text-xs text-muted-foreground">Color 1</label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={config.bgColor1}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        bgColor1: e.target.value,
                      }))
                    }
                    className="size-7 rounded border border-border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.bgColor1}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        bgColor1: e.target.value,
                      }))
                    }
                    className="h-7 font-mono text-xs"
                  />
                </div>
              </div>

              {config.backgroundStyle === "gradient" && (
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Color 2</label>
                  <div className="flex items-center gap-2">
                    <input
                      type="color"
                      value={config.bgColor2}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          bgColor2: e.target.value,
                        }))
                      }
                      className="size-7 rounded border border-border cursor-pointer"
                    />
                    <Input
                      type="text"
                      value={config.bgColor2}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          bgColor2: e.target.value,
                        }))
                      }
                      className="h-7 font-mono text-xs"
                    />
                  </div>
                </div>
              )}
            </div>

            {/* Pattern Overlay Selector */}
            <div className="space-y-1 pt-1">
              <label className="text-xs text-muted-foreground">Pattern Overlay</label>
              <div className="flex flex-wrap gap-1">
                {(["none", "grid", "stripes", "dots", "crosshatch"] as PatternType[]).map(
                  (pat) => (
                    <button
                      key={pat}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, pattern: pat }))
                      }
                      className={`rounded-md border px-2.5 py-1 text-xs capitalize transition-colors ${
                        config.pattern === pat
                          ? "border-primary bg-primary text-primary-foreground font-semibold"
                          : "border-border bg-background text-muted-foreground hover:bg-muted hover:text-foreground"
                      }`}
                    >
                      {pat}
                    </button>
                  )
                )}
              </div>
            </div>
          </div>
        </div>

        {/* Right Side: Live Visual Preview & Download Actions (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <span className="text-sm font-semibold text-foreground">
                  Live Preview
                </span>
                <Badge variant="outline" className="text-xs font-mono">
                  {config.width} × {config.height} px
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy("svg", svgMarkup)}
                  className="h-7 text-xs"
                >
                  {copiedKey === "svg" ? (
                    <>
                      <Check className="mr-1 size-3 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <FileCode className="mr-1 size-3" /> Copy SVG
                    </>
                  )}
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => handleCopy("dataUri", svgDataUri)}
                  className="h-7 text-xs"
                >
                  {copiedKey === "dataUri" ? (
                    <>
                      <Check className="mr-1 size-3 text-emerald-500" /> Copied
                    </>
                  ) : (
                    <>
                      <Copy className="mr-1 size-3" /> Copy Data URI
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Checkerboard viewport */}
            <div className="relative flex min-h-[380px] w-full items-center justify-center overflow-hidden rounded-xl border border-border bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:20px_20px] bg-[position:0_0,0_10px,10px_-10px,-10px_0] dark:bg-zinc-950 p-6 shadow-inner">
              <div
                className="max-h-[340px] max-w-full overflow-hidden rounded-lg shadow-2xl transition-all"
                style={{
                  aspectRatio: `${config.width} / ${config.height}`,
                }}
                dangerouslySetInnerHTML={{ __html: svgMarkup }}
              />
            </div>

            {/* Download Buttons Bar */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="text-xs text-muted-foreground">
                Exports at full native resolution ({config.width}×{config.height})
              </div>

              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadSvg}
                  className="h-8 gap-1 text-xs"
                >
                  <Download className="size-3.5" /> Download SVG
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleDownloadWebp}
                  className="h-8 gap-1 text-xs"
                >
                  <Download className="size-3.5" /> Download WebP
                </Button>
                <Button
                  size="sm"
                  onClick={handleDownloadPng}
                  className="h-8 gap-1 text-xs font-semibold"
                >
                  <Download className="size-3.5" /> Download PNG
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
