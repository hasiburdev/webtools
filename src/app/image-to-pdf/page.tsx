import type { Metadata } from "next";
import { ToolPage } from "@/components/tool-page";
import { pageSeo } from "@/content/seo";
import { ImageToPdf } from "@/modules/image-to-pdf";

export const metadata: Metadata = pageSeo.imageToPdf;

export default function ImageToPdfPage() {
  return <ToolPage title="Image to PDF" description="Combine images into a PDF with custom page order, size, orientation, margins, and image quality. Your images stay on your device."><ImageToPdf /></ToolPage>;
}
