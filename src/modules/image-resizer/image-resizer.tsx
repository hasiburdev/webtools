"use client";

import { useState, useRef, useEffect, useCallback } from "react";
import { Upload, Download, RotateCcw, Lock, Unlock, X } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { cn } from "@/lib/utils";

// ─── Types ────────────────────────────────────────────────────────────────────

type OutputFormat = "image/png" | "image/jpeg" | "image/webp";

interface CropRect {
  x: number;
  y: number;
  w: number;
  h: number;
}

/**
 * The active interaction on the canvas.
 * "idle"    → hovering, no button down
 * "drawing" → dragging to create a brand-new selection
 * "moving"  → dragging the whole rect
 * "resize-*"→ dragging a specific corner or edge handle
 */
type DragMode =
  | "idle"
  | "drawing"
  | "moving"
  | "resize-nw"
  | "resize-ne"
  | "resize-sw"
  | "resize-se"
  | "resize-n"
  | "resize-s"
  | "resize-e"
  | "resize-w";

// ─── Constants ────────────────────────────────────────────────────────────────

const FORMATS: { value: OutputFormat; label: string }[] = [
  { value: "image/png", label: "PNG" },
  { value: "image/jpeg", label: "JPEG" },
  { value: "image/webp", label: "WebP" },
];

const PRESET_SIZES = [
  { label: "720p", w: 1280, h: 720 },
  { label: "1080p", w: 1920, h: 1080 },
  { label: "4K", w: 3840, h: 2160 },
  { label: "Square", w: 1080, h: 1080 },
  { label: "Portrait", w: 1080, h: 1350 },
  { label: "Banner", w: 1500, h: 500 },
];

/** Visual size of corner handles in display pixels. */
const CORNER_HS = 10;
/** Visual size of edge-midpoint handles in display pixels. */
const EDGE_HS = 8;
/** Hit-test tolerance around each handle / border in display pixels. */
const HIT_TOL = 7;

const CURSOR_FOR_MODE: Record<DragMode | string, string> = {
  idle: "crosshair",
  drawing: "crosshair",
  moving: "move",
  "resize-nw": "nw-resize",
  "resize-ne": "ne-resize",
  "resize-sw": "sw-resize",
  "resize-se": "se-resize",
  "resize-n": "ns-resize",
  "resize-s": "ns-resize",
  "resize-e": "ew-resize",
  "resize-w": "ew-resize",
};

// ─── Hit-test (in display / canvas pixels) ────────────────────────────────────

function hitTest(mx: number, my: number, crop: CropRect, scale: number): DragMode {
  const dx = crop.x * scale;
  const dy = crop.y * scale;
  const dw = crop.w * scale;
  const dh = crop.h * scale;

  // Corner handles (checked first — highest priority)
  const corners: [DragMode, number, number][] = [
    ["resize-nw", dx, dy],
    ["resize-ne", dx + dw, dy],
    ["resize-sw", dx, dy + dh],
    ["resize-se", dx + dw, dy + dh],
  ];
  for (const [mode, cx, cy] of corners) {
    if (Math.abs(mx - cx) < CORNER_HS + HIT_TOL && Math.abs(my - cy) < CORNER_HS + HIT_TOL) {
      return mode;
    }
  }

  // Edge handles (middle of each side, inside the corner zones)
  const innerX1 = dx + CORNER_HS + HIT_TOL;
  const innerX2 = dx + dw - CORNER_HS - HIT_TOL;
  const innerY1 = dy + CORNER_HS + HIT_TOL;
  const innerY2 = dy + dh - CORNER_HS - HIT_TOL;

  if (Math.abs(my - dy) < HIT_TOL && mx > innerX1 && mx < innerX2) return "resize-n";
  if (Math.abs(my - (dy + dh)) < HIT_TOL && mx > innerX1 && mx < innerX2) return "resize-s";
  if (Math.abs(mx - dx) < HIT_TOL && my > innerY1 && my < innerY2) return "resize-w";
  if (Math.abs(mx - (dx + dw)) < HIT_TOL && my > innerY1 && my < innerY2) return "resize-e";

  // Interior
  if (mx > dx && mx < dx + dw && my > dy && my < dy + dh) return "moving";

  // Outside — will start a new drawing
  return "drawing";
}

// ─── Resize calculation (all values in image coordinates) ─────────────────────

function applyResize(
  mode: DragMode,
  initial: CropRect,
  delta: { x: number; y: number },
  imgW: number,
  imgH: number,
): CropRect {
  let { x, y, w, h } = initial;

  switch (mode) {
    case "moving":
      x = Math.max(0, Math.min(initial.x + delta.x, imgW - initial.w));
      y = Math.max(0, Math.min(initial.y + delta.y, imgH - initial.h));
      w = initial.w;
      h = initial.h;
      break;

    case "resize-nw":
      x = Math.min(initial.x + delta.x, initial.x + initial.w - 1);
      y = Math.min(initial.y + delta.y, initial.y + initial.h - 1);
      w = initial.w - (x - initial.x);
      h = initial.h - (y - initial.y);
      break;

    case "resize-ne":
      y = Math.min(initial.y + delta.y, initial.y + initial.h - 1);
      w = Math.max(1, initial.w + delta.x);
      h = initial.h - (y - initial.y);
      break;

    case "resize-sw":
      x = Math.min(initial.x + delta.x, initial.x + initial.w - 1);
      w = initial.w - (x - initial.x);
      h = Math.max(1, initial.h + delta.y);
      break;

    case "resize-se":
      w = Math.max(1, initial.w + delta.x);
      h = Math.max(1, initial.h + delta.y);
      break;

    case "resize-n":
      y = Math.min(initial.y + delta.y, initial.y + initial.h - 1);
      h = initial.h - (y - initial.y);
      break;

    case "resize-s":
      h = Math.max(1, initial.h + delta.y);
      break;

    case "resize-w":
      x = Math.min(initial.x + delta.x, initial.x + initial.w - 1);
      w = initial.w - (x - initial.x);
      break;

    case "resize-e":
      w = Math.max(1, initial.w + delta.x);
      break;
  }

  // Clamp everything inside the image
  x = Math.max(0, x);
  y = Math.max(0, y);
  if (x + w > imgW) w = imgW - x;
  if (y + h > imgH) h = imgH - y;
  w = Math.max(1, w);
  h = Math.max(1, h);

  return { x: Math.round(x), y: Math.round(y), w: Math.round(w), h: Math.round(h) };
}

// ─── Canvas drawing ───────────────────────────────────────────────────────────

function drawCropOverlay(
  ctx: CanvasRenderingContext2D,
  cw: number,
  ch: number,
  crop: CropRect,
  scale: number,
) {
  const dx = crop.x * scale;
  const dy = crop.y * scale;
  const dw = crop.w * scale;
  const dh = crop.h * scale;

  if (dw < 1 || dh < 1) return;

  // Dim outside selection
  ctx.fillStyle = "rgba(0,0,0,0.52)";
  ctx.fillRect(0, 0, cw, dy);
  ctx.fillRect(0, dy, dx, dh);
  ctx.fillRect(dx + dw, dy, cw - dx - dw, dh);
  ctx.fillRect(0, dy + dh, cw, ch - dy - dh);

  // Selection border
  ctx.strokeStyle = "rgba(255,255,255,0.9)";
  ctx.lineWidth = 1.5;
  ctx.strokeRect(dx + 0.75, dy + 0.75, dw - 1.5, dh - 1.5);

  // Rule-of-thirds
  ctx.strokeStyle = "rgba(255,255,255,0.2)";
  ctx.lineWidth = 0.75;
  ctx.beginPath();
  for (let i = 1; i < 3; i++) {
    ctx.moveTo(dx + (dw * i) / 3, dy);
    ctx.lineTo(dx + (dw * i) / 3, dy + dh);
    ctx.moveTo(dx, dy + (dh * i) / 3);
    ctx.lineTo(dx + dw, dy + (dh * i) / 3);
  }
  ctx.stroke();

  // Handles — white squares with a thin dark outline for contrast
  ctx.save();
  ctx.shadowColor = "rgba(0,0,0,0.45)";
  ctx.shadowBlur = 3;
  ctx.fillStyle = "#ffffff";
  ctx.strokeStyle = "rgba(0,0,0,0.35)";
  ctx.lineWidth = 0.75;

  const drawHandle = (hx: number, hy: number, hw: number, hh: number) => {
    ctx.fillRect(hx, hy, hw, hh);
    ctx.strokeRect(hx + 0.5, hy + 0.5, hw - 1, hh - 1);
  };

  // Four corners
  drawHandle(dx - CORNER_HS / 2, dy - CORNER_HS / 2, CORNER_HS, CORNER_HS);
  drawHandle(dx + dw - CORNER_HS / 2, dy - CORNER_HS / 2, CORNER_HS, CORNER_HS);
  drawHandle(dx - CORNER_HS / 2, dy + dh - CORNER_HS / 2, CORNER_HS, CORNER_HS);
  drawHandle(dx + dw - CORNER_HS / 2, dy + dh - CORNER_HS / 2, CORNER_HS, CORNER_HS);

  // Four edge midpoints (only if the rect is large enough to show them)
  if (dw > CORNER_HS * 3) {
    drawHandle(dx + dw / 2 - EDGE_HS / 2, dy - 3, EDGE_HS, 6);
    drawHandle(dx + dw / 2 - EDGE_HS / 2, dy + dh - 3, EDGE_HS, 6);
  }
  if (dh > CORNER_HS * 3) {
    drawHandle(dx - 3, dy + dh / 2 - EDGE_HS / 2, 6, EDGE_HS);
    drawHandle(dx + dw - 3, dy + dh / 2 - EDGE_HS / 2, 6, EDGE_HS);
  }

  ctx.restore();
}

// ─── Number input helper ──────────────────────────────────────────────────────

function NumInput({
  label,
  value,
  min,
  max,
  onChange,
}: {
  label: string;
  value: number;
  min: number;
  max: number;
  onChange: (v: number) => void;
}) {
  return (
    <div className="flex flex-col gap-1">
      <Label className="text-xs text-muted-foreground">{label}</Label>
      <input
        type="number"
        min={min}
        max={max}
        value={value}
        onChange={(e) => {
          const v = parseInt(e.target.value, 10);
          if (!isNaN(v)) onChange(v);
        }}
        className="w-full rounded-md border border-border bg-background px-2 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
      />
    </div>
  );
}

// ─── Main component ───────────────────────────────────────────────────────────

export function ImageResizer() {
  // ── Image ──
  const [imgSrc, setImgSrc] = useState<string | null>(null);
  const [fileName, setFileName] = useState("");
  const [originalDims, setOriginalDims] = useState({ w: 0, h: 0 });
  const [isDraggingOver, setIsDraggingOver] = useState(false);

  // ── Output settings ──
  const [outputW, setOutputW] = useState(0);
  const [outputH, setOutputH] = useState(0);
  const [lockAspect, setLockAspect] = useState(true);
  const [format, setFormat] = useState<OutputFormat>("image/png");

  // ── Crop (React state used only for UI inputs; canvas drawing uses ref) ──
  const cropRectRef = useRef<CropRect | null>(null);
  const [cropRect, setCropRect] = useState<CropRect | null>(null);

  // ── Canvas ──
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const imageRef = useRef<HTMLImageElement | null>(null);
  const scaleRef = useRef(1); // canvas_px / image_px

  // ── Drag state ──
  const dragModeRef = useRef<DragMode>("idle");
  const dragStartPtRef = useRef({ x: 0, y: 0 }); // image coords at pointer-down
  const initialCropRef = useRef<CropRect | null>(null); // snapshot of crop at pointer-down

  // ── Misc ──
  const [cursor, setCursor] = useState("crosshair");
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Coordinate helpers ────────────────────────────────────────────────────

  /** Raw canvas-pixel coordinates (used for hit-testing). */
  const toCanvasPx = useCallback((e: React.MouseEvent<HTMLCanvasElement>) => {
    const canvas = canvasRef.current!;
    const rect = canvas.getBoundingClientRect();
    const sx = canvas.width / rect.width;
    const sy = canvas.height / rect.height;
    return {
      x: (e.clientX - rect.left) * sx,
      y: (e.clientY - rect.top) * sy,
    };
  }, []);

  /** Image-space coordinates (used for crop rect values). */
  const toImagePx = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const { x, y } = toCanvasPx(e);
      const img = imageRef.current!;
      return {
        x: Math.max(0, Math.min(Math.round(x / scaleRef.current), img.naturalWidth)),
        y: Math.max(0, Math.min(Math.round(y / scaleRef.current), img.naturalHeight)),
      };
    },
    [toCanvasPx],
  );

  // ── Canvas drawing ────────────────────────────────────────────────────────

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current;
    const img = imageRef.current;
    if (!canvas || !img) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, 0, 0, canvas.width, canvas.height);

    if (cropRectRef.current) {
      drawCropOverlay(ctx, canvas.width, canvas.height, cropRectRef.current, scaleRef.current);
    }
  }, []);

  // ── File loading ──────────────────────────────────────────────────────────

  const loadFile = useCallback((file: File) => {
    if (!file.type.startsWith("image/")) return;
    setFileName(file.name);
    setImgSrc((prev) => {
      if (prev) URL.revokeObjectURL(prev);
      return URL.createObjectURL(file);
    });
  }, []);

  useEffect(() => {
    if (!imgSrc) return;
    const img = new Image();
    img.onload = () => {
      imageRef.current = img;
      setOriginalDims({ w: img.naturalWidth, h: img.naturalHeight });
      setOutputW(img.naturalWidth);
      setOutputH(img.naturalHeight);
      cropRectRef.current = null;
      setCropRect(null);

      const canvas = canvasRef.current;
      const container = containerRef.current;
      if (!canvas || !container) return;

      const maxW = container.clientWidth || 800;
      const scale = Math.min(1, maxW / img.naturalWidth);
      scaleRef.current = scale;
      canvas.width = Math.round(img.naturalWidth * scale);
      canvas.height = Math.round(img.naturalHeight * scale);

      const ctx = canvas.getContext("2d");
      ctx?.drawImage(img, 0, 0, canvas.width, canvas.height);
    };
    img.src = imgSrc;
  }, [imgSrc]);

  // ── Crop sync from canvas → React state (called after every change) ───────

  const syncCrop = useCallback(
    (crop: CropRect | null) => {
      cropRectRef.current = crop;
      setCropRect(crop ? { ...crop } : null);
      redrawCanvas();
    },
    [redrawCanvas],
  );

  // ── Mouse: down ───────────────────────────────────────────────────────────

  const handleMouseDown = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      if (!imageRef.current) return;
      e.preventDefault();

      const canvasPt = toCanvasPx(e);
      const imagePt = toImagePx(e);

      // Decide mode based on hit test (only if there's an existing crop)
      if (cropRectRef.current) {
        const zone = hitTest(canvasPt.x, canvasPt.y, cropRectRef.current, scaleRef.current);
        if (zone !== "drawing") {
          dragModeRef.current = zone;
          dragStartPtRef.current = imagePt;
          initialCropRef.current = { ...cropRectRef.current };
          setCursor(CURSOR_FOR_MODE[zone]);
          return;
        }
      }

      // Otherwise start drawing a new selection
      dragModeRef.current = "drawing";
      dragStartPtRef.current = imagePt;
      cropRectRef.current = { x: imagePt.x, y: imagePt.y, w: 0, h: 0 };
      setCropRect(null); // hide inputs until mouseup
      redrawCanvas();
    },
    [toCanvasPx, toImagePx, redrawCanvas],
  );

  // ── Mouse: move ───────────────────────────────────────────────────────────

  const handleMouseMove = useCallback(
    (e: React.MouseEvent<HTMLCanvasElement>) => {
      const canvasPt = toCanvasPx(e);
      const imagePt = toImagePx(e);
      const mode = dragModeRef.current;

      if (mode === "idle") {
        // Just update cursor to reflect what the user would grab
        if (cropRectRef.current) {
          const zone = hitTest(canvasPt.x, canvasPt.y, cropRectRef.current, scaleRef.current);
          setCursor(CURSOR_FOR_MODE[zone] ?? "crosshair");
        }
        return;
      }

      e.preventDefault();
      const img = imageRef.current!;

      if (mode === "drawing") {
        const start = dragStartPtRef.current;
        cropRectRef.current = {
          x: Math.min(start.x, imagePt.x),
          y: Math.min(start.y, imagePt.y),
          w: Math.abs(imagePt.x - start.x),
          h: Math.abs(imagePt.y - start.y),
        };
      } else {
        const delta = {
          x: imagePt.x - dragStartPtRef.current.x,
          y: imagePt.y - dragStartPtRef.current.y,
        };
        const newCrop = applyResize(
          mode,
          initialCropRef.current!,
          delta,
          img.naturalWidth,
          img.naturalHeight,
        );
        cropRectRef.current = newCrop;
        // Live-update the inputs while dragging
        setCropRect({ ...newCrop });
      }

      redrawCanvas();
    },
    [toCanvasPx, toImagePx, redrawCanvas],
  );

  // ── Mouse: up / leave ─────────────────────────────────────────────────────

  const handleMouseUp = useCallback(
    (_e: React.MouseEvent<HTMLCanvasElement>) => {
      const mode = dragModeRef.current;
      if (mode === "idle") return;

      dragModeRef.current = "idle";

      const crop = cropRectRef.current;

      // Discard tiny accidental draws
      if (mode === "drawing" && (!crop || crop.w < 4 || crop.h < 4)) {
        cropRectRef.current = null;
        setCropRect(null);
        setCursor("crosshair");
        redrawCanvas();
        return;
      }

      if (crop) {
        setCropRect({ ...crop });
        // Sync output size to match the crop selection
        if (mode === "drawing") {
          setOutputW(crop.w);
          setOutputH(crop.h);
        }
      }

      setCursor("crosshair");
    },
    [redrawCanvas],
  );

  // ── Clear crop ────────────────────────────────────────────────────────────

  const clearCrop = useCallback(() => {
    cropRectRef.current = null;
    setCropRect(null);
    const img = imageRef.current;
    if (img) {
      setOutputW(img.naturalWidth);
      setOutputH(img.naturalHeight);
    }
    redrawCanvas();
  }, [redrawCanvas]);

  // ── Crop input handlers (panel → canvas) ──────────────────────────────────

  const updateCropField = useCallback(
    (field: keyof CropRect, raw: number) => {
      const img = imageRef.current;
      if (!img || !cropRectRef.current) return;
      const prev = cropRectRef.current;

      let { x, y, w, h } = prev;
      const imgW = img.naturalWidth;
      const imgH = img.naturalHeight;

      if (field === "x") x = Math.max(0, Math.min(raw, imgW - w));
      if (field === "y") y = Math.max(0, Math.min(raw, imgH - h));
      if (field === "w") w = Math.max(1, Math.min(raw, imgW - x));
      if (field === "h") h = Math.max(1, Math.min(raw, imgH - y));

      const next: CropRect = { x, y, w, h };
      cropRectRef.current = next;
      setCropRect({ ...next });
      redrawCanvas();
    },
    [redrawCanvas],
  );

  // ── Output size helpers ───────────────────────────────────────────────────

  const getSourceAspect = useCallback(() => {
    const crop = cropRectRef.current;
    const img = imageRef.current;
    if (!img) return 1;
    const sw = crop ? crop.w : img.naturalWidth;
    const sh = crop ? crop.h : img.naturalHeight;
    return sh > 0 ? sw / sh : 1;
  }, []);

  const handleOutputWidth = (raw: string) => {
    const v = parseInt(raw, 10);
    if (isNaN(v) || v < 1) return;
    setOutputW(v);
    if (lockAspect) setOutputH(Math.max(1, Math.round(v / getSourceAspect())));
  };

  const handleOutputHeight = (raw: string) => {
    const v = parseInt(raw, 10);
    if (isNaN(v) || v < 1) return;
    setOutputH(v);
    if (lockAspect) setOutputW(Math.max(1, Math.round(v * getSourceAspect())));
  };

  const applyPreset = (presetW: number, presetH: number) => {
    setOutputW(presetW);
    setOutputH(presetH);
    setLockAspect(false);

    const img = imageRef.current;
    if (!img) return;

    const imgW = img.naturalWidth;
    const imgH = img.naturalHeight;

    // Scale preset down to fit inside the image, preserving the preset aspect ratio.
    // If the image is larger than the preset we use the exact preset dimensions.
    const fitScale = Math.min(1, imgW / presetW, imgH / presetH);
    const cropW = Math.round(presetW * fitScale);
    const cropH = Math.round(presetH * fitScale);

    // Keep the new rect centred on the existing selection, or the image centre.
    const cx = cropRectRef.current ? cropRectRef.current.x + cropRectRef.current.w / 2 : imgW / 2;
    const cy = cropRectRef.current ? cropRectRef.current.y + cropRectRef.current.h / 2 : imgH / 2;

    const x = Math.max(0, Math.min(Math.round(cx - cropW / 2), imgW - cropW));
    const y = Math.max(0, Math.min(Math.round(cy - cropH / 2), imgH - cropH));

    syncCrop({ x, y, w: cropW, h: cropH });
  };

  // ── Download ──────────────────────────────────────────────────────────────

  const handleDownload = useCallback(() => {
    const img = imageRef.current;
    if (!img) return;

    const offscreen = document.createElement("canvas");
    offscreen.width = outputW;
    offscreen.height = outputH;
    const ctx = offscreen.getContext("2d");
    if (!ctx) return;

    if (format === "image/jpeg") {
      ctx.fillStyle = "#ffffff";
      ctx.fillRect(0, 0, outputW, outputH);
    }

    const crop = cropRectRef.current;
    if (crop) {
      ctx.drawImage(img, crop.x, crop.y, crop.w, crop.h, 0, 0, outputW, outputH);
    } else {
      ctx.drawImage(img, 0, 0, outputW, outputH);
    }

    const quality = format === "image/png" ? undefined : 0.92;
    const dataUrl = offscreen.toDataURL(format, quality);
    const ext = format === "image/jpeg" ? "jpg" : format === "image/webp" ? "webp" : "png";
    const baseName = fileName.replace(/\.[^.]+$/, "");

    const a = document.createElement("a");
    a.href = dataUrl;
    a.download = `${baseName}_${outputW}x${outputH}.${ext}`;
    a.click();
  }, [outputW, outputH, format, fileName]);

  // ── Reset ─────────────────────────────────────────────────────────────────

  const handleReset = () => {
    if (imgSrc) URL.revokeObjectURL(imgSrc);
    setImgSrc(null);
    setFileName("");
    setOriginalDims({ w: 0, h: 0 });
    setOutputW(0);
    setOutputH(0);
    cropRectRef.current = null;
    setCropRect(null);
    imageRef.current = null;
    dragModeRef.current = "idle";
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  // ── Drop zone ─────────────────────────────────────────────────────────────

  const handleDragOver = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(true);
  };
  const handleDragLeave = () => setIsDraggingOver(false);
  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDraggingOver(false);
    const file = e.dataTransfer.files[0];
    if (file) loadFile(file);
  };

  // ─── Render: drop zone ─────────────────────────────────────────────────────

  if (!imgSrc) {
    return (
      <>
        <div
          role="button"
          tabIndex={0}
          aria-label="Upload image"
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          onDrop={handleDrop}
          onClick={() => fileInputRef.current?.click()}
          onKeyDown={(e) => e.key === "Enter" && fileInputRef.current?.click()}
          className={cn(
            "flex cursor-pointer select-none flex-col items-center justify-center gap-5 rounded-lg border-2 border-dashed px-8 py-24 text-center transition-colors",
            isDraggingOver
              ? "border-foreground bg-muted/40"
              : "border-border hover:border-foreground/40 hover:bg-muted/20",
          )}
        >
          <div
            className={cn(
              "flex h-16 w-16 items-center justify-center rounded-full transition-colors",
              isDraggingOver ? "bg-foreground/10" : "bg-muted",
            )}
          >
            <Upload
              className={cn(
                "size-7 transition-colors",
                isDraggingOver ? "text-foreground" : "text-muted-foreground",
              )}
            />
          </div>
          <div>
            <p className="text-base font-semibold">
              {isDraggingOver ? "Drop to open" : "Drop your image here"}
            </p>
            <p className="mt-1.5 text-sm text-muted-foreground">
              or click to browse &mdash; PNG, JPEG, WebP, GIF, BMP, SVG supported
            </p>
          </div>
          <p className="rounded border border-border bg-muted px-3 py-1 text-xs text-muted-foreground">
            100% client-side &mdash; your image never leaves the browser
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          className="hidden"
          onChange={(e) => {
            const file = e.target.files?.[0];
            if (file) loadFile(file);
          }}
        />
      </>
    );
  }

  // ─── Render: editor ────────────────────────────────────────────────────────

  return (
    <div className="flex flex-col gap-6">
      {/* Top bar */}
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2 text-sm">
          <span className="max-w-xs truncate font-medium">{fileName}</span>
          <span className="text-muted-foreground">·</span>
          <span className="tabular-nums text-muted-foreground">
            {originalDims.w} × {originalDims.h} px
          </span>
        </div>
        <Button variant="ghost" size="sm" onClick={handleReset}>
          <RotateCcw className="mr-1.5 size-3.5" />
          New image
        </Button>
      </div>

      {/* Editor layout */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-[1fr_288px]">
        {/* Canvas */}
        <div className="flex flex-col gap-2">
          <div
            ref={containerRef}
            className="overflow-hidden rounded-lg border border-border bg-[repeating-conic-gradient(oklch(0.9_0_0)_0%_25%,oklch(0.96_0_0)_0%_50%)] [background-size:20px_20px] dark:bg-[repeating-conic-gradient(oklch(0.22_0_0)_0%_25%,oklch(0.18_0_0)_0%_50%)]"
          >
            <canvas
              ref={canvasRef}
              className="block w-full"
              style={{ cursor }}
              onMouseDown={handleMouseDown}
              onMouseMove={handleMouseMove}
              onMouseUp={handleMouseUp}
              onMouseLeave={handleMouseUp}
            />
          </div>

          {/* Status line */}
          <div className="flex items-center justify-between text-xs text-muted-foreground">
            {cropRect ? (
              <span className="tabular-nums">
                Selection{" "}
                <span className="font-medium text-foreground">
                  {cropRect.w} × {cropRect.h} px
                </span>{" "}
                at ({cropRect.x}, {cropRect.y})
              </span>
            ) : (
              <span>Click and drag to select a crop area. Drag handles to move or resize.</span>
            )}
            {cropRect && (
              <button
                onClick={clearCrop}
                className="flex items-center gap-1 transition-colors hover:text-foreground"
              >
                <X className="size-3" />
                Clear
              </button>
            )}
          </div>
        </div>

        {/* Controls */}
        <div className="flex flex-col gap-4">
          {/* ── Crop selection inputs ── */}
          {cropRect && (
            <Card>
              <CardHeader className="pb-3 pt-4">
                <CardTitle className="text-sm font-semibold">Crop Selection</CardTitle>
              </CardHeader>
              <CardContent className="pb-4">
                <div className="grid grid-cols-2 gap-3">
                  <NumInput
                    label="X (left)"
                    value={cropRect.x}
                    min={0}
                    max={originalDims.w - cropRect.w}
                    onChange={(v) => updateCropField("x", v)}
                  />
                  <NumInput
                    label="Y (top)"
                    value={cropRect.y}
                    min={0}
                    max={originalDims.h - cropRect.h}
                    onChange={(v) => updateCropField("y", v)}
                  />
                  <NumInput
                    label="Width"
                    value={cropRect.w}
                    min={1}
                    max={originalDims.w - cropRect.x}
                    onChange={(v) => updateCropField("w", v)}
                  />
                  <NumInput
                    label="Height"
                    value={cropRect.h}
                    min={1}
                    max={originalDims.h - cropRect.y}
                    onChange={(v) => updateCropField("h", v)}
                  />
                </div>
              </CardContent>
            </Card>
          )}

          {/* ── Output size ── */}
          <Card>
            <CardHeader className="pb-3 pt-4">
              <CardTitle className="text-sm font-semibold">Output Size</CardTitle>
            </CardHeader>
            <CardContent className="flex flex-col gap-4 pb-4">
              {/* W × H with lock */}
              <div className="flex items-end gap-2">
                <div className="flex flex-1 flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Width (px)</Label>
                  <input
                    type="number"
                    min={1}
                    max={16000}
                    value={outputW || ""}
                    onChange={(e) => handleOutputWidth(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>

                <button
                  onClick={() => setLockAspect((v) => !v)}
                  className="mb-0.5 flex size-8 shrink-0 items-center justify-center rounded border border-border transition-colors hover:bg-muted"
                  title={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
                  aria-label={lockAspect ? "Unlock aspect ratio" : "Lock aspect ratio"}
                >
                  {lockAspect ? (
                    <Lock className="size-3.5" />
                  ) : (
                    <Unlock className="size-3.5 text-muted-foreground" />
                  )}
                </button>

                <div className="flex flex-1 flex-col gap-1.5">
                  <Label className="text-xs text-muted-foreground">Height (px)</Label>
                  <input
                    type="number"
                    min={1}
                    max={16000}
                    value={outputH || ""}
                    onChange={(e) => handleOutputHeight(e.target.value)}
                    className="w-full rounded-md border border-border bg-background px-3 py-1.5 text-sm tabular-nums focus:outline-none focus:ring-1 focus:ring-ring"
                  />
                </div>
              </div>

              {/* Presets */}
              <div>
                <p className="mb-2 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Presets
                </p>
                <div className="flex flex-wrap gap-1.5">
                  {PRESET_SIZES.map((p) => (
                    <button
                      key={p.label}
                      onClick={() => applyPreset(p.w, p.h)}
                      className="rounded border border-border px-2 py-1 text-xs transition-colors hover:bg-muted"
                    >
                      {p.label}
                    </button>
                  ))}
                </div>
              </div>

              <div className="h-px bg-border" />

              {/* Format */}
              <div className="flex flex-col gap-1.5">
                <Label className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Format
                </Label>
                <div className="flex border border-border">
                  {FORMATS.map(({ value, label }, i) => (
                    <button
                      key={value}
                      onClick={() => setFormat(value)}
                      className={cn(
                        "flex flex-1 items-center justify-center py-1.5 text-xs font-medium transition-colors",
                        i < FORMATS.length - 1 && "border-r border-border",
                        format === value
                          ? "bg-foreground text-background"
                          : "bg-background text-muted-foreground hover:bg-muted hover:text-foreground",
                      )}
                    >
                      {label}
                    </button>
                  ))}
                </div>
                {format === "image/jpeg" && (
                  <p className="text-xs text-muted-foreground">Transparency fills with white.</p>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Download */}
          <Button onClick={handleDownload} size="lg" className="w-full gap-2">
            <Download className="size-4" />
            Download{" "}
            <span className="tabular-nums opacity-80">
              {outputW} × {outputH}
            </span>
          </Button>

          <p className="text-center text-xs text-muted-foreground">
            All processing happens in your browser.
          </p>
        </div>
      </div>
    </div>
  );
}
