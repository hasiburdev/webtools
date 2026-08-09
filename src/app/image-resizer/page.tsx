import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { ImageResizer } from "@/modules/image-resizer";

export const metadata: Metadata = {
  title: "Image Resizer — WebTools",
  description:
    "Crop, resize, and convert images to any dimension right in your browser. Drag-and-drop upload, interactive crop selection, and instant download. No server, no signup.",
};

export default function ImageResizerPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Page header */}
      <section className="border-b border-border bg-card px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Tools
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Image Resizer</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">Image Resizer</h1>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Drag in an image, draw a crop selection on the canvas, set your output dimensions, then
            download &mdash; all in your browser, no upload required.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-6xl">
          <ImageResizer />
        </div>
      </section>
    </div>
  );
}
