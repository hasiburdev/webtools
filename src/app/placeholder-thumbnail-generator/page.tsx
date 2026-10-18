import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { pageSeo } from "@/content/seo";
import { PlaceholderThumbnailGenerator } from "@/modules/placeholder-thumbnail-generator";

export const metadata: Metadata = pageSeo.placeholderThumbnailGenerator;

export default function PlaceholderThumbnailGeneratorPage() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Page header */}
      <section className="border-b border-border bg-card px-6 pt-4 pb-6">
        <div className="mx-auto max-w-6xl">
          <nav className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="transition-colors hover:text-foreground">
              Tools
            </Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">Placeholder Thumbnail Generator</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Placeholder Thumbnail Generator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate custom placeholder thumbnails with gradients, patterns, and typography. Export as PNG, WebP, or SVG.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <PlaceholderThumbnailGenerator />
        </div>
      </section>
    </div>
  );
}
