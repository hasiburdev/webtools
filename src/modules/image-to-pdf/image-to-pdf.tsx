"use client";

import { useEffect, useRef, useState } from "react";
import Image from "next/image";
import { ArrowDown, ArrowUp, Download, X } from "lucide-react";
import { ImageUpload } from "@/components/image-upload";
import { Button } from "@/components/ui/button";
import { downloadBlob, formatBytes, readLocalImage, type LocalImage } from "@/lib/browser-images";
import { createImagePdf, type PdfOptions } from "./create-image-pdf";

export function ImageToPdf() {
  const [images, setImages] = useState<LocalImage[]>([]);
  const imagesRef = useRef<LocalImage[]>([]);
  const busyRef = useRef(false);
  const version = useRef(0);
  const controller = useRef<AbortController | null>(null);
  const [busy, setBusy] = useState(false);
  const [progress, setProgress] = useState("");
  const [error, setError] = useState("");
  const [options, setOptions] = useState<PdfOptions>({ pageSize: "a4", orientation: "portrait", margin: 18, quality: 90 });

  useEffect(() => () => {
    version.current++;
    controller.current?.abort();
    imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url));
  }, []);

  function updateImages(next: LocalImage[]) {
    imagesRef.current = next;
    setImages(next);
  }

  async function addFiles(files: File[]) {
    if (busyRef.current) return;
    setError("");
    if (imagesRef.current.length + files.length > 20) { setError("A PDF can contain up to 20 images. Remove some images before adding more."); return; }
    const total = [...imagesRef.current.map((image) => image.file), ...files].reduce((sum, file) => sum + file.size, 0);
    if (total > 100 * 1024 * 1024) { setError("Keep the combined image size below 100 MB."); return; }
    const request = ++version.current;
    busyRef.current = true;
    setBusy(true);
    const added: LocalImage[] = [];
    try {
      for (let index = 0; index < files.length; index++) {
        setProgress(`Opening image ${index + 1} of ${files.length}…`);
        added.push(await readLocalImage(files[index]));
        if (request !== version.current) { added.forEach((image) => URL.revokeObjectURL(image.url)); return; }
      }
      updateImages([...imagesRef.current, ...added]);
    } catch (error) {
      added.forEach((image) => URL.revokeObjectURL(image.url));
      if (request === version.current) setError(error instanceof Error ? error.message : "Could not open the images.");
    } finally {
      if (request === version.current) { busyRef.current = false; setBusy(false); setProgress(""); }
    }
  }

  function remove(index: number) {
    if (busyRef.current) return;
    URL.revokeObjectURL(imagesRef.current[index].url);
    updateImages(imagesRef.current.filter((_, itemIndex) => itemIndex !== index));
    setError("");
  }

  function move(index: number, direction: number) {
    if (busyRef.current) return;
    const next = [...imagesRef.current];
    const target = index + direction;
    if (target < 0 || target >= next.length) return;
    [next[index], next[target]] = [next[target], next[index]];
    updateImages(next);
  }

  async function generate() {
    if (busyRef.current || !imagesRef.current.length) return;
    busyRef.current = true;
    setBusy(true);
    setError("");
    setProgress("Preparing PDF…");
    const request = ++version.current;
    controller.current = new AbortController();
    try {
      const blob = await createImagePdf(imagesRef.current, options, (page) => {
        if (request === version.current) setProgress(`Creating page ${page} of ${imagesRef.current.length}…`);
      }, controller.current.signal);
      if (request === version.current) { downloadBlob(blob, "images.pdf"); setProgress(`Downloaded ${imagesRef.current.length}-page PDF · ${formatBytes(blob.size)}`); }
    } catch (error) {
      if (request === version.current) { setError(error instanceof Error ? error.message : "PDF generation failed. Try fewer or smaller images."); setProgress(""); }
    } finally {
      if (request === version.current) { busyRef.current = false; setBusy(false); }
    }
  }

  return (
    <div className="space-y-6">
      <ImageUpload onFiles={addFiles} multiple disabled={busy} />
      <p className="text-xs text-muted-foreground">Up to 20 images and 100 MB combined. One image per page; use the arrows to set page order.</p>
      {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
      <fieldset disabled={busy} className="flex flex-wrap gap-6 rounded-xl border border-border bg-card p-5">
        <legend className="px-1 text-sm font-semibold">PDF settings</legend>
        <label className="space-y-2 text-sm font-medium">Page size
          <select aria-label="Page size" value={options.pageSize} onChange={(event) => setOptions({ ...options, pageSize: event.target.value as PdfOptions["pageSize"] })} className="block rounded-md border border-border bg-background p-2">
            <option value="a4">A4</option><option value="letter">US Letter</option><option value="fit">Fit to image</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">Orientation
          <select aria-label="Orientation" disabled={options.pageSize === "fit" || busy} value={options.orientation} onChange={(event) => setOptions({ ...options, orientation: event.target.value as PdfOptions["orientation"] })} className="block rounded-md border border-border bg-background p-2 disabled:opacity-50">
            <option value="portrait">Portrait</option><option value="landscape">Landscape</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">Margins
          <select aria-label="Margins" value={options.margin} onChange={(event) => setOptions({ ...options, margin: Number(event.target.value) })} className="block rounded-md border border-border bg-background p-2">
            <option value={0}>None</option><option value={18}>Small (¼ inch)</option><option value={36}>Large (½ inch)</option>
          </select>
        </label>
        <label className="min-w-48 space-y-2 text-sm font-medium">Image quality: {options.quality}%
          <input aria-label="PDF image quality" type="range" min={10} max={100} value={options.quality} onChange={(event) => setOptions({ ...options, quality: Number(event.target.value) })} className="block w-full accent-primary" />
        </label>
        <p className="w-full text-xs text-muted-foreground">Images keep their proportions and are centered on each page. Lower quality creates smaller PDFs. Transparent areas become white; animated images use the first frame.</p>
      </fieldset>
      {images.length > 0 && <div className="space-y-4">
        <div className="flex items-center justify-between gap-3"><h2 className="font-semibold">Page order · {images.length} {images.length === 1 ? "image" : "images"}</h2><Button variant="outline" disabled={busy} onClick={() => { imagesRef.current.forEach((image) => URL.revokeObjectURL(image.url)); updateImages([]); setProgress(""); setError(""); }}>Clear all</Button></div>
        <ol className="space-y-3">
          {images.map((image, index) => <li key={image.url} className="flex flex-wrap items-center gap-3 rounded-xl border border-border bg-card p-3">
            <span className="w-6 text-center text-sm font-semibold">{index + 1}</span>
            <Image src={image.url} alt={`Page ${index + 1} preview`} width={64} height={64} unoptimized className="size-16 rounded-md bg-muted object-contain" />
            <div className="min-w-0 flex-1"><p className="truncate text-sm font-medium">{image.file.name}</p><p className="text-xs text-muted-foreground">{image.width} × {image.height} · {formatBytes(image.file.size)}</p></div>
            <div className="flex gap-1">
              <Button variant="outline" size="icon" disabled={busy || index === 0} aria-label={`Move page ${index + 1} up`} onClick={() => move(index, -1)}><ArrowUp /></Button>
              <Button variant="outline" size="icon" disabled={busy || index === images.length - 1} aria-label={`Move page ${index + 1} down`} onClick={() => move(index, 1)}><ArrowDown /></Button>
              <Button variant="ghost" size="icon" disabled={busy} aria-label={`Remove page ${index + 1}`} onClick={() => remove(index)}><X /></Button>
            </div>
          </li>)}
        </ol>
      </div>}
      <div className="flex flex-wrap items-center gap-4">
        <Button disabled={busy || !images.length} onClick={generate}><Download />{busy ? "Processing…" : "Download PDF"}</Button>
        <p role="status" className="text-sm text-muted-foreground">{progress}</p>
      </div>
    </div>
  );
}
