import type { Metadata } from "next";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

import { PasswordGenerator } from "@/modules/password-generator";

export const metadata: Metadata = {
  title: "Password Generator — WebTools",
  description:
    "Generate strong, secure passwords instantly. Customize length, uppercase, lowercase, numbers, and symbols.",
};

export default function PasswordGeneratorPage() {
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
            <span className="text-foreground">Password Generator</span>
          </nav>

          <h1 className="text-3xl font-bold tracking-tight text-foreground">
            Password Generator
          </h1>
          <p className="mt-2 max-w-lg text-muted-foreground">
            Generate strong, secure passwords instantly. Choose length and
            character types — all processing happens in your browser.
          </p>
        </div>
      </section>

      {/* Tool */}
      <section className="flex-1 px-6 py-12">
        <div className="mx-auto max-w-lg">
          <PasswordGenerator />
        </div>
      </section>
    </div>
  );
}
