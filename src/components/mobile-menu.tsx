"use client";

import { useEffect, useSyncExternalStore } from "react";
import { createPortal } from "react-dom";
import { useState } from "react";
import Link from "next/link";
import { Menu, Moon, Sun, X } from "lucide-react";
import { cn } from "@/lib/utils";
import { buttonVariants } from "@/components/ui/button";
import Logo from "@/components/logo";

const navLinks = [
  { href: "/", label: "All Tools" },
  { href: "/about", label: "About" },
];

// Observes document.documentElement's class list so the switcher stays in sync
// with the desktop ThemeToggle without sharing state through props or context.
function useIsDark() {
  return useSyncExternalStore(
    (callback) => {
      const observer = new MutationObserver(callback);
      observer.observe(document.documentElement, {
        attributes: true,
        attributeFilter: ["class"],
      });
      return () => observer.disconnect();
    },
    () => document.documentElement.classList.contains("dark"),
    () => false, // server snapshot — always light during SSR
  );
}

function applyTheme(dark: boolean) {
  document.documentElement.classList.toggle("dark", dark);
  try {
    localStorage.setItem("theme", dark ? "dark" : "light");
  } catch {
    // ignore storage errors (e.g. private browsing)
  }
}

export default function MobileMenu() {
  const [open, setOpen] = useState(false);

  // SSR-safe client detection — avoids setState-in-effect pattern
  const isClient = useSyncExternalStore(
    () => () => {},
    () => true,
    () => false,
  );

  const isDark = useIsDark();

  // Lock body scroll while sidebar is open
  useEffect(() => {
    document.body.style.overflow = open ? "hidden" : "";
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  // Close on Escape key
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  return (
    <>
      {/* Hamburger trigger — stays inside the navbar */}
      <button
        onClick={() => setOpen(true)}
        aria-label="Open navigation menu"
        className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
      >
        <Menu className="size-4" />
      </button>

      {/*
       * Portal: backdrop + sidebar are hoisted to <body> so they are never
       * constrained by the header's stacking context (sticky + z-50).
       */}
      {isClient &&
        createPortal(
          <>
            {/* Backdrop */}
            <div
              aria-hidden="true"
              onClick={() => setOpen(false)}
              className={cn(
                "fixed inset-0 z-200 bg-black/50 transition-opacity duration-300",
                open ? "opacity-100 pointer-events-auto" : "opacity-0 pointer-events-none",
              )}
            />

            {/* Sidebar panel */}
            <aside
              aria-label="Mobile navigation"
              className={cn(
                "fixed inset-y-0 right-0 z-201 flex w-72 flex-col border-l border-border bg-background",
                "transition-transform duration-300 ease-in-out",
                open ? "translate-x-0" : "translate-x-full",
              )}
            >
              {/* Sidebar header */}
              <div className="flex items-center justify-between border-b border-border px-5 py-3">
                <Link
                  href="/"
                  onClick={() => setOpen(false)}
                  className="flex items-center tracking-tight transition-opacity hover:opacity-90"
                >
                  <Logo height={28} className="h-7 w-auto" />
                </Link>

                <button
                  onClick={() => setOpen(false)}
                  aria-label="Close navigation menu"
                  className={cn(buttonVariants({ variant: "ghost", size: "icon-sm" }))}
                >
                  <X className="size-4" />
                </button>
              </div>

              {/* Nav links */}
              <nav className="flex flex-1 flex-col gap-1 px-3 py-5">
                {navLinks.map((link) => (
                  <Link
                    key={link.href}
                    href={link.href}
                    onClick={() => setOpen(false)}
                    className={cn(
                      buttonVariants({ variant: "ghost", size: "sm" }),
                      "justify-start text-sm",
                    )}
                  >
                    {link.label}
                  </Link>
                ))}
                <a
                  href="https://github.com/hasiburdev/webtools"
                  target="_blank"
                  rel="noopener noreferrer"
                  onClick={() => setOpen(false)}
                  className={cn(
                    buttonVariants({ variant: "ghost", size: "sm" }),
                    "justify-start text-sm",
                  )}
                >
                  GitHub
                </a>
              </nav>

              {/* Theme switcher */}
              <div className="border-t border-border px-4 py-4">
                <p className="mb-2.5 px-1 text-xs font-semibold uppercase tracking-widest text-muted-foreground">
                  Theme
                </p>
                <div className="grid grid-cols-2 gap-1">
                  <button
                    onClick={() => applyTheme(false)}
                    aria-pressed={!isDark}
                    className={cn(
                      buttonVariants({ variant: isDark ? "ghost" : "secondary", size: "sm" }),
                      "justify-center gap-2",
                    )}
                  >
                    <Sun className="size-3.5" />
                    Light
                  </button>
                  <button
                    onClick={() => applyTheme(true)}
                    aria-pressed={isDark}
                    className={cn(
                      buttonVariants({ variant: isDark ? "secondary" : "ghost", size: "sm" }),
                      "justify-center gap-2",
                    )}
                  >
                    <Moon className="size-3.5" />
                    Dark
                  </button>
                </div>
              </div>
            </aside>
          </>,
          document.body,
        )}
    </>
  );
}
