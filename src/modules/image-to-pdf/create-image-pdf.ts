import { createImageCanvas, encodeCanvas, loadImage, type LocalImage } from "@/lib/browser-images";
import { calculatePdfLayout, type PdfOrientation, type PdfPageSize } from "./pdf-layout";

export interface PdfOptions {
  pageSize: PdfPageSize;
  orientation: PdfOrientation;
  margin: number;
  quality: number;
}

export async function createImagePdf(images: LocalImage[], options: PdfOptions, onProgress: (page: number) => void, signal?: AbortSignal): Promise<Blob> {
  if (!images.length) throw new Error("Add at least one image first.");
  const { PDFDocument } = await import("pdf-lib");
  const pdf = await PDFDocument.create();
  pdf.setTitle("Images — WebTools");
  pdf.setCreator("WebTools");
  for (let index = 0; index < images.length; index++) {
    signal?.throwIfAborted();
    onProgress(index + 1);
    const image = images[index];
    const source = await loadImage(image.url);
    signal?.throwIfAborted();
    const canvas = createImageCanvas(source, image.width, image.height, true);
    try {
      const blob = await encodeCanvas(canvas, "image/jpeg", options.quality / 100);
      const embedded = await pdf.embedJpg(await blob.arrayBuffer());
      const layout = calculatePdfLayout(image.width, image.height, options.pageSize, options.orientation, options.margin);
      const page = pdf.addPage([layout.pageWidth, layout.pageHeight]);
      page.drawImage(embedded, { x: layout.x, y: layout.y, width: layout.width, height: layout.height });
    } finally {
      canvas.width = 0;
      canvas.height = 0;
    }
  }
  signal?.throwIfAborted();
  const bytes = await pdf.save();
  return new Blob([new Uint8Array(bytes)], { type: "application/pdf" });
}
