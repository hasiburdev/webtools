"use client";

import { useEffect, useMemo, useState } from "react";
import Image from "next/image";
import { Download } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { useLocalImage } from "@/lib/use-local-image";
import { createImageCanvas, downloadBlob, encodeCanvas, formatBytes, loadImage, type ImageFormat, type LocalImage } from "@/lib/browser-images";

interface CompressionSettings {
  image: LocalImage | null;
  format: ImageFormat;
  quality: number;
  maxWidth: number;
}

interface CompressionResult {
  settings: CompressionSettings;
  blob?: Blob;
  url?: string;
  width?: number;
  height?: number;
  error?: string;
}

export function ImageCompressor() {
  const { image, error, loading, selectFiles, clear } = useLocalImage();
  const [format, setFormat] = useState<ImageFormat>("image/webp");
  const [quality, setQuality] = useState(80);
  const [maxWidth, setMaxWidth] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const settings = useMemo(() => ({ image, format, quality, maxWidth }), [image, format, quality, maxWidth]);

  useEffect(() => {
    const { image, format, quality, maxWidth } = settings;
    if (!image) return;
    let canceled = false;
    let url: string | undefined;
    const timer = setTimeout(async () => {
      let canvas: HTMLCanvasElement | undefined;
      try {
        const source = await loadImage(image.url);
        if (canceled) return;
        const scale = maxWidth > 0 ? Math.min(1, maxWidth / image.width) : 1;
        const width = Math.max(1, Math.round(image.width * scale));
        const height = Math.max(1, Math.round(image.height * scale));
        canvas = createImageCanvas(source, width, height, format === "image/jpeg");
        const blob = await encodeCanvas(canvas, format, quality / 100);
        if (canceled) return;
        url = URL.createObjectURL(blob);
        setResult({ settings, blob, url, width, height });
      } catch (error) {
        if (!canceled) setResult({ settings, error: error instanceof Error ? error.message : "Compression failed." });
      } finally {
        if (canvas) { canvas.width = 0; canvas.height = 0; }
      }
    }, 200);
    return () => {
      canceled = true;
      clearTimeout(timer);
      if (url) URL.revokeObjectURL(url);
    };
  }, [settings]);

  const current = result?.settings === settings ? result : null;
  const savings = image && current?.blob ? (1 - current.blob.size / image.file.size) * 100 : 0;

  return (
    <div className="space-y-6">
      <ImageUpload onFiles={selectFiles} disabled={loading} />
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <div className="flex flex-wrap gap-6 rounded-xl border border-border bg-card p-5">
        <label className="space-y-2 text-sm font-medium">Output format
          <select aria-label="Output format" className="block rounded-md border border-border bg-background p-2" value={format} onChange={(event) => setFormat(event.target.value as ImageFormat)}>
            <option value="image/webp">WebP</option><option value="image/jpeg">JPEG</option><option value="image/png">PNG (lossless)</option>
          </select>
        </label>
        <label className="min-w-48 space-y-2 text-sm font-medium">Quality: {quality}%
          <input aria-label="Compression quality" className="block w-full accent-primary" type="range" min={1} max={100} value={quality} disabled={format === "image/png"} onChange={(event) => setQuality(Number(event.target.value))} />
        </label>
        <label className="space-y-2 text-sm font-medium">Maximum width
          <select aria-label="Maximum width" className="block rounded-md border border-border bg-background p-2" value={maxWidth} onChange={(event) => setMaxWidth(Number(event.target.value))}>
            <option value={0}>Original size</option><option value={3840}>3840 px</option><option value={1920}>1920 px</option><option value={1280}>1280 px</option><option value={800}>800 px</option>
          </select>
        </label>
        <p className="w-full text-xs text-muted-foreground">PNG uses lossless encoding; its quality slider does not apply. JPEG fills transparent areas with white. Animated images export their first frame.</p>
      </div>
      {image && (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="break-all text-sm font-medium">{image.file.name}</p>
            <Button variant="outline" onClick={() => { clear(); setResult(null); }}>Remove image</Button>
          </div>
          <div className="grid gap-5 md:grid-cols-2">
            <div className="rounded-xl border border-border bg-card p-4">
              <h2 className="mb-3 font-semibold">Original · {formatBytes(image.file.size)}</h2>
              <div className="relative h-72 bg-muted/40"><Image src={image.url} alt="Original image" fill unoptimized className="object-contain" /></div>
              <p className="mt-2 text-xs text-muted-foreground">{image.width} × {image.height} px</p>
            </div>
            <div className="rounded-xl border border-border bg-card p-4" aria-live="polite" aria-busy={!current}>
              <h2 className="mb-3 font-semibold">Compressed{current?.blob ? ` · ${formatBytes(current.blob.size)}` : ""}</h2>
              {current?.url ? <div className="relative h-72 bg-muted/40"><Image src={current.url} alt="Compressed image" fill unoptimized className="object-contain" /></div> : <p className="flex h-72 items-center justify-center text-sm text-muted-foreground">{current?.error ?? "Compressing…"}</p>}
              {current?.blob && <p className="mt-2 text-xs text-muted-foreground">{current.width} × {current.height} px · {savings >= 0 ? `${savings.toFixed(1)}% smaller` : `${Math.abs(savings).toFixed(1)}% larger — try lower quality or WebP`}</p>}
            </div>
          </div>
          {current?.error && <p role="alert" className="text-sm text-destructive">{current.error}</p>}
          <Button disabled={!current?.blob || loading} onClick={() => {
            if (current?.blob) downloadBlob(current.blob, `${image.file.name.replace(/\.[^.]+$/, "")}-compressed.${format === "image/jpeg" ? "jpg" : format.split("/")[1]}`);
          }}><Download /> Download compressed image</Button>
        </div>
      )}
    </div>
  );
}
