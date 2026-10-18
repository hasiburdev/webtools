import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";
import { pageSeo } from "@/content/seo";
import { QrCodeGenerator } from "@/modules/qr-code-generator";

export const metadata: Metadata = pageSeo.qrCodeGenerator;

export default function QrCodeGeneratorPage() {
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
            <span className="text-foreground">QR Code Generator</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            QR Code Generator
          </h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Generate customized QR codes for URLs, WiFi networks, contact cards, emails, and SMS. Add logos and custom colors.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="flex-1 px-6 py-10">
        <div className="mx-auto max-w-6xl">
          <QrCodeGenerator />
        </div>
      </section>
    </div>
  );
}
