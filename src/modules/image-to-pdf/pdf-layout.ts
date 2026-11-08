export type PdfPageSize = "a4" | "letter" | "fit";
export type PdfOrientation = "portrait" | "landscape";

export function calculatePdfLayout(imageWidth: number, imageHeight: number, size: PdfPageSize, orientation: PdfOrientation, margin: number) {
  if (!Number.isFinite(imageWidth) || !Number.isFinite(imageHeight) || imageWidth <= 0 || imageHeight <= 0 || !Number.isFinite(margin) || margin < 0) {
    throw new Error("Invalid image dimensions or page margin.");
  }
  // Image pixels use the standard 96 dpi conversion to PDF points (72 dpi).
  let pageWidth: number;
  let pageHeight: number;
  if (size === "fit") {
    pageWidth = imageWidth * 0.75 + margin * 2;
    pageHeight = imageHeight * 0.75 + margin * 2;
  } else {
    [pageWidth, pageHeight] = size === "letter" ? [612, 792] : [595.28, 841.89];
    if (orientation === "landscape") [pageWidth, pageHeight] = [pageHeight, pageWidth];
  }
  const availableWidth = pageWidth - margin * 2;
  const availableHeight = pageHeight - margin * 2;
  if (availableWidth <= 0 || availableHeight <= 0) throw new Error("Margins leave no space for the image.");
  const scale = Math.min(availableWidth / imageWidth, availableHeight / imageHeight);
  const width = imageWidth * scale;
  const height = imageHeight * scale;
  return { pageWidth, pageHeight, x: (pageWidth - width) / 2, y: (pageHeight - height) / 2, width, height };
}
