export const documentThemes = {
  modern: { name: "Modern", description: "Clean type, blue accents", font: "Helvetica", accent: "#2563eb", ink: "#1e293b", paper: "#ffffff", soft: "#eff6ff", border: "#cbd5e1" },
  editorial: { name: "Editorial", description: "Serif type, warm paper", font: "Times-Roman", accent: "#9a3412", ink: "#292524", paper: "#fffcf5", soft: "#f5ede1", border: "#d6c9b6" },
  minimal: { name: "Minimal", description: "Simple, monochrome styling", font: "Helvetica", accent: "#18181b", ink: "#27272a", paper: "#ffffff", soft: "#f4f4f5", border: "#d4d4d8" },
} as const;

export type DocumentTheme = keyof typeof documentThemes;
export interface MarkdownPdfOptions {
  theme: DocumentTheme;
  pageSize: "A4" | "LETTER";
  fontSize: number;
}

export const MAX_MARKDOWN_LENGTH = 100_000;

export function pdfFilename(name: string) {
  return `${name.replace(/\.(?:pdf|md|markdown|txt)$/i, "").replace(/[<>:"/\\|?*\u0000-\u001f]/g, "").trim().slice(0, 100) || "document"}.pdf`;
}

export function safeLink(href: string) {
  // Relative links have no useful destination inside a standalone document.
  const value = href.trim();
  return /^(https?:\/\/|mailto:)/i.test(value) ? value : undefined;
}

export const sampleMarkdown = `# A little more than plain text

Turn your notes into a document worth sharing. Pick a theme, make it yours, and download a beautifully formatted PDF.

## Built for your ideas

Write with **bold emphasis**, *a softer touch*, or inline \`code\`. Add a [helpful link](https://www.markdownguide.org) when readers need more detail.

> Good design makes your words easier to read.

### A simple workflow

1. Write or upload your Markdown.
2. Choose a document theme and page size.
3. Preview your PDF, then download it.

## The details matter

| Feature | Ready to use |
| :--- | :--- |
| Headings & lists | Clear structure |
| Tables & quotes | A place for details |
| Code blocks | Room for examples |

\`\`\`javascript
const document = {
  format: "PDF",
  style: "Your choice",
};
\`\`\`

---

- [x] Keep your content on your device
- [x] Make something worth sharing
`;
