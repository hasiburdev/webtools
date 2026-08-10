export type HomeToolIconName =
  | "passwordGenerator"
  | "slugify"
  | "imageResizer"
  | "imageCompressor";

export const homeHero = {
  badge: "Free · No signup · Browser-based",
  author: {
    name: "Hasibur Rahman Hasan",
    url: "https://hasiburhasan.com",
  },
  titlePrefix: "Developer tools,",
  titleHighlight: "without the friction.",
  description:
    "A growing collection of fast, simple, browser-based utilities for developers and designers. No accounts, no tracking, no fuss.",
} as const;

export type HomeTool = {
  name: string;
  description: string;
  href: string;
  disabled?: boolean;
  icon: HomeToolIconName;
  iconClass: string;
};

export const homeTools: HomeTool[] = [
  {
    name: "Password Generator",
    description:
      "Create strong, secure passwords with custom length and character rules.",
    href: "/password-generator",
    icon: "passwordGenerator",
    iconClass:
      "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/60",
  },
  {
    name: "Slugify",
    description: "Convert any text into a clean, URL-friendly slug instantly.",
    href: "/slugify",
    icon: "slugify",
    iconClass:
      "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/60",
  },
  {
    name: "Image Resizer",
    description:
      "Resize images to any exact dimensions, right in your browser.",
    href: "/image-resizer",
    icon: "imageResizer",
    iconClass:
      "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60",
  },
  {
    name: "Image Compressor",
    description:
      "Compress images to reduce file size without sacrificing quality.",
    href: "/",
    disabled: true,
    icon: "imageCompressor",
    iconClass:
      "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/60",
  },
];
