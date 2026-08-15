import Link from "next/link";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import ThemeToggle from "@/components/theme-toggle";
import MobileMenu from "@/components/mobile-menu";
import Logo from "@/components/logo";

export default function Navbar() {
  return (
    <header className="sticky top-0 z-50 border-b border-border bg-background/80 backdrop-blur">
      <nav className="mx-auto flex max-w-6xl items-center justify-between px-6 py-3">
        {/* Logo */}
        <Link
          href="/"
          className="flex items-center tracking-tight transition-opacity hover:opacity-90"
        >
          <Logo height={32} className="h-8 w-auto" priority />
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
