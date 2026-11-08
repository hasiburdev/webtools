import type { Metadata } from "next";
import { ToolPage } from "@/components/tool-page";
import { pageSeo } from "@/content/seo";
import { MarkdownToPdf } from "@/modules/markdown-to-pdf";

export const metadata: Metadata = pageSeo.markdownToPdf;

export default function MarkdownToPdfPage() {
  return <ToolPage title="Markdown to PDF" description="Give your Markdown a little polish. Choose a theme, preview the PDF, and download it. Your document stays on your device."><MarkdownToPdf /></ToolPage>;
}
