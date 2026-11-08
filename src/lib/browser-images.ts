export interface LocalImage {
  file: File;
  url: string;
  width: number;
  height: number;
}

export type ImageFormat = "image/jpeg" | "image/webp" | "image/png";

export const IMAGE_ACCEPT = "image/jpeg,image/png,image/webp";

export function loadImage(url: string): Promise<HTMLImageElement> {
  return new Promise((resolve, reject) => {
    const image = new Image();
    image.onload = () => resolve(image);
    image.onerror = () => reject(new Error("This image could not be read. Try a PNG, JPEG, or WebP file."));
    image.src = url;
  });
}

export async function readLocalImage(file: File): Promise<LocalImage> {
  if (!["image/jpeg", "image/png", "image/webp"].includes(file.type)) {
    throw new Error("Please choose a PNG, JPEG, or WebP image.");
  }
  if (file.size > 30 * 1024 * 1024) throw new Error("Please use images smaller than 30 MB each.");
  const url = URL.createObjectURL(file);
  try {
    const image = await loadImage(url);
    const width = image.naturalWidth;
    const height = image.naturalHeight;
    if (!width || !height || width * height > 40_000_000 || Math.max(width, height) > 16384) {
      throw new Error("This image is too large. Use up to 40 megapixels and 16,384 pixels per side.");
    }
    return { file, url, width, height };
  } catch (error) {
    URL.revokeObjectURL(url);
    throw error;
  }
}

export function createImageCanvas(image: HTMLImageElement, width: number, height: number, whiteBackground = false) {
  const canvas = document.createElement("canvas");
  canvas.width = width;
  canvas.height = height;
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Your browser could not create an image canvas.");
  if (whiteBackground) {
    context.fillStyle = "#ffffff";
    context.fillRect(0, 0, width, height);
  }
  context.drawImage(image, 0, 0, width, height);
  return canvas;
}

export function encodeCanvas(canvas: HTMLCanvasElement, format: ImageFormat, quality: number): Promise<Blob> {
  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) reject(new Error("Image export failed. Try a smaller image."));
      else if (blob.type !== format) reject(new Error("Your browser cannot export this format. Choose PNG or JPEG instead."));
      else resolve(blob);
    }, format, quality);
  });
}

export function downloadBlob(blob: Blob, name: string) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = name;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}

export function formatBytes(bytes: number) {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}
