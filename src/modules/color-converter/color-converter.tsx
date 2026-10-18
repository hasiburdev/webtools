"use client";

import { useState, useMemo } from "react";
import {
  Copy,
  Check,
  Pipette,
  Sparkles,
  Sliders,
  CheckCircle2,
  XCircle,
  HelpCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import { parseAnyColor, convertColor } from "./color-converter-utils";
import { calculateContrast, rgbaToHex } from "../color-picker/color-math";
import type { RGBA } from "../color-picker/types";

const COLOR_PRESETS = [
  { name: "Slate 500", hex: "#64748b" },
  { name: "Red 500", hex: "#ef4444" },
  { name: "Amber 500", hex: "#f59e0b" },
  { name: "Emerald 500", hex: "#10b981" },
  { name: "Sky 500", hex: "#0ea5e9" },
  { name: "Blue 500", hex: "#3b82f6" },
  { name: "Violet 500", hex: "#8b5cf6" },
  { name: "Fuchsia 500", hex: "#d946ef" },
  { name: "Rose 500", hex: "#f43f5e" },
  { name: "GitHub Dark", hex: "#0d1117" },
  { name: "Discord", hex: "#5865f2" },
  { name: "Papayawhip", hex: "#ffefd5" },
  { name: "Rebeccapurple", hex: "#663399" },
];

export function ColorConverter() {
  const [rgba, setRgba] = useState<RGBA>({ r: 59, g: 130, b: 246, a: 1 }); // Default Tailwind blue-500
  const [rawInput, setRawInput] = useState<string>("#3b82f6");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const conversion = useMemo(() => convertColor(rgba), [rgba]);
  const contrast = useMemo(() => calculateContrast(rgba), [rgba]);

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleRawInputChange = (val: string) => {
    setRawInput(val);
    const parsed = parseAnyColor(val);
    if (parsed) {
      setRgba(parsed);
    }
  };

  const handleNativeColorPick = (e: React.ChangeEvent<HTMLInputElement>) => {
    const hex = e.target.value;
    const parsed = parseAnyColor(hex);
    if (parsed) {
      setRgba({ ...parsed, a: rgba.a });
      setRawInput(hex);
    }
  };

  const handleSelectPreset = (hex: string) => {
    const parsed = parseAnyColor(hex);
    if (parsed) {
      setRgba(parsed);
      setRawInput(hex);
    }
  };

  const formatsList = [
    { label: "HEX", value: conversion.hex, code: conversion.hex },
    { label: "HEX with Alpha", value: conversion.hexa, code: conversion.hexa },
    { label: "RGB", value: conversion.rgb, code: conversion.rgb },
    { label: "RGBA", value: conversion.rgba, code: conversion.rgba },
    { label: "HSL", value: conversion.hsl, code: conversion.hsl },
    { label: "HSLA", value: conversion.hsla, code: conversion.hsla },
    { label: "HSV", value: conversion.hsv, code: conversion.hsv },
    { label: "CMYK", value: conversion.cmyk, code: conversion.cmyk },
    {
      label: "CSS Name",
      value: conversion.cssName ?? "None (No standard CSS keyword)",
      code: conversion.cssName ?? conversion.hex,
    },
    {
      label: "CSS Background Snippet",
      value: `background-color: ${conversion.rgba};`,
      code: `background-color: ${conversion.rgba};`,
    },
  ];

  return (
    <div className="space-y-8">
      {/* Omni-Input Box & Presets */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <div>
          <label
            htmlFor="color-omni-input"
            className="text-sm font-semibold text-foreground block mb-1"
          >
            Universal Color Input
          </label>
          <p className="text-xs text-muted-foreground mb-3">
            Type or paste any format: Hex (`#ff0080`), RGB (`rgb(255, 0, 128)`),
            HSL (`hsl(330, 100%, 50%)`), HSV, CMYK, or a CSS name (`crimson`).
          </p>
          <div className="flex gap-2">
            <div className="relative flex-1">
              <Input
                id="color-omni-input"
                type="text"
                value={rawInput}
                onChange={(e) => handleRawInputChange(e.target.value)}
                placeholder="e.g. #3b82f6 or rgb(59, 130, 246) or crimson"
                className="font-mono text-sm pr-10"
              />
              <div
                className="absolute right-2 top-1/2 -translate-y-1/2 size-6 rounded-md border border-border/80 shadow-xs"
                style={{ backgroundColor: conversion.hex }}
              />
            </div>

            <label className="relative inline-flex items-center justify-center rounded-lg border border-border bg-background px-3 py-2 text-xs font-medium cursor-pointer hover:bg-muted transition-colors">
              <Pipette className="mr-1.5 size-4 text-primary" />
              <span>Native Picker</span>
              <input
                type="color"
                value={conversion.hex}
                onChange={handleNativeColorPick}
                className="sr-only"
              />
            </label>
          </div>
        </div>

        {/* Quick presets */}
        <div>
          <span className="text-xs font-medium text-muted-foreground block mb-2">
            Quick Presets:
          </span>
          <div className="flex flex-wrap gap-1.5">
            {COLOR_PRESETS.map((p) => (
              <button
                key={p.hex}
                type="button"
                onClick={() => handleSelectPreset(p.hex)}
                className="group flex items-center gap-1.5 rounded-md border border-border bg-background px-2.5 py-1 text-xs hover:border-foreground/30 transition-all"
              >
                <span
                  className="size-3.5 rounded-full border border-black/10 shadow-xs"
                  style={{ backgroundColor: p.hex }}
                />
                <span className="text-muted-foreground group-hover:text-foreground">
                  {p.name}
                </span>
              </button>
            ))}
          </div>
        </div>
      </div>

      {/* Hero Visual Preview & WCAG Contrast Assessment */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
        {/* Large Color Card */}
        <div
          className="relative flex flex-col justify-between overflow-hidden rounded-xl border border-border p-6 shadow-sm min-h-[220px]"
          style={{ backgroundColor: conversion.rgba }}
        >
          {/* Top details */}
          <div className="flex items-start justify-between">
            <span
              className="rounded-md px-2.5 py-1 font-mono text-xs font-semibold backdrop-blur-md"
              style={{
                color: contrast.bestTextColor,
                backgroundColor:
                  contrast.bestTextColor === "#ffffff"
                    ? "rgba(0, 0, 0, 0.4)"
                    : "rgba(255, 255, 255, 0.6)",
              }}
            >
              {conversion.cssName ? conversion.cssName.toUpperCase() : "CUSTOM"}
            </span>

            <span
              className="font-mono text-xs backdrop-blur-md px-2 py-0.5 rounded"
              style={{
                color: contrast.bestTextColor,
                backgroundColor:
                  contrast.bestTextColor === "#ffffff"
                    ? "rgba(0, 0, 0, 0.3)"
                    : "rgba(255, 255, 255, 0.5)",
              }}
            >
              Alpha: {Math.round(rgba.a * 100)}%
            </span>
          </div>

          {/* Bottom color codes */}
          <div>
            <div
              className="font-mono text-3xl font-extrabold tracking-tight"
              style={{ color: contrast.bestTextColor }}
            >
              {conversion.hex}
            </div>
            <div
              className="font-mono text-sm opacity-90 mt-1"
              style={{ color: contrast.bestTextColor }}
            >
              {conversion.rgb}
            </div>
          </div>
        </div>

        {/* WCAG 2.1 Contrast Details (White & Black) */}
        <div className="flex flex-col justify-between rounded-xl border border-border bg-card p-5 shadow-xs lg:col-span-2">
          <div>
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> WCAG 2.1 Contrast
              Analysis
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5 mb-4">
              Real-time readability scores against standard white and black
              backgrounds.
            </p>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {/* White Background Test */}
              <div className="rounded-lg border border-border bg-white p-4 text-black shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-600">
                    On Pure White (#fff)
                  </span>
                  <span className="font-mono text-sm font-bold">
                    {contrast.ratioWithWhite}:1
                  </span>
                </div>
                <div
                  className="rounded-md p-2 text-center text-sm font-bold"
                  style={{ backgroundColor: conversion.hex, color: "#ffffff" }}
                >
                  White text on color
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    {contrast.aaNormalWhite ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="size-3.5 text-rose-500" />
                    )}
                    AA Normal
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    {contrast.aaaNormalWhite ? (
                      <CheckCircle2 className="size-3.5 text-emerald-600" />
                    ) : (
                      <XCircle className="size-3.5 text-rose-500" />
                    )}
                    AAA
                  </span>
                </div>
              </div>

              {/* Black Background Test */}
              <div className="rounded-lg border border-zinc-800 bg-zinc-950 p-4 text-white shadow-xs space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-semibold text-zinc-400">
                    On Pure Black (#000)
                  </span>
                  <span className="font-mono text-sm font-bold">
                    {contrast.ratioWithBlack}:1
                  </span>
                </div>
                <div
                  className="rounded-md p-2 text-center text-sm font-bold"
                  style={{ backgroundColor: conversion.hex, color: "#000000" }}
                >
                  Black text on color
                </div>
                <div className="flex items-center gap-2 pt-1 text-xs">
                  <span className="flex items-center gap-1 font-medium">
                    {contrast.aaNormalBlack ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="size-3.5 text-rose-400" />
                    )}
                    AA Normal
                  </span>
                  <span className="flex items-center gap-1 font-medium">
                    {contrast.aaaNormalBlack ? (
                      <CheckCircle2 className="size-3.5 text-emerald-400" />
                    ) : (
                      <XCircle className="size-3.5 text-rose-400" />
                    )}
                    AAA
                  </span>
                </div>
              </div>
            </div>
          </div>

          <div className="mt-4 pt-3 border-t border-border flex items-center justify-between text-xs text-muted-foreground">
            <span>
              Optimal text color on this background:{" "}
              <strong className="text-foreground">
                {contrast.bestTextColor === "#ffffff" ? "White" : "Black"}
              </strong>
            </span>
            <span>WCAG 2.1 Level AA requires 4.5:1</span>
          </div>
        </div>
      </div>

      {/* Sliders for Channels (R, G, B, Alpha) */}
      <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
        <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
          <Sliders className="size-4 text-primary" /> Fine-Tune Channels
        </h2>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Red Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-rose-500">Red (R)</span>
              <span className="font-mono text-muted-foreground">{rgba.r}</span>
            </div>
            <Slider
              min={0}
              max={255}
              value={[rgba.r]}
              onValueChange={(val) => {
                const num = Array.isArray(val) ? val[0] : (val as number);
                const next = { ...rgba, r: num };
                setRgba(next);
                setRawInput(rgbaToHex(next));
              }}
            />
          </div>

          {/* Green Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-emerald-500">Green (G)</span>
              <span className="font-mono text-muted-foreground">{rgba.g}</span>
            </div>
            <Slider
              min={0}
              max={255}
              value={[rgba.g]}
              onValueChange={(val) => {
                const num = Array.isArray(val) ? val[0] : (val as number);
                const next = { ...rgba, g: num };
                setRgba(next);
                setRawInput(rgbaToHex(next));
              }}
            />
          </div>

          {/* Blue Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-blue-500">Blue (B)</span>
              <span className="font-mono text-muted-foreground">{rgba.b}</span>
            </div>
            <Slider
              min={0}
              max={255}
              value={[rgba.b]}
              onValueChange={(val) => {
                const num = Array.isArray(val) ? val[0] : (val as number);
                const next = { ...rgba, b: num };
                setRgba(next);
                setRawInput(rgbaToHex(next));
              }}
            />
          </div>

          {/* Alpha Slider */}
          <div className="space-y-1.5">
            <div className="flex justify-between text-xs">
              <span className="font-medium text-violet-500">Alpha (Opacity)</span>
              <span className="font-mono text-muted-foreground">
                {Math.round(rgba.a * 100)}%
              </span>
            </div>
            <Slider
              min={0}
              max={100}
              value={[Math.round(rgba.a * 100)]}
              onValueChange={(val) => {
                const num = Array.isArray(val) ? val[0] : (val as number);
                const next = { ...rgba, a: num / 100 };
                setRgba(next);
                setRawInput(rgbaToHex(next, true));
              }}
            />
          </div>
        </div>
      </div>

      {/* All Formats Conversion Grid */}
      <div className="space-y-3">
        <h2 className="text-sm font-semibold text-foreground">
          Converted Color Formats
        </h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {formatsList.map((f) => (
            <div
              key={f.label}
              className="flex items-center justify-between rounded-lg border border-border bg-card p-3 shadow-xs hover:border-primary/40 transition-colors"
            >
              <div className="min-w-0 pr-2">
                <span className="text-[11px] font-semibold text-muted-foreground uppercase tracking-wide">
                  {f.label}
                </span>
                <p className="font-mono text-xs text-foreground truncate mt-0.5">
                  {f.value}
                </p>
              </div>

              <Button
                variant="outline"
                size="sm"
                onClick={() => handleCopy(f.label, f.code)}
                className="h-7 px-2.5 text-xs shrink-0"
              >
                {copiedKey === f.label ? (
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
          ))}
        </div>
      </div>
    </div>
  );
}
