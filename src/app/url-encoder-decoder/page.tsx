import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { pageSeo } from "@/content/seo";
import { UrlEncoderDecoder } from "@/modules/url-encoder-decoder";

export const metadata: Metadata = pageSeo.urlEncoderDecoder;

export default function UrlEncoderDecoderPage() {
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
            <span className="text-foreground">URL Encoder/Decoder</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            URL Encoder & Decoder
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Safely encode and decode URLs, paths, and query strings with real-time parameter inspection.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <UrlEncoderDecoder />
        </div>
      </section>
    </div>
  );
}
