import type { ReactNode } from "react";
import Link from "next/link";
import { ChevronRight } from "lucide-react";

export function ToolPage({ title, description, children }: { title: string; description: string; children: ReactNode }) {
  return (
    <div className="flex flex-1 flex-col">
      <section className="border-b border-border bg-card px-6 pt-4 pb-6">
        <div className="mx-auto max-w-6xl">
          <nav aria-label="Breadcrumb" className="mb-4 flex items-center gap-1 text-xs text-muted-foreground">
            <Link href="/" className="hover:text-foreground">Tools</Link>
            <ChevronRight className="size-3" />
            <span className="text-foreground">{title}</span>
          </nav>
          <h1 className="text-3xl font-bold tracking-tight">{title}</h1>
          <p className="mt-2 text-sm text-muted-foreground">{description}</p>
        </div>
      </section>
      <section className="flex-1 px-6 py-10"><div className="mx-auto max-w-6xl">{children}</div></section>
    </div>
  );
}
