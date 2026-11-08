"use client";

import { useRef, useState } from "react";
import { Upload } from "lucide-react";
import { Button } from "@/components/ui/button";
import { IMAGE_ACCEPT } from "@/lib/browser-images";
import { cn } from "@/lib/utils";

export function ImageUpload({ onFiles, multiple = false, disabled = false }: {
  onFiles: (files: File[]) => void;
  multiple?: boolean;
  disabled?: boolean;
}) {
  const input = useRef<HTMLInputElement>(null);
  const [dragging, setDragging] = useState(false);

  return (
    <div
      className={cn("rounded-xl border-2 border-dashed border-border bg-card p-8 text-center", dragging && "border-primary bg-muted")}
      onDragOver={(event) => { event.preventDefault(); if (!disabled) setDragging(true); }}
      onDragLeave={() => setDragging(false)}
      onDrop={(event) => {
        event.preventDefault();
        setDragging(false);
        if (!disabled) {
          const files = Array.from(event.dataTransfer.files);
          if (files.length) onFiles(multiple ? files : files.slice(0, 1));
        }
      }}
    >
      <Upload className="mx-auto mb-3 size-6 text-muted-foreground" />
      <p className="mb-2 text-sm text-muted-foreground">Drop {multiple ? "images" : "an image"} here, or choose from your device.</p>
      <Button variant="outline" disabled={disabled} onClick={() => input.current?.click()}>
        {disabled ? "Processing…" : multiple ? "Choose images" : "Choose image"}
      </Button>
      <input ref={input} aria-label={multiple ? "Upload images" : "Upload image"} type="file" accept={IMAGE_ACCEPT} multiple={multiple} disabled={disabled} className="sr-only"
        onChange={(event) => {
          const files = Array.from(event.target.files ?? []);
          if (files.length) onFiles(files);
          event.target.value = "";
        }} />
      <p className="mt-3 text-xs text-muted-foreground">PNG, JPEG, WebP · Up to 30 MB per image · Files stay on your device</p>
    </div>
  );
}
