"use client";

import { useEffect, useRef, useState } from "react";
import { Download, Eye, EyeOff, FileText, LoaderCircle, Sparkles, Trash2, Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { downloadBlob, formatBytes } from "@/lib/browser-images";
import { documentThemes, MAX_MARKDOWN_LENGTH, pdfFilename, sampleMarkdown, type DocumentTheme, type MarkdownPdfOptions } from "./settings";

export function MarkdownToPdf() {
  const [markdown, setMarkdown] = useState(sampleMarkdown);
  const [filename, setFilename] = useState("document");
  const [options, setOptions] = useState<MarkdownPdfOptions>({ theme: "modern", pageSize: "A4", fontSize: 11 });
  const [showPreview, setShowPreview] = useState(true);
  const [result, setResult] = useState<{ key: string; blob: Blob; url: string } | null>(null);
  const [failure, setFailure] = useState<{ key: string; message: string } | null>(null);
  const [fileError, setFileError] = useState("");
  const [notice, setNotice] = useState("");
  const fileInput = useRef<HTMLInputElement>(null);
  const uploadVersion = useRef(0);
  const key = JSON.stringify([markdown, options]);
  const hasContent = Boolean(markdown.trim());
  const error = failure?.key === key ? failure.message : "";
  const ready = hasContent && result?.key === key && !error;
  const pending = hasContent && !ready && !error;
  const previewUrl = result?.url;

  useEffect(() => {
    if (!markdown.trim()) return;
    let cancelled = false;
    const timeout = setTimeout(async () => {
      try {
        const { createMarkdownPdf } = await import("./create-markdown-pdf");
        if (cancelled) return;
        const blob = await createMarkdownPdf(markdown, options);
        if (!cancelled) {
          setFailure(null);
          setResult({ key, blob, url: URL.createObjectURL(blob) });
        }
      } catch (error) {
        if (!cancelled) setFailure({ key, message: error instanceof Error ? error.message : "Could not create the PDF. Try a smaller document." });
      }
    }, 600);
    return () => { cancelled = true; clearTimeout(timeout); };
  }, [markdown, options, key]);

  useEffect(() => {
    if (!result) return;
    return () => URL.revokeObjectURL(result.url);
  }, [result]);

  useEffect(() => () => { uploadVersion.current++; }, []);

  function updateMarkdown(value: string) {
    uploadVersion.current++;
    setMarkdown(value);
    setFileError("");
    setNotice("");
  }

  function downloadPdf() {
    if (!result || !ready) return;
    const name = pdfFilename(filename);
    downloadBlob(result.blob, name);
    setNotice(`Downloaded ${name}`);
  }

  async function upload(file?: File) {
    if (!file) return;
    const request = ++uploadVersion.current;
    setFileError("");
    try {
      if (!/\.(md|markdown|txt)$/i.test(file.name)) throw new Error("Choose a .md, .markdown, or .txt file.");
      if (file.size > 500_000) throw new Error("Choose a Markdown file smaller than 500 KB.");
      const text = await file.text();
      if (request !== uploadVersion.current) return;
      if (text.length > MAX_MARKDOWN_LENGTH) throw new Error("Keep your document below 100,000 characters.");
      setMarkdown(text);
      setFilename(file.name.replace(/\.(md|markdown|txt)$/i, ""));
      setNotice(`Opened ${file.name}`);
    } catch (error) {
      if (request === uploadVersion.current) setFileError(error instanceof Error ? error.message : "Could not read this file.");
    }
  }

  return <div className="space-y-6">
    <div className="grid gap-6 lg:grid-cols-[1fr_auto]">
      <fieldset>
        <legend className="mb-3 text-sm font-semibold">Document theme</legend>
        <div className="grid gap-3 sm:grid-cols-3">
          {Object.entries(documentThemes).map(([id, theme]) => <label key={id} className={`relative flex cursor-pointer items-center gap-3 rounded-lg border p-3 transition-colors ${options.theme === id ? "border-primary bg-muted/50 ring-1 ring-primary" : "border-border bg-card hover:bg-muted/30"}`}>
            <input type="radio" name="document-theme" value={id} checked={options.theme === id} onChange={() => { setOptions({ ...options, theme: id as DocumentTheme }); setNotice(""); }} className="sr-only peer" />
            <span aria-hidden="true" style={{ backgroundColor: theme.paper, color: theme.accent, fontFamily: theme.font === "Times-Roman" ? "Georgia, serif" : "Arial, sans-serif" }} className="flex size-11 shrink-0 items-center justify-center border border-black/10 text-2xl peer-focus-visible:ring-2 peer-focus-visible:ring-ring">Aa</span>
            <span><span className="block text-sm font-semibold">{theme.name}</span><span className="block text-xs text-muted-foreground">{theme.description}</span></span>
          </label>)}
        </div>
      </fieldset>
      <div className="flex flex-wrap items-end gap-4">
        <label className="space-y-2 text-sm font-medium">Page size
          <select value={options.pageSize} onChange={(event) => { setOptions({ ...options, pageSize: event.target.value as MarkdownPdfOptions["pageSize"] }); setNotice(""); }} className="block h-9 rounded-md border border-border bg-background px-3 text-sm">
            <option value="A4">A4</option><option value="LETTER">US Letter</option>
          </select>
        </label>
        <label className="space-y-2 text-sm font-medium">Text size
          <select value={options.fontSize} onChange={(event) => { setOptions({ ...options, fontSize: Number(event.target.value) }); setNotice(""); }} className="block h-9 rounded-md border border-border bg-background px-3 text-sm">
            <option value={10}>Small · 10 pt</option><option value={11}>Regular · 11 pt</option><option value={12}>Large · 12 pt</option>
          </select>
        </label>
      </div>
    </div>

    <div className="flex flex-wrap items-center justify-between gap-3">
      <p className="text-xs text-muted-foreground">Headings, emphasis, lists, tables, quotes, links, and code. HTML is displayed as text; images use their alt text.</p>
      <div className="flex flex-wrap items-center gap-2">
        <Button variant="outline" size="sm" onClick={() => setShowPreview(!showPreview)} aria-expanded={showPreview} aria-controls="markdown-pdf-preview">{showPreview ? <EyeOff /> : <Eye />}{showPreview ? "Hide preview" : "Show PDF preview"}</Button>
        <Button size="sm" disabled={!ready} onClick={downloadPdf}>{pending ? <LoaderCircle className="animate-spin" /> : <Download />}{pending ? "Preparing PDF…" : "Download PDF"}</Button>
      </div>
    </div>

    <div className={`grid gap-5 ${showPreview ? "lg:grid-cols-2" : ""}`}>
      <section aria-label="Markdown editor" className="min-w-0 overflow-hidden rounded-xl border border-border bg-card">
        <div className="flex flex-wrap items-center justify-between gap-3 border-b border-border px-4 py-3">
          <label htmlFor="markdown-source" className="flex items-center gap-2 text-sm font-semibold"><FileText className="size-4" />Markdown</label>
          <div className="flex flex-wrap gap-1.5">
            <input ref={fileInput} type="file" accept=".md,.markdown,.txt,text/markdown,text/plain" aria-label="Upload Markdown file" className="hidden" onChange={(event) => { void upload(event.target.files?.[0]); event.target.value = ""; }} />
            <Button variant="outline" size="xs" onClick={() => fileInput.current?.click()}><Upload />Upload</Button>
            <Button variant="outline" size="xs" onClick={() => { updateMarkdown(sampleMarkdown); setFilename("document"); }}><Sparkles />Sample</Button>
            <Button variant="ghost" size="xs" disabled={!markdown} onClick={() => updateMarkdown("")}><Trash2 />Clear</Button>
          </div>
        </div>
        <Textarea id="markdown-source" value={markdown} maxLength={MAX_MARKDOWN_LENGTH} onChange={(event) => updateMarkdown(event.target.value)} spellCheck={false} placeholder="# Your next great document&#10;&#10;Write or paste Markdown here…" className="min-h-[580px] resize-y rounded-none border-0 bg-transparent p-5 font-mono text-sm leading-relaxed shadow-none focus-visible:ring-inset" />
        <div className="border-t border-border px-4 py-2 text-xs text-muted-foreground">{markdown.length.toLocaleString()} / 100,000 characters · .md, .markdown, or .txt</div>
      </section>

      {showPreview && <section id="markdown-pdf-preview" aria-label="PDF preview" aria-busy={pending} className="flex min-w-0 flex-col overflow-hidden rounded-xl border border-border bg-muted/30">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-border bg-card px-4 py-3">
          <h2 className="flex items-center gap-2 text-sm font-semibold"><Eye className="size-4" />PDF preview</h2>
          <span className="text-xs text-muted-foreground">{documentThemes[options.theme].name} · {options.pageSize === "LETTER" ? "US Letter" : "A4"}</span>
        </div>
        <div className="relative flex min-h-[580px] flex-1 flex-col">
          {hasContent && previewUrl && !error && <iframe src={`${previewUrl}#toolbar=0&navpanes=0&view=FitH`} title="Generated Markdown PDF" className={`min-h-[580px] w-full flex-1 border-0 ${pending ? "pointer-events-none opacity-30" : ""}`} />}
          {(!hasContent || pending || error) && <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 p-8 text-center text-sm text-muted-foreground">
            {pending ? <><LoaderCircle className="size-6 animate-spin" /><p>Preparing your PDF…</p></> : <><FileText className="size-8" /><p>{error ? "Preview unavailable. Edit your document to try again." : "Write or upload Markdown to preview your PDF."}</p></>}
          </div>}
        </div>
        <p className="border-t border-border px-4 py-2 text-xs text-muted-foreground">Preview uses your browser’s PDF viewer.{ready && previewUrl && <> <a href={previewUrl} target="_blank" rel="noopener noreferrer" className="underline underline-offset-2">Open PDF in a new tab</a></>}</p>
      </section>}
    </div>

    {(fileError || error) && <p role="alert" className="text-sm text-destructive">{fileError || error}</p>}
    <div className="flex flex-wrap items-end gap-4 rounded-xl border border-border bg-card p-5">
      <label htmlFor="pdf-filename" className="space-y-2 text-sm font-medium">File name
        <div className="flex items-center gap-2"><Input id="pdf-filename" value={filename} maxLength={100} onChange={(event) => setFilename(event.target.value)} placeholder="document" className="w-48" /><span className="text-xs text-muted-foreground">.pdf</span></div>
      </label>
      <Button disabled={!ready} onClick={downloadPdf}><Download />Download PDF</Button>
      <p role="status" aria-live="polite" className="pb-2 text-xs text-muted-foreground">{notice || (pending ? "Updating PDF…" : ready && result ? `Ready · ${formatBytes(result.blob.size)}` : "Add Markdown to get started.")}</p>
    </div>
  </div>;
}
