import type { Metadata } from "next";

// ---------------------------------------------------------------------------
// Site-wide constants
// ---------------------------------------------------------------------------

export const siteConfig = {
  name: "WebTools by Hasibur Rahman Hasan",
  /** Override with NEXT_PUBLIC_SITE_URL in production */
  url: process.env.NEXT_PUBLIC_SITE_URL ?? "https://webtools.hasiburhasan.com",
  author: {
    name: "Hasibur Rahman Hasan",
    url: "https://hasiburhasan.com",
    twitter: "@hasiburdev",
  },
} as const;

// ---------------------------------------------------------------------------
// Root layout metadata — used by layout.tsx
// ---------------------------------------------------------------------------

export const defaultMetadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: {
    default: `${siteConfig.name} — Free Developer Utilities`,
    template: `%s — ${siteConfig.name}`,
  },
  description:
    "A growing collection of free, fast, browser-based tools for developers and designers. No accounts, no tracking.",
  keywords: [
    "developer tools",
    "web utilities",
    "free online tools",
    "browser-based tools",
    "password generator",
    "url slug generator",
    "image resizer",
    "webtools",
  ],
  authors: [{ name: siteConfig.author.name, url: siteConfig.author.url }],
  creator: siteConfig.author.name,
  openGraph: {
    type: "website",
    siteName: siteConfig.name,
    locale: "en_US",
    url: siteConfig.url,
    title: `${siteConfig.name} — Free Developer Utilities`,
    description:
      "A growing collection of free, fast, browser-based tools for developers and designers. No accounts, no tracking.",
  },
  twitter: {
    card: "summary",
    title: `${siteConfig.name} — Free Developer Utilities`,
    description:
      "A growing collection of free, fast, browser-based tools for developers and designers. No accounts, no tracking.",
    creator: siteConfig.author.twitter,
  },
  robots: {
    index: true,
    follow: true,
  },
  icons: {
    icon: [
      { url: "/favicon.ico" },
      { url: "/favicon-16x16.png", sizes: "16x16", type: "image/png" },
      { url: "/favicon-32x32.png", sizes: "32x32", type: "image/png" },
    ],
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
    other: [
      { rel: "icon", url: "/android-chrome-192x192.png", sizes: "192x192", type: "image/png" },
      { rel: "icon", url: "/android-chrome-512x512.png", sizes: "512x512", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
};

// ---------------------------------------------------------------------------
// Per-page SEO — import the relevant entry in each page file
// ---------------------------------------------------------------------------

export const pageSeo = {
  // Home — /
  home: {
    title: `${siteConfig.name} — Free Developer Utilities`,
    description:
      "A growing collection of free, fast, browser-based utilities for developers and designers. No accounts, no tracking, no fuss.",
    keywords: [
      "developer tools",
      "web utilities",
      "free online tools",
      "browser-based tools",
      "password generator",
      "url slug generator",
      "image resizer",
    ],
    alternates: { canonical: siteConfig.url },
    openGraph: {
      url: siteConfig.url,
      title: `${siteConfig.name} — Free Developer Utilities`,
      description:
        "A growing collection of free, fast, browser-based utilities for developers and designers. No accounts, no tracking, no fuss.",
    },
    twitter: {
      title: `${siteConfig.name} — Free Developer Utilities`,
      description:
        "A growing collection of free, fast, browser-based utilities for developers and designers. No accounts, no tracking, no fuss.",
    },
  },

  // About — /about
  about: {
    title: "About",
    description:
      "Learn about WebTools — a growing collection of free, browser-based utilities built by Hasibur Rahman Hasan for everyday developer tasks.",
    keywords: [
      "about webtools",
      "developer utilities",
      "open source tools",
      "hasibur rahman hasan",
    ],
    alternates: { canonical: `${siteConfig.url}/about` },
    openGraph: {
      url: `${siteConfig.url}/about`,
      title: `About — ${siteConfig.name}`,
      description:
        "Learn about WebTools — a growing collection of free, browser-based utilities built by Hasibur Rahman Hasan.",
    },
    twitter: {
      title: `About — ${siteConfig.name}`,
      description:
        "Learn about WebTools — a growing collection of free, browser-based utilities built by Hasibur Rahman Hasan.",
    },
  },

  // Password Generator — /password-generator
  passwordGenerator: {
    title: "Password Generator",
    description:
      "Generate strong, secure passwords instantly. Customize length, uppercase, lowercase, numbers, and symbols. Free, browser-based — nothing leaves your device.",
    keywords: [
      "password generator",
      "secure password",
      "random password generator",
      "strong password",
      "online password tool",
      "free password generator",
    ],
    alternates: { canonical: `${siteConfig.url}/password-generator` },
    openGraph: {
      url: `${siteConfig.url}/password-generator`,
      title: `Password Generator — ${siteConfig.name}`,
      description:
        "Generate strong, secure passwords instantly. Customize length, character types, and more. Free, browser-based, no signup.",
    },
    twitter: {
      title: `Password Generator — ${siteConfig.name}`,
      description:
        "Generate strong, secure passwords instantly. Customize length, character types, and more. Free, browser-based, no signup.",
    },
  },

  // Slugify — /slugify
  slugify: {
    title: "Slugify",
    description:
      "Convert any text into a clean, URL-friendly slug. Handles accented characters, symbols, and custom separators. Free and instant — no server needed.",
    keywords: [
      "slugify",
      "url slug generator",
      "text to slug",
      "slug converter",
      "seo slug",
      "url-friendly text",
      "online slug tool",
    ],
    alternates: { canonical: `${siteConfig.url}/slugify` },
    openGraph: {
      url: `${siteConfig.url}/slugify`,
      title: `Slugify — ${siteConfig.name}`,
      description:
        "Convert any text into a clean, URL-friendly slug. Handles accents, symbols, and custom separators. Free, instant, browser-based.",
    },
    twitter: {
      title: `Slugify — ${siteConfig.name}`,
      description:
        "Convert any text into a clean, URL-friendly slug. Handles accents, symbols, and custom separators. Free, instant, browser-based.",
    },
  },

  // Image Resizer — /image-resizer
  imageResizer: {
    title: "Image Resizer",
    description:
      "Resize and crop images to exact dimensions right in your browser. Drag-and-drop upload, interactive crop selection, and instant download. No server, no signup.",
    keywords: [
      "image resizer",
      "resize image online",
      "crop image",
      "online image editor",
      "browser image tool",
      "free image resizer",
      "image dimension converter",
    ],
    alternates: { canonical: `${siteConfig.url}/image-resizer` },
    openGraph: {
      url: `${siteConfig.url}/image-resizer`,
      title: `Image Resizer — ${siteConfig.name}`,
      description:
        "Resize and crop images to any dimension in your browser. Drag-and-drop, interactive crop, instant download. No server, no signup.",
    },
    twitter: {
      title: `Image Resizer — ${siteConfig.name}`,
      description:
        "Resize and crop images to any dimension in your browser. Drag-and-drop, interactive crop, instant download. No server, no signup.",
    },
  },

  // Formatters — /formatters
  formatters: {
    title: "Code & Data Formatters",
    description:
      "Format, validate, beautify, and minify JSON, YAML, TOML, SQL, XML, HTML, CSS, JavaScript, TypeScript, and Markdown instantly in your browser. Clean indentation, key sorting, and syntax error detection. 100% client-side, zero server uploads.",
    keywords: [
      "json formatter",
      "yaml formatter",
      "sql formatter",
      "xml formatter",
      "toml formatter",
      "html formatter",
      "css formatter",
      "javascript formatter",
      "typescript formatter",
      "markdown formatter",
      "format json online",
      "code beautifier",
      "code minifier",
      "online code formatters",
      "browser developer tools",
    ],
    alternates: { canonical: `${siteConfig.url}/formatters` },
    openGraph: {
      url: `${siteConfig.url}/formatters`,
      title: `Code & Data Formatters — ${siteConfig.name}`,
      description:
        "Format, validate, beautify, and minify JSON, YAML, TOML, SQL, XML, HTML, CSS, JS, TS, and Markdown in your browser. 100% private, client-side.",
    },
    twitter: {
      title: `Code & Data Formatters — ${siteConfig.name}`,
      description:
        "Format, validate, beautify, and minify JSON, YAML, TOML, SQL, XML, HTML, CSS, JS, TS, and Markdown in your browser. 100% private, client-side.",
    },
  },

  // Word Counter — /word-counter
  wordCounter: {
    title: "Word Counter & Text Analyzer",
    description:
      "Count words, characters, sentences, paragraphs, and reading time in real-time. Analyze keyword density and convert text cases instantly in your browser. Free, 100% client-side.",
    keywords: [
      "word counter",
      "character counter",
      "reading time calculator",
      "text analyzer",
      "keyword density checker",
      "sentence counter",
      "online word count",
      "free text tools",
    ],
    alternates: { canonical: `${siteConfig.url}/word-counter` },
    openGraph: {
      url: `${siteConfig.url}/word-counter`,
      title: `Word Counter & Text Analyzer — ${siteConfig.name}`,
      description:
        "Count words, characters, sentences, paragraphs, reading time, and keyword density. 100% private and browser-based.",
    },
    twitter: {
      title: `Word Counter & Text Analyzer — ${siteConfig.name}`,
      description:
        "Count words, characters, sentences, paragraphs, reading time, and keyword density. 100% private and browser-based.",
    },
  },

  // Color Picker — /color-picker
  colorPicker: {
    title: "Color Picker & Palette Generator",
    description:
      "Pick, convert, and inspect colors with real-time HEX, RGB, HSL, HSV, and CMYK outputs. Generate color harmonies, tints, shades, and check WCAG contrast compliance in your browser.",
    keywords: [
      "color picker",
      "hex color picker",
      "rgb to hex",
      "color harmony generator",
      "wcag contrast checker",
      "tints and shades",
      "cmyk converter",
      "online color tool",
    ],
    alternates: { canonical: `${siteConfig.url}/color-picker` },
    openGraph: {
      url: `${siteConfig.url}/color-picker`,
      title: `Color Picker & Palette Generator — ${siteConfig.name}`,
      description:
        "Interactive color picker with HEX, RGB, HSL, CMYK conversions, color harmonies, shades, tints, and WCAG contrast checking.",
    },
    twitter: {
      title: `Color Picker & Palette Generator — ${siteConfig.name}`,
      description:
        "Interactive color picker with HEX, RGB, HSL, CMYK conversions, color harmonies, shades, tints, and WCAG contrast checking.",
    },
  },

  // URL Encoder/Decoder — /url-encoder-decoder
  urlEncoderDecoder: {
    title: "URL Encoder & Decoder",
    description:
      "Encode and decode URLs, URI components, and query parameters online. Parse and edit query parameters interactively in real-time. Fast, secure, 100% browser-based.",
    keywords: [
      "url encoder",
      "url decoder",
      "uri encoder",
      "encodeuricomponent",
      "decodeuricomponent",
      "query parameter parser",
      "url escape",
      "online url tools",
      "base64 url encoder",
    ],
    alternates: { canonical: `${siteConfig.url}/url-encoder-decoder` },
    openGraph: {
      url: `${siteConfig.url}/url-encoder-decoder`,
      title: `URL Encoder & Decoder — ${siteConfig.name}`,
      description:
        "Encode and decode URLs, URI components, and query parameters online with live parameter breakdown. 100% private.",
    },
    twitter: {
      title: `URL Encoder & Decoder — ${siteConfig.name}`,
      description:
        "Encode and decode URLs, URI components, and query parameters online with live parameter breakdown. 100% private.",
    },
  },

  // Color Converter — /color-converter
  colorConverter: {
    title: "Color Converter",
    description:
      "Convert colors seamlessly between HEX, RGB, HSL, HSV, CMYK, and CSS named colors. Real-time WCAG 2.1 contrast checking and CSS code generation in your browser. Free and private.",
    keywords: [
      "color converter",
      "hex to rgb",
      "rgb to hex",
      "hsl to rgb",
      "cmyk to rgb",
      "css color names",
      "color code converter",
      "wcag contrast checker",
      "online color tool",
    ],
    alternates: { canonical: `${siteConfig.url}/color-converter` },
    openGraph: {
      url: `${siteConfig.url}/color-converter`,
      title: `Color Converter — ${siteConfig.name}`,
      description:
        "Convert colors between HEX, RGB, HSL, HSV, CMYK, and CSS named colors with live WCAG contrast checking.",
    },
    twitter: {
      title: `Color Converter — ${siteConfig.name}`,
      description:
        "Convert colors between HEX, RGB, HSL, HSV, CMYK, and CSS named colors with live WCAG contrast checking.",
    },
  },

  // Image to Base64 Converter — /image-to-base64-converter
  imageToBase64Converter: {
    title: "Image to Base64 Converter",
    description:
      "Convert images to Base64 data URIs, HTML img tags, and CSS background snippets. Decode Base64 strings back to images with instant preview and download. 100% browser-based.",
    keywords: [
      "image to base64",
      "base64 to image",
      "data uri generator",
      "base64 image decoder",
      "inline image encoder",
      "convert png to base64",
      "convert svg to base64",
      "base64 css background",
      "online image tools",
    ],
    alternates: { canonical: `${siteConfig.url}/image-to-base64-converter` },
    openGraph: {
      url: `${siteConfig.url}/image-to-base64-converter`,
      title: `Image to Base64 Converter — ${siteConfig.name}`,
      description:
        "Convert images to Base64 data URIs and decode Base64 strings back into downloadable images. Fast, secure, 100% private.",
    },
    twitter: {
      title: `Image to Base64 Converter — ${siteConfig.name}`,
      description:
        "Convert images to Base64 data URIs and decode Base64 strings back into downloadable images. Fast, secure, 100% private.",
    },
  },

  // Placeholder Thumbnail Generator — /placeholder-thumbnail-generator
  placeholderThumbnailGenerator: {
    title: "Placeholder Thumbnail Generator",
    description:
      "Generate custom placeholder images and mock thumbnails in any dimension. Customize gradients, patterns, text, and export as PNG, WebP, or SVG. Free, fast, and 100% browser-based.",
    keywords: [
      "placeholder image generator",
      "thumbnail generator",
      "mockup placeholder",
      "dummy image generator",
      "custom dimensions placeholder",
      "youtube thumbnail placeholder",
      "opengraph image generator",
      "svg placeholder generator",
      "online image tools",
    ],
    alternates: {
      canonical: `${siteConfig.url}/placeholder-thumbnail-generator`,
    },
    openGraph: {
      url: `${siteConfig.url}/placeholder-thumbnail-generator`,
      title: `Placeholder Thumbnail Generator — ${siteConfig.name}`,
      description:
        "Generate custom placeholder images and mock thumbnails in any dimension. Download as PNG, WebP, or SVG.",
    },
    twitter: {
      title: `Placeholder Thumbnail Generator — ${siteConfig.name}`,
      description:
        "Generate custom placeholder images and mock thumbnails in any dimension. Download as PNG, WebP, or SVG.",
    },
  },

  // QR Code Generator — /qr-code-generator
  qrCodeGenerator: {
    title: "QR Code Generator",
    description:
      "Generate custom QR codes for URLs, WiFi networks, vCards, emails, SMS, and plain text. Add custom colors and center logo overlays. Free, 100% browser-based with PNG, WebP, and SVG export.",
    keywords: [
      "qr code generator",
      "free qr code maker",
      "wifi qr code",
      "vcard qr code",
      "qr code with logo",
      "custom qr code colors",
      "svg qr code generator",
      "vector qr code",
      "online qr tools",
    ],
    alternates: { canonical: `${siteConfig.url}/qr-code-generator` },
    openGraph: {
      url: `${siteConfig.url}/qr-code-generator`,
      title: `QR Code Generator — ${siteConfig.name}`,
      description:
        "Generate custom QR codes for URLs, WiFi, contacts, and text with custom colors and logo support.",
    },
    twitter: {
      title: `QR Code Generator — ${siteConfig.name}`,
      description:
        "Generate custom QR codes for URLs, WiFi, contacts, and text with custom colors and logo support.",
    },
  },

  // CSV to JSON & JSON to CSV — /csv-json-converter
  csvJsonConverter: {
    title: "CSV to JSON & JSON to CSV Converter",
    description:
      "Convert tabular data between CSV and JSON formats instantly. Features auto delimiter detection, live tabular data preview, dynamic typing, and object flattening. 100% browser-based.",
    keywords: [
      "csv to json",
      "json to csv",
      "csv converter",
      "json converter",
      "csv parser online",
      "tabular data converter",
      "convert excel csv to json",
      "developer tools",
    ],
    alternates: { canonical: `${siteConfig.url}/csv-json-converter` },
    openGraph: {
      url: `${siteConfig.url}/csv-json-converter`,
      title: `CSV to JSON & JSON to CSV Converter — ${siteConfig.name}`,
      description:
        "Convert tabular data between CSV and JSON formats with live table preview and customizable delimiters.",
    },
    twitter: {
      title: `CSV to JSON & JSON to CSV Converter — ${siteConfig.name}`,
      description:
        "Convert tabular data between CSV and JSON formats with live table preview and customizable delimiters.",
    },
  },
} satisfies Record<string, Metadata>;


