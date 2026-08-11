export type HomeToolIconName =
  | "passwordGenerator"
  | "slugify"
  | "imageResizer"
  | "imageCompressor"
  | "csvJsonConverter"
  | "colorConverter"
  | "placeholderThumbnailGenerator"
  | "qrCodeGenerator"
  | "imageToPdf"
  | "pdfToImage"
  | "videoToAudioConverter"
  | "siteChecker"
  | "urlEncoderDecoder"
  | "onlineColorPicker"
  | "imageToBase64Converter"
  | "wordCounter"
  | "colorPicker"
  | "validators"
  | "formatters";

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
  {
    name: "CSV to JSON and JSON to CSV",
    description: "Convert tabular data between CSV and JSON formats.",
    href: "/",
    disabled: true,
    icon: "csvJsonConverter",
    iconClass: "text-sky-600 bg-sky-50 dark:text-sky-400 dark:bg-sky-950/60",
  },
  {
    name: "Color Converter",
    description: "Convert colors between common color formats instantly.",
    href: "/",
    disabled: true,
    icon: "colorConverter",
    iconClass:
      "text-fuchsia-600 bg-fuchsia-50 dark:text-fuchsia-400 dark:bg-fuchsia-950/60",
  },
  {
    name: "Placeholder Thumbnail Generator",
    description: "Generate placeholder thumbnails for mockups and layouts.",
    href: "/",
    disabled: true,
    icon: "placeholderThumbnailGenerator",
    iconClass:
      "text-indigo-600 bg-indigo-50 dark:text-indigo-400 dark:bg-indigo-950/60",
  },
  {
    name: "QR Code Generator",
    description: "Generate QR codes from text, URLs, and contact details.",
    href: "/",
    disabled: true,
    icon: "qrCodeGenerator",
    iconClass:
      "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-900/60",
  },
  {
    name: "Image to PDF",
    description: "Convert images into a PDF document in your browser.",
    href: "/",
    disabled: true,
    icon: "imageToPdf",
    iconClass:
      "text-rose-600 bg-rose-50 dark:text-rose-400 dark:bg-rose-950/60",
  },
  {
    name: "PDF to Image",
    description: "Extract PDF pages as images for quick reuse.",
    href: "/",
    disabled: true,
    icon: "pdfToImage",
    iconClass:
      "text-cyan-600 bg-cyan-50 dark:text-cyan-400 dark:bg-cyan-950/60",
  },
  {
    name: "Video to Audio Converter",
    description: "Extract audio tracks from video files.",
    href: "/",
    disabled: true,
    icon: "videoToAudioConverter",
    iconClass:
      "text-amber-600 bg-amber-50 dark:text-amber-400 dark:bg-amber-950/60",
  },
  {
    name: "Sitemap, robots.txt, RSS, OG tags, SEO tags Checker",
    description: "Inspect common SEO and discovery files and tags quickly.",
    href: "/",
    disabled: true,
    icon: "siteChecker",
    iconClass:
      "text-teal-600 bg-teal-50 dark:text-teal-400 dark:bg-teal-950/60",
  },
  {
    name: "URL Encoder/Decoder",
    description: "Encode and decode URLs for safe sharing and transport.",
    href: "/",
    disabled: true,
    icon: "urlEncoderDecoder",
    iconClass:
      "text-violet-600 bg-violet-50 dark:text-violet-400 dark:bg-violet-950/60",
  },
  {
    name: "Online Color Picker",
    description: "Pick colors from the screen and copy their values.",
    href: "/",
    disabled: true,
    icon: "onlineColorPicker",
    iconClass:
      "text-emerald-600 bg-emerald-50 dark:text-emerald-400 dark:bg-emerald-950/60",
  },
  {
    name: "Image to Base64 Converter",
    description: "Convert image files into Base64 strings.",
    href: "/",
    disabled: true,
    icon: "imageToBase64Converter",
    iconClass:
      "text-orange-600 bg-orange-50 dark:text-orange-400 dark:bg-orange-950/60",
  },
  {
    name: "Word Counter",
    description: "Count words, characters, and sentences in text.",
    href: "/",
    disabled: true,
    icon: "wordCounter",
    iconClass:
      "text-lime-600 bg-lime-50 dark:text-lime-400 dark:bg-lime-950/60",
  },
  {
    name: "Color Picker",
    description: "Sample and manage colors with a simple picker tool.",
    href: "/",
    disabled: true,
    icon: "colorPicker",
    iconClass:
      "text-pink-600 bg-pink-50 dark:text-pink-400 dark:bg-pink-950/60",
  },
  {
    name: "Validators",
    description:
      "Validate JSON, YAML, Markdown, TOML, JS, TS, Go, HTML, and CSS.",
    href: "/",
    disabled: true,
    icon: "validators",
    iconClass:
      "text-slate-700 bg-slate-100 dark:text-slate-300 dark:bg-slate-900/60",
  },
  {
    name: "Formatters",
    description:
      "Format JSON, YAML, Markdown, TOML, JS, TS, Go, HTML, and CSS.",
    href: "/",
    disabled: true,
    icon: "formatters",
    iconClass:
      "text-blue-600 bg-blue-50 dark:text-blue-400 dark:bg-blue-950/60",
  },
];
