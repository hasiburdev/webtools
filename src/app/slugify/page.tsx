import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { SlugifyTool } from "@/modules/slugify";

export const metadata: Metadata = {
  title: "Slugify — WebTools",
  description:
    "Convert any text into a clean, URL-friendly slug. Handles accented characters, symbols, and custom separators.",
};

export default function SlugifyPage() {
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
            <span className="text-foreground">Slugify</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">Slugify</h1>
        </div>
      </section>

      {/* Tool */}
      <section className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-lg">
          <SlugifyTool />
        </div>
      </section>
    </div>
  );
}
