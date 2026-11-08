import type { Metadata } from "next";
import { ToolPage } from "@/components/tool-page";
import { pageSeo } from "@/content/seo";
import { ImageCompressor } from "@/modules/image-compressor";

export const metadata: Metadata = pageSeo.imageCompressor;

export default function ImageCompressorPage() {
  return <ToolPage title="Image Compressor" description="Compress and resize PNG, JPEG, and WebP images with live previews and file size comparisons. Everything runs on your device."><ImageCompressor /></ToolPage>;
}
