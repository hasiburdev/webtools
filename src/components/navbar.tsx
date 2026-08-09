import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import MobileMenu from "@/components/mobile-menu";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center gap-2.5 text-base font-semibold tracking-tight text-foreground"
        >
          <span className="flex h-7 w-7 items-center justify-center bg-foreground">
            <svg
              className="h-4 w-4 text-background"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M14.7 6.3a1 1 0 0 0 0 1.4l1.6 1.6a1 1 0 0 0 1.4 0l3.77-3.77a6 6 0 0 1-7.94 7.94l-6.91 6.91a2.12 2.12 0 0 1-3-3l6.91-6.91a6 6 0 0 1 7.94-7.94l-3.76 3.76z" />
            </svg>
          </span>
          WebTools
        </Link>

        {/* Desktop nav — hidden on mobile */}
        <div className="hidden items-center gap-1 sm:flex">
          <Link href="/" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            All Tools
          </Link>
          <Link href="/about" className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}>
            About
          </Link>
          <a
            href="https://github.com/hasiburdev/webtools"
            target="_blank"
            rel="noopener noreferrer"
            className={cn(buttonVariants({ variant: "ghost", size: "sm" }))}
          >
            GitHub
          </a>
          <ThemeToggle />
        </div>

        {/* Mobile menu trigger — hidden on sm+ */}
        <div className="flex items-center sm:hidden">
          <MobileMenu />
        </div>
      </nav>
    </header>
  );
}
