"use client";

import { useState, useRef, useCallback } from "react";
import {
  Copy,
  Check,
  Sparkles,
  RotateCcw,
  Pipette,
  CheckCircle2,
  XCircle,
} from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

import type { RGBA, HSVA } from "./types";
import {
  clamp,
  hexToRgba,
  rgbaToHex,
  rgbaToHsva,
  hsvaToRgba,
  rgbaToHsla,
  getFormattedColor,
  calculateContrast,
  getHarmonies,
  getTints,
  getShades,
} from "./color-math";

const DEFAULT_PRESETS = [
  "#ef4444", // Red
  "#f97316", // Orange
  "#f59e0b", // Amber
  "#10b981", // Emerald
  "#06b6d4", // Cyan
  "#3b82f6", // Blue
  "#6366f1", // Indigo
  "#8b5cf6", // Violet
  "#ec4899", // Pink
  "#64748b", // Slate
];

const LOCAL_STORAGE_KEY = "webtools_color_picker_history";

export function ColorPicker() {
  // Primary color state represented as HSVA for smooth 2D gradient interaction
  const [hsva, setHsva] = useState<HSVA>({ h: 217, s: 76, v: 96, a: 1 });
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [history, setHistory] = useState<string[]>(() => {
    if (typeof window === "undefined") return [];
    try {
      const stored = localStorage.getItem(LOCAL_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch {
      return [];
    }
  });
  const [customHex, setCustomHex] = useState<string | null>(null);

  const satValRef = useRef<HTMLDivElement>(null);
  const isDraggingSatVal = useRef(false);

  // Derived current RGBA and formatting
  const rgba: RGBA = hsvaToRgba(hsva);
  const hsla = rgbaToHsla(rgba);
  const formats = getFormattedColor(rgba);
  const contrast = calculateContrast(rgba);
  const harmonies = getHarmonies(hsla);
  const tints = getTints(rgba, 6);
  const shades = getShades(rgba, 6);

  const hexInput = customHex ?? formats.hex;

  // Save color to history helper
  const addToHistory = useCallback((hexColor: string) => {
    setHistory((prev) => {
      const filtered = prev.filter((c) => c.toLowerCase() !== hexColor.toLowerCase());
      const next = [hexColor, ...filtered].slice(0, 14);
      try {
        localStorage.setItem(LOCAL_STORAGE_KEY, JSON.stringify(next));
      } catch {
        // Ignore localStorage errors
      }
      return next;
    });
  }, []);

  const selectColorFromHex = (hex: string) => {
    const parsed = hexToRgba(hex);
    if (!parsed) return;
    setCustomHex(null);
    const nextHsva = rgbaToHsva(parsed);
    setHsva(nextHsva);
    addToHistory(rgbaToHex(parsed, false));
  };

  const handleHexInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setCustomHex(val);
    const parsed = hexToRgba(val);
    if (parsed) {
      setHsva(rgbaToHsva(parsed));
      addToHistory(rgbaToHex(parsed, false));
    }
  };

  const handleCopy = async (key: string, value: string) => {
    await navigator.clipboard.writeText(value);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 1800);
  };

  const handleRandomize = () => {
    const randomHex = `#${Math.floor(Math.random() * 16777215)
      .toString(16)
      .padStart(6, "0")}`;
    selectColorFromHex(randomHex);
  };

  // 2D Saturation / Value Canvas interaction
  const updateSatValFromPointer = useCallback((clientX: number, clientY: number) => {
    if (!satValRef.current) return;
    const rect = satValRef.current.getBoundingClientRect();
    const x = clamp(clientX - rect.left, 0, rect.width);
    const y = clamp(clientY - rect.top, 0, rect.height);

    const s = Math.round((x / rect.width) * 100);
    const v = Math.round((1 - y / rect.height) * 100);

    setHsva((prev) => ({ ...prev, s, v }));
  }, []);

  const handleSatValPointerDown = (e: React.PointerEvent<HTMLDivElement>) => {
    e.currentTarget.setPointerCapture(e.pointerId);
    isDraggingSatVal.current = true;
    updateSatValFromPointer(e.clientX, e.clientY);
  };

  const handleSatValPointerMove = (e: React.PointerEvent<HTMLDivElement>) => {
    if (!isDraggingSatVal.current) return;
    updateSatValFromPointer(e.clientX, e.clientY);
  };

  const handleSatValPointerUp = (e: React.PointerEvent<HTMLDivElement>) => {
    isDraggingSatVal.current = false;
    try {
      e.currentTarget.releasePointerCapture(e.pointerId);
    } catch {
      // Ignore pointer capture errors
    }
    addToHistory(formats.hex);
  };

  // EyeDropper API trigger if supported
  const canUseEyeDropper = typeof window !== "undefined" && "EyeDropper" in window;
  const handleEyeDropper = async () => {
    if (!canUseEyeDropper) return;
    try {
      // @ts-expect-error EyeDropper is supported in Chromium
      const eyeDropper = new window.EyeDropper();
      const result = await eyeDropper.open();
      if (result?.sRGBHex) {
        selectColorFromHex(result.sRGBHex);
      }
    } catch {
      // User cancelled picker or error
    }
  };

  return (
    <div className="flex flex-col gap-8">
      {/* Top Section: Interactive Picker & Format Inputs */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-12">
        {/* Left Column: Visual 2D Gradient & Sliders (7 cols) */}
        <Card className="flex flex-col lg:col-span-7">
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Visual Color Picker</CardTitle>
              <CardDescription className="text-xs">
                Drag on the gradient or adjust hue and opacity sliders.
              </CardDescription>
            </div>

            <div className="flex items-center gap-1.5">
              {canUseEyeDropper && (
                <Button
                  variant="outline"
                  size="xs"
                  onClick={handleEyeDropper}
                  title="Pick color from screen"
                >
                  <Pipette className="size-3.5" />
                  EyeDropper
                </Button>
              )}
              <Button
                variant="outline"
                size="xs"
                onClick={handleRandomize}
                title="Randomize color"
              >
                <Sparkles className="size-3.5" />
                Random
              </Button>
            </div>
          </CardHeader>

          <CardContent className="flex flex-col gap-5">
            {/* 2D Saturation / Value Gradient box */}
            <div
              ref={satValRef}
              onPointerDown={handleSatValPointerDown}
              onPointerMove={handleSatValPointerMove}
              onPointerUp={handleSatValPointerUp}
              className="relative h-60 w-full cursor-crosshair touch-none select-none overflow-hidden rounded-xl border border-border"
              style={{
                backgroundColor: `hsl(${hsva.h}, 100%, 50%)`,
                backgroundImage:
                  "linear-gradient(to right, #ffffff, transparent), linear-gradient(to top, #000000, transparent)",
              }}
            >
              {/* Selector thumb */}
              <div
                className="pointer-events-none absolute size-5 -translate-x-1/2 -translate-y-1/2 rounded-full border-2 border-white shadow-md ring-1 ring-black/40"
                style={{
                  left: `${hsva.s}%`,
                  top: `${100 - hsva.v}%`,
                  backgroundColor: formats.hex,
                }}
              />
            </div>

            {/* Slider Controls */}
            <div className="flex flex-col gap-4">
              {/* Hue Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-xs text-muted-foreground">Hue ({hsva.h}°)</Label>
                </div>
                <input
                  type="range"
                  min="0"
                  max="360"
                  value={hsva.h}
                  onChange={(e) =>
                    setHsva((prev) => ({ ...prev, h: Number(e.target.value) }))
                  }
                  className="h-3 w-full cursor-pointer appearance-none rounded-lg"
                  style={{
                    background:
                      "linear-gradient(to right, #ff0000 0%, #ffff00 17%, #00ff00 33%, #00ffff 50%, #0000ff 67%, #ff00ff 83%, #ff0000 100%)",
                  }}
                />
              </div>

              {/* Alpha / Opacity Slider */}
              <div className="flex flex-col gap-1.5">
                <div className="flex items-center justify-between text-xs">
                  <Label className="text-xs text-muted-foreground">
                    Opacity ({Math.round(hsva.a * 100)}%)
                  </Label>
                </div>
                <div
                  className="relative rounded-lg"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                    backgroundSize: "12px 12px",
                    backgroundPosition: "0 0, 0 6px, 6px -6px, -6px 0px",
                  }}
                >
                  <input
                    type="range"
                    min="0"
                    max="1"
                    step="0.01"
                    value={hsva.a}
                    onChange={(e) =>
                      setHsva((prev) => ({ ...prev, a: Number(e.target.value) }))
                    }
                    className="relative z-10 h-3 w-full cursor-pointer appearance-none rounded-lg"
                    style={{
                      background: `linear-gradient(to right, transparent, ${formats.hex})`,
                    }}
                  />
                </div>
              </div>
            </div>

            {/* Color Swatch & Native Picker */}
            <div className="flex items-center justify-between rounded-xl border border-border bg-muted/20 p-3">
              <div className="flex items-center gap-3">
                <div
                  className="relative size-12 shrink-0 overflow-hidden rounded-lg border border-border shadow-inner"
                  style={{
                    backgroundImage:
                      "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)",
                    backgroundSize: "10px 10px",
                  }}
                >
                  <div
                    className="size-full"
                    style={{ backgroundColor: formats.rgba }}
                  />
                </div>

                <div className="flex flex-col">
                  <span className="font-mono text-base font-bold text-foreground">
                    {formats.hex}
                  </span>
                  <span className="font-mono text-xs text-muted-foreground">
                    {formats.rgba}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <label
                  className="inline-flex cursor-pointer items-center justify-center rounded-lg border border-border bg-card px-2.5 py-1.5 text-xs font-medium text-foreground shadow-xs hover:bg-muted"
                  title="Open system color picker"
                >
                  System Picker
                  <input
                    type="color"
                    value={formats.hex}
                    onChange={(e) => selectColorFromHex(e.target.value)}
                    className="sr-only"
                  />
                </label>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Right Column: Multi-Format Codes & One-Click Copy (5 cols) */}
        <div className="flex flex-col gap-6 lg:col-span-5">
          <Card className="flex flex-col">
            <CardHeader className="pb-3">
              <CardTitle className="text-base font-semibold">Color Formats</CardTitle>
              <CardDescription className="text-xs">
                Directly edit hex or copy any CSS color format.
              </CardDescription>
            </CardHeader>

            <CardContent className="flex flex-col gap-3">
              {/* Editable HEX */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-muted-foreground">HEX</Label>
                <div className="flex items-center gap-2">
                  <Input
                    value={hexInput}
                    onChange={handleHexInputChange}
                    className="font-mono text-xs"
                    placeholder="#3b82f6"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy("hex", formats.hex)}
                  >
                    {copiedKey === "hex" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* RGB / RGBA */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  {hsva.a < 1 ? "RGBA" : "RGB"}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={hsva.a < 1 ? formats.rgba : formats.rgb}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy("rgb", hsva.a < 1 ? formats.rgba : formats.rgb)
                    }
                  >
                    {copiedKey === "rgb" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* HSL / HSLA */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-muted-foreground">
                  {hsva.a < 1 ? "HSLA" : "HSL"}
                </Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={hsva.a < 1 ? formats.hsla : formats.hsl}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      handleCopy("hsl", hsva.a < 1 ? formats.hsla : formats.hsl)
                    }
                  >
                    {copiedKey === "hsl" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* HSV */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-muted-foreground">HSV / HSB</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={formats.hsv}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy("hsv", formats.hsv)}
                  >
                    {copiedKey === "hsv" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>

              {/* CMYK */}
              <div className="flex flex-col gap-1">
                <Label className="text-xs font-medium text-muted-foreground">CMYK</Label>
                <div className="flex items-center gap-2">
                  <Input
                    readOnly
                    value={formats.cmyk}
                    className="font-mono text-xs"
                  />
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => handleCopy("cmyk", formats.cmyk)}
                  >
                    {copiedKey === "cmyk" ? (
                      <Check className="size-3.5 text-emerald-500" />
                    ) : (
                      <Copy className="size-3.5" />
                    )}
                  </Button>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* WCAG Contrast Card */}
          <Card>
            <CardHeader className="pb-3">
              <CardTitle className="text-sm font-semibold">WCAG 2.1 Contrast Check</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-3">
              <div className="grid grid-cols-2 gap-3 text-xs">
                {/* On White */}
                <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-white p-2.5 text-neutral-900">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">On White</span>
                    <span className="font-mono font-bold">{contrast.ratioWithWhite}:1</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1">
                      {contrast.aaNormalWhite ? (
                        <CheckCircle2 className="size-3 text-emerald-600" />
                      ) : (
                        <XCircle className="size-3 text-rose-500" />
                      )}
                      AA
                    </span>
                    <span className="flex items-center gap-1">
                      {contrast.aaaNormalWhite ? (
                        <CheckCircle2 className="size-3 text-emerald-600" />
                      ) : (
                        <XCircle className="size-3 text-rose-500" />
                      )}
                      AAA
                    </span>
                  </div>
                </div>

                {/* On Black */}
                <div className="flex flex-col gap-1.5 rounded-lg border border-border bg-neutral-950 p-2.5 text-white">
                  <div className="flex items-center justify-between">
                    <span className="font-semibold">On Black</span>
                    <span className="font-mono font-bold">{contrast.ratioWithBlack}:1</span>
                  </div>
                  <div className="flex items-center gap-2 text-[11px]">
                    <span className="flex items-center gap-1">
                      {contrast.aaNormalBlack ? (
                        <CheckCircle2 className="size-3 text-emerald-400" />
                      ) : (
                        <XCircle className="size-3 text-rose-400" />
                      )}
                      AA
                    </span>
                    <span className="flex items-center gap-1">
                      {contrast.aaaNormalBlack ? (
                        <CheckCircle2 className="size-3 text-emerald-400" />
                      ) : (
                        <XCircle className="size-3 text-rose-400" />
                      )}
                      AAA
                    </span>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs text-muted-foreground">
                <span>Recommended text color:</span>
                <Badge variant="outline" className="font-mono">
                  {contrast.bestTextColor === "#ffffff" ? "White Text" : "Black Text"}
                </Badge>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Middle Section: Tints & Shades */}
      <Card>
        <CardHeader className="pb-3">
          <CardTitle className="text-base font-semibold">Tints & Shades</CardTitle>
          <CardDescription className="text-xs">
            Variations created by interpolating toward pure white and black. Click any swatch to select.
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col gap-4">
          {/* Tints */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Tints (Lighter)</span>
            <div className="grid grid-cols-7 gap-2">
              <button
                type="button"
                onClick={() => selectColorFromHex(formats.hex)}
                className="group relative h-10 rounded-lg border border-border shadow-xs transition-transform hover:scale-105"
                style={{ backgroundColor: formats.hex }}
                title={`Base: ${formats.hex}`}
              />
              {tints.map((tintHex) => (
                <button
                  key={tintHex}
                  type="button"
                  onClick={() => selectColorFromHex(tintHex)}
                  className="group relative h-10 rounded-lg border border-border shadow-xs transition-transform hover:scale-105"
                  style={{ backgroundColor: tintHex }}
                  title={`Tint: ${tintHex}`}
                />
              ))}
            </div>
          </div>

          {/* Shades */}
          <div className="flex flex-col gap-1.5">
            <span className="text-xs font-medium text-muted-foreground">Shades (Darker)</span>
            <div className="grid grid-cols-7 gap-2">
              <button
                type="button"
                onClick={() => selectColorFromHex(formats.hex)}
                className="group relative h-10 rounded-lg border border-border shadow-xs transition-transform hover:scale-105"
                style={{ backgroundColor: formats.hex }}
                title={`Base: ${formats.hex}`}
              />
              {shades.map((shadeHex) => (
                <button
                  key={shadeHex}
                  type="button"
                  onClick={() => selectColorFromHex(shadeHex)}
                  className="group relative h-10 rounded-lg border border-border shadow-xs transition-transform hover:scale-105"
                  style={{ backgroundColor: shadeHex }}
                  title={`Shade: ${shadeHex}`}
                />
              ))}
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Bottom Section: Color Harmonies & History */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Color Harmonies */}
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-base font-semibold">Color Harmonies</CardTitle>
            <CardDescription className="text-xs">
              Complementary, analogous, and triadic relationships on the color wheel.
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col gap-3">
            {harmonies.map((harmony) => (
              <div
                key={harmony.name}
                className="flex items-center justify-between rounded-lg border border-border p-2.5"
              >
                <div className="flex flex-col">
                  <span className="text-xs font-semibold text-foreground">{harmony.name}</span>
                  <span className="text-[11px] text-muted-foreground">
                    {harmony.description}
                  </span>
                </div>

                <div className="flex items-center gap-1.5">
                  {harmony.colors.map((colorHex, idx) => (
                    <button
                      key={`${harmony.name}-${idx}`}
                      type="button"
                      onClick={() => selectColorFromHex(colorHex)}
                      className="size-7 rounded-md border border-border shadow-xs transition-transform hover:scale-110"
                      style={{ backgroundColor: colorHex }}
                      title={`Select ${colorHex}`}
                    />
                  ))}
                </div>
              </div>
            ))}
          </CardContent>
        </Card>

        {/* Saved History & Presets */}
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-3">
            <div>
              <CardTitle className="text-base font-semibold">Palette & History</CardTitle>
              <CardDescription className="text-xs">
                Recent colors and standard design presets.
              </CardDescription>
            </div>

            {history.length > 0 && (
              <Button
                variant="ghost"
                size="xs"
                onClick={() => {
                  setHistory([]);
                  localStorage.removeItem(LOCAL_STORAGE_KEY);
                }}
                title="Clear history"
              >
                <RotateCcw className="size-3" />
                Clear
              </Button>
            )}
          </CardHeader>

          <CardContent className="flex flex-col gap-4">
            {/* Presets */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Standard Presets</span>
              <div className="flex flex-wrap gap-2">
                {DEFAULT_PRESETS.map((presetHex) => (
                  <button
                    key={presetHex}
                    type="button"
                    onClick={() => selectColorFromHex(presetHex)}
                    className="size-7 rounded-lg border border-border shadow-xs transition-transform hover:scale-110"
                    style={{ backgroundColor: presetHex }}
                    title={`Select preset ${presetHex}`}
                  />
                ))}
              </div>
            </div>

            {/* History */}
            <div className="flex flex-col gap-1.5">
              <span className="text-xs font-medium text-muted-foreground">Recent Colors</span>
              {history.length === 0 ? (
                <span className="text-xs text-muted-foreground">
                  Colors you pick or edit will appear here automatically.
                </span>
              ) : (
                <div className="flex flex-wrap gap-2">
                  {history.map((histHex, idx) => (
                    <button
                      key={`${histHex}-${idx}`}
                      type="button"
                      onClick={() => selectColorFromHex(histHex)}
                      className="size-7 rounded-lg border border-border shadow-xs transition-transform hover:scale-110"
                      style={{ backgroundColor: histHex }}
                      title={`Select recent ${histHex}`}
                    />
                  ))}
                </div>
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
