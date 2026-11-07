import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { pageSeo } from "@/content/seo";

import { FormattersTool } from "@/modules/formatters";

export const metadata: Metadata = pageSeo.formatters;

export default function FormattersPage() {
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
            <span className="text-foreground">Formatters</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">Formatters</h1>
          <p className="mt-2 text-sm text-muted-foreground">
            Format, beautify, validate, and minify code and data with custom indentation, key sorting, and instant syntax checks. Free, instant, and completely browser-based.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="flex-1 px-6 py-8">
        <div className="mx-auto max-w-6xl">
          <FormattersTool />
        </div>
      </section>
    </div>
  );
}
