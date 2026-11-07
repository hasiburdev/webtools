import type { EncodedBase64Result, DecodedImageResult, ImageMetadata } from "./types";

/**
 * Format bytes into human readable string
 */
export function formatBytes(bytes: number, decimals = 2): string {
  if (bytes === 0) return "0 Bytes";
  const k = 1024;
  const dm = decimals < 0 ? 0 : decimals;
  const sizes = ["Bytes", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(dm))} ${sizes[i]}`;
}

/**
 * Read image file into Data URI, extract dimensions, and build all snippets
 */
export function processImageFile(file: File): Promise<EncodedBase64Result> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();

    reader.onload = () => {
      const dataUri = reader.result as string;
      const commaIndex = dataUri.indexOf(",");
      const rawBase64 = commaIndex !== -1 ? dataUri.slice(commaIndex + 1) : dataUri;

      // Calculate byte size of base64 text
      const base64Bytes = new Blob([dataUri]).size;

      // Load into HTMLImageElement to get intrinsic dimensions
      const img = new Image();
      img.onload = () => {
        const metadata: ImageMetadata = {
          name: file.name,
          type: file.type || "image/png",
          sizeBytes: file.size,
          width: img.naturalWidth,
          height: img.naturalHeight,
        };

        const htmlSnippet = `<img src="${dataUri}" alt="${file.name}" width="${img.naturalWidth}" height="${img.naturalHeight}" />`;
        const cssSnippet = `background-image: url("${dataUri}");`;

        resolve({
          dataUri,
          rawBase64,
          htmlSnippet,
          cssSnippet,
          metadata,
          base64Bytes,
        });
      };

      img.onerror = () => {
        // Even if img element fails (e.g. some SVGs), resolve with known file info
        const metadata: ImageMetadata = {
          name: file.name,
          type: file.type || "image/png",
          sizeBytes: file.size,
        };

        const htmlSnippet = `<img src="${dataUri}" alt="${file.name}" />`;
        const cssSnippet = `background-image: url("${dataUri}");`;

        resolve({
          dataUri,
          rawBase64,
          htmlSnippet,
          cssSnippet,
          metadata,
          base64Bytes,
        });
      };

      img.src = dataUri;
    };

    reader.onerror = (err) => reject(err);
    reader.readAsDataURL(file);
  });
}

/**
 * Detect MIME type from raw base64 or data URI
 */
export function detectMimeType(input: string): string {
  const trimmed = input.trim();
  const dataUriMatch = trimmed.match(/^data:([a-zA-Z0-9]+\/[a-zA-Z0-9\-.+]+);base64,/i);
  if (dataUriMatch) {
    return dataUriMatch[1];
  }

  // Inspect first few characters of raw base64
  const clean = trimmed.replace(/\s/g, "");
  if (clean.startsWith("/9j/")) return "image/jpeg";
  if (clean.startsWith("iVBORw0KGgo")) return "image/png";
  if (clean.startsWith("R0lGOD")) return "image/gif";
  if (clean.startsWith("UklGR")) return "image/webp";
  if (clean.startsWith("PHN2Zy") || clean.startsWith("PD94bWw")) return "image/svg+xml";
  if (clean.startsWith("AAABAA")) return "image/x-icon";

  return "image/png"; // default fallback
}

/**
 * Parse Base64 input string and prepare Decoded result
 */
export function parseBase64ToImage(input: string): Promise<DecodedImageResult> {
  return new Promise((resolve, reject) => {
    const trimmed = input.trim();
    if (!trimmed) {
      return reject(new Error("Empty Base64 string"));
    }

    const mimeType = detectMimeType(trimmed);
    let fullDataUri = trimmed;

    if (!trimmed.startsWith("data:")) {
      fullDataUri = `data:${mimeType};base64,${trimmed}`;
    }

    // Estimate binary size: (len * 3/4) - padding
    const rawPart = fullDataUri.includes(",") ? fullDataUri.split(",")[1] : fullDataUri;
    const padding = (rawPart.endsWith("==") ? 2 : rawPart.endsWith("=") ? 1 : 0);
    const estimatedSizeBytes = Math.max(0, Math.floor((rawPart.length * 3) / 4) - padding);

    const img = new Image();
    img.onload = () => {
      resolve({
        dataUri: fullDataUri,
        mimeType,
        sizeBytes: estimatedSizeBytes,
        width: img.naturalWidth,
        height: img.naturalHeight,
      });
    };

    img.onerror = () => {
      reject(new Error("Unable to decode Base64 string into a valid image"));
    };

    img.src = fullDataUri;
  });
}

/**
 * Download a data URI as a file
 */
export function downloadDataUri(dataUri: string, filename: string) {
  const link = document.createElement("a");
  link.href = dataUri;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
}
