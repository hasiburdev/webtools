import type { Metadata } from "next";
import Link from "next/link";
import { pageSeo } from "@/content/seo";

export const metadata: Metadata = pageSeo.home;
import { ArrowRight } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

const tools = [
  {
    name: "Password Generator",
    description: "Create strong, secure passwords with custom length and character rules.",
    href: "/password-generator",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M15.75 5.25a3 3 0 0 1 3 3m3 0a6 6 0 0 1-7.029 5.912c-.563-.097-1.159.026-1.563.43L10.5 17.25H8.25v2.25H6v2.25H2.25v-2.818c0-.597.237-1.17.659-1.591l6.499-6.499c.404-.404.527-1 .43-1.563A6 6 0 0 1 21.75 8.25Z" />
      </svg>
    ),
    iconClass: "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/60",
  },
  {
    name: "Slugify",
    description: "Convert any text into a clean, URL-friendly slug instantly.",
    href: "/slugify",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
      </svg>
    ),
    iconClass: "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/60",
  },
  {
    name: "Image Resizer",
    description: "Resize images to any exact dimensions, right in your browser.",
    href: "/image-resizer",
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M3.75 3.75v4.5m0-4.5h4.5m-4.5 0L9 9M3.75 20.25v-4.5m0 4.5h4.5m-4.5 0L9 15M20.25 3.75h-4.5m4.5 0v4.5m0-4.5L15 9m5.25 11.25h-4.5m4.5 0v-4.5m0 4.5L15 15" />
      </svg>
    ),
    iconClass: "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60",
  },
  {
    name: "Image Compressor",
    description: "Compress images to reduce file size without sacrificing quality.",
    href: "/",
    disabled: true,
    icon: (
      <svg
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        className="h-5 w-5"
      >
        <path d="M9 9V4.5M9 9H4.5M9 9 3.75 3.75M9 15v4.5M9 15H4.5M9 15l-5.25 5.25M15 9h4.5M15 9V4.5M15 9l5.25-5.25M15 15h4.5M15 15v4.5m0-4.5 5.25 5.25" />
      </svg>
    ),
    iconClass: "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/60",
  },
];

export default function Home() {
  return (
    <div className="flex flex-1 flex-col">
      {/* Hero */}
      <section className="border-b border-border bg-card px-6 py-20 text-center">
        <div className="mx-auto max-w-2xl">
          <Badge variant="outline">Free · No signup · Browser-based</Badge>
          <p className="mt-2 text-xs text-muted-foreground">
            by{" "}
            <a
              href="https://hasiburhasan.com"
              target="_blank"
              rel="noopener noreferrer"
              className="font-medium underline-offset-4 hover:underline"
            >
              Hasibur Rahman Hasan
            </a>
          </p>
          <h1 className="mt-5 text-4xl font-bold tracking-tight text-foreground sm:text-5xl">
            Developer tools, <span className="text-muted-foreground">without the friction.</span>
          </h1>
          <p className="mt-5 text-lg leading-8 text-muted-foreground">
            A growing collection of fast, simple, browser-based utilities for developers and
            designers. No accounts, no tracking, no fuss.
          </p>
        </div>
      </section>

      {/* Tools grid */}
      <section className="flex-1 px-6 py-16">
        <div className="mx-auto max-w-6xl">
          <p className="mb-6 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
            All Tools
          </p>
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {tools.map((tool) =>
              tool.disabled ? (
                <div key={tool.name} className="cursor-not-allowed">
                  <Card className="h-full select-none opacity-60">
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <span
                          className={`flex h-10 w-10 items-center justify-center ${tool.iconClass}`}
                        >
                          {tool.icon}
                        </span>
                        <Badge variant="outline" className="text-[10px]">
                          Coming Soon
                        </Badge>
                      </div>
                      <CardTitle>{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground">
                        Coming soon
                      </span>
                    </CardContent>
                  </Card>
                </div>
              ) : (
                <Link key={tool.name} href={tool.href} className="group block">
                  <Card className="h-full transition-all duration-200 group-hover:ring-foreground/20 group-hover:shadow-md">
                    <CardHeader>
                      <span
                        className={`flex h-10 w-10 items-center justify-center ${tool.iconClass}`}
                      >
                        {tool.icon}
                      </span>
                      <CardTitle>{tool.name}</CardTitle>
                      <CardDescription>{tool.description}</CardDescription>
                    </CardHeader>
                    <CardContent className="mt-auto">
                      <span className="flex items-center gap-1 text-xs text-muted-foreground transition-colors group-hover:text-foreground">
                        Open tool
                        <ArrowRight className="size-3 transition-transform group-hover:translate-x-0.5" />
                      </span>
                    </CardContent>
                  </Card>
                </Link>
              ),
            )}
          </div>
        </div>
      </section>
    </div>
  );
}
