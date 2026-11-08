"use client";

import { useEffect, useRef, useState, useSyncExternalStore } from "react";
import { Copy, Pipette } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ImageUpload } from "@/components/image-upload";
import { useLocalImage } from "@/lib/use-local-image";
import { loadImage } from "@/lib/browser-images";
import { hexToRgba, rgbaToHex, rgbaToHsla } from "@/modules/color-picker/color-math";
import type { RGBA } from "@/modules/color-picker/types";

type EyeDropperConstructor = new () => { open(options?: { signal: AbortSignal }): Promise<{ sRGBHex: string }> };
const subscribe = () => () => {};
const hasEyeDropper = () => "EyeDropper" in window && window.isSecureContext;

export function OnlineColorPicker() {
  const { image, error, loading, selectFiles, clear } = useLocalImage();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const loupeRef = useRef<HTMLCanvasElement>(null);
  const readyImage = useRef<string | null>(null);
  const position = useRef({ x: 0, y: 0 });
  const eyeAbort = useRef<AbortController | null>(null);
  const [selected, setSelected] = useState<RGBA>({ r: 59, g: 130, b: 246, a: 1 });
  const [hover, setHover] = useState<{ color: string; x: number; y: number } | null>(null);
  const [history, setHistory] = useState<string[]>([]);
  const [message, setMessage] = useState("");
  const [canvasError, setCanvasError] = useState("");
  const [picking, setPicking] = useState(false);
  const supported = useSyncExternalStore(subscribe, hasEyeDropper, () => false);

  useEffect(() => () => eyeAbort.current?.abort(), []);
  useEffect(() => {
    readyImage.current = null;
    loupeRef.current?.getContext("2d")?.clearRect(0, 0, 110, 110);
    if (!image) return;
    let canceled = false;
    loadImage(image.url).then((source) => {
      if (canceled || !canvasRef.current) return;
      const canvas = canvasRef.current;
      canvas.width = image.width;
      canvas.height = image.height;
      const context = canvas.getContext("2d", { willReadFrequently: true });
      if (!context) throw new Error("Your browser could not open the image canvas.");
      context.drawImage(source, 0, 0);
      readyImage.current = image.url;
      position.current = { x: Math.floor(image.width / 2), y: Math.floor(image.height / 2) };
    }).catch((error) => {
      if (!canceled) setCanvasError(error instanceof Error ? error.message : "Could not display the image.");
    });
    return () => { canceled = true; readyImage.current = null; };
  }, [image]);

  function choose(color: RGBA) {
    setSelected(color);
    const hex = rgbaToHex(color, true);
    setHistory((previous) => [hex, ...previous.filter((item) => item !== hex)].slice(0, 16));
    setMessage("");
  }

  function inspect(x: number, y: number, commit = false) {
    const canvas = canvasRef.current;
    if (!canvas || !image || readyImage.current !== image.url) return;
    const px = Math.max(0, Math.min(canvas.width - 1, Math.floor(x)));
    const py = Math.max(0, Math.min(canvas.height - 1, Math.floor(y)));
    const context = canvas.getContext("2d");
    if (!context) return;
    const [r, g, b, a] = context.getImageData(px, py, 1, 1).data;
    const color = { r, g, b, a: a / 255 };
    position.current = { x: px, y: py };
    setHover({ color: rgbaToHex(color, true), x: px, y: py });
    const loupe = loupeRef.current?.getContext("2d");
    if (loupe) {
      loupe.clearRect(0, 0, 110, 110);
      loupe.imageSmoothingEnabled = false;
      loupe.drawImage(canvas, px - 5, py - 5, 11, 11, 0, 0, 110, 110);
      loupe.strokeStyle = "white";
      loupe.lineWidth = 2;
      loupe.strokeRect(49, 49, 12, 12);
      loupe.strokeStyle = "black";
      loupe.lineWidth = 1;
      loupe.strokeRect(50, 50, 10, 10);
    }
    if (commit) choose(color);
  }

  async function pickScreen() {
    const EyeDropper = (window as Window & { EyeDropper?: EyeDropperConstructor }).EyeDropper;
    if (!EyeDropper) return;
    const controller = new AbortController();
    eyeAbort.current = controller;
    setPicking(true);
    setMessage("");
    try {
      const { sRGBHex } = await new EyeDropper().open({ signal: controller.signal });
      const color = hexToRgba(sRGBHex);
      if (color) choose(color);
    } catch (error) {
      if (!controller.signal.aborted && !(error instanceof DOMException && error.name === "AbortError")) setMessage("Screen sampling failed. Try sampling an uploaded image.");
    } finally {
      if (!controller.signal.aborted) setPicking(false);
    }
  }

  async function copy(value: string) {
    try { await navigator.clipboard.writeText(value); setMessage(`Copied ${value}`); }
    catch { setMessage("Clipboard access is unavailable. Select and copy the value below."); }
  }

  const hex = rgbaToHex(selected, true);
  const hsl = rgbaToHsla(selected);
  const alpha = Number(selected.a.toFixed(3));
  const formats = [
    { name: "HEX", value: hex },
    { name: "RGB", value: alpha < 1 ? `rgba(${selected.r}, ${selected.g}, ${selected.b}, ${alpha})` : `rgb(${selected.r}, ${selected.g}, ${selected.b})` },
    { name: "HSL", value: alpha < 1 ? `hsla(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%, ${alpha})` : `hsl(${Math.round(hsl.h)}, ${Math.round(hsl.s)}%, ${Math.round(hsl.l)}%)` },
  ];

  return (
    <div className="space-y-6" onPaste={(event) => {
      const files = Array.from(event.clipboardData.files);
      if (files.length && !loading) { event.preventDefault(); setCanvasError(""); setHover(null); void selectFiles(files); }
    }}>
      <div className="flex flex-wrap items-center gap-3">
        <Button onClick={pickScreen} disabled={!supported || picking}><Pipette />{picking ? "Choose a screen pixel…" : "Pick color from screen"}</Button>
        <p className="text-xs text-muted-foreground">{supported ? "Press Escape to cancel screen sampling." : "Screen sampling is unavailable in this browser. Upload or paste an image below."}</p>
      </div>
      <ImageUpload onFiles={(files) => { setCanvasError(""); setHover(null); void selectFiles(files); }} disabled={loading} />
      {(error || canvasError) && <p role="alert" className="text-sm text-destructive">{error || canvasError}</p>}
      <div className="grid items-start gap-6 lg:grid-cols-[minmax(0,2fr)_minmax(260px,1fr)]">
        <div className="min-w-0 space-y-3 rounded-xl border border-border bg-card p-4">
          <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Image sampler</h2>{image && <Button variant="outline" onClick={() => { clear(); setHover(null); setCanvasError(""); }}>Remove image</Button>}</div>
          {image ? <>
            <div className="max-h-[560px] overflow-auto rounded-md bg-muted/40">
              <canvas ref={canvasRef} tabIndex={0} aria-label="Image color sampler. Use arrow keys to inspect pixels, Enter to select."
                className="block h-auto w-full cursor-crosshair outline-offset-2"
                onPointerMove={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  inspect((event.clientX - bounds.left) * event.currentTarget.width / bounds.width, (event.clientY - bounds.top) * event.currentTarget.height / bounds.height);
                }}
                onPointerDown={(event) => {
                  const bounds = event.currentTarget.getBoundingClientRect();
                  inspect((event.clientX - bounds.left) * event.currentTarget.width / bounds.width, (event.clientY - bounds.top) * event.currentTarget.height / bounds.height, true);
                }}
                onKeyDown={(event) => {
                  const { x, y } = position.current;
                  const steps: Record<string, [number, number]> = { ArrowLeft: [-1, 0], ArrowRight: [1, 0], ArrowUp: [0, -1], ArrowDown: [0, 1] };
                  if (steps[event.key]) { event.preventDefault(); const [dx, dy] = steps[event.key]; inspect(x + dx, y + dy); }
                  if (event.key === "Enter" || event.key === " ") { event.preventDefault(); inspect(x, y, true); }
                }} />
            </div>
            <p className="text-xs text-muted-foreground">Click or tap to select a pixel. Focus the image to use arrow keys and Enter. You can also paste an image here.</p>
          </> : <p className="py-16 text-center text-sm text-muted-foreground">Upload an image to inspect its exact pixel colors.</p>}
          <div className="flex items-center gap-4">
            <canvas ref={loupeRef} width={110} height={110} aria-label="10 times magnified pixel preview" className="size-[110px] rounded-md border border-border bg-muted/40" />
            <p className="text-xs text-muted-foreground">{image && hover ? <><span className="block font-mono text-foreground">{hover.color}</span>Pixel {hover.x}, {hover.y} · 10× zoom</> : "Hover over the image to magnify pixels."}</p>
          </div>
        </div>
        <div className="space-y-5 rounded-xl border border-border bg-card p-5">
          <h2 className="font-semibold">Selected color</h2>
          <div className="h-28 rounded-lg border border-border" style={{ backgroundColor: `rgba(${selected.r},${selected.g},${selected.b},${selected.a})` }} />
          {formats.map(({ name, value }) => <div key={name}>
            <div className="mb-1 flex items-center justify-between"><span className="text-xs font-semibold text-muted-foreground">{name}</span><Button variant="ghost" size="icon-sm" aria-label={`Copy ${name}`} onClick={() => copy(value)}><Copy /></Button></div>
            <p className="break-all font-mono text-sm select-all">{value}</p>
          </div>)}
          <p role="status" className="min-h-5 text-xs text-muted-foreground">{message}</p>
        </div>
      </div>
      <div className="space-y-3 rounded-xl border border-border bg-card p-5">
        <div className="flex items-center justify-between"><h2 className="font-semibold">Sampled colors</h2><Button variant="ghost" disabled={!history.length} onClick={() => setHistory([])}>Clear history</Button></div>
        {history.length ? <div className="flex flex-wrap gap-3">{history.map((color) => <button key={color} className="size-10 rounded-md border border-border focus-visible:outline-2 focus-visible:outline-offset-2" title={color} aria-label={`Select ${color}`} style={{ backgroundColor: color }} onClick={() => { const rgba = hexToRgba(color); if (rgba) choose(rgba); }} />)}</div> : <p className="text-xs text-muted-foreground">Selected colors appear here during this visit.</p>}
      </div>
    </div>
  );
}
