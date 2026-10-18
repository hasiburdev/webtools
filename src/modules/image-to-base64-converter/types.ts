export type Base64Mode = "image-to-base64" | "base64-to-image";

export interface ImageMetadata {
  name: string;
  type: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}

export interface EncodedBase64Result {
  dataUri: string;
  rawBase64: string;
  htmlSnippet: string;
  cssSnippet: string;
  metadata: ImageMetadata;
  base64Bytes: number;
}

export interface DecodedImageResult {
  dataUri: string;
  mimeType: string;
  sizeBytes: number;
  width?: number;
  height?: number;
}
