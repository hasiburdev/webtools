import type { ComponentType } from "react";

import { ImageCompressorIcon } from "./image-compressor-icon";
import { ImageResizerIcon } from "./image-resizer-icon";
import { PasswordGeneratorIcon } from "./password-generator-icon";
import { SlugifyIcon } from "./slugify-icon";
import { CsvJsonConverterIcon } from "./csv-json-converter-icon";
import { ColorConverterIcon } from "./color-converter-icon";
import { PlaceholderThumbnailGeneratorIcon } from "./placeholder-thumbnail-generator-icon";
import { QrCodeGeneratorIcon } from "./qr-code-generator-icon";
import { ImageToPdfIcon } from "./image-to-pdf-icon";
import { PdfToImageIcon } from "./pdf-to-image-icon";
import { VideoToAudioConverterIcon } from "./video-to-audio-converter-icon";
import { SiteCheckerIcon } from "./site-checker-icon";
import { UrlEncoderDecoderIcon } from "./url-encoder-decoder-icon";
import { OnlineColorPickerIcon } from "./online-color-picker-icon";
import { ImageToBase64ConverterIcon } from "./image-to-base64-converter-icon";
import { WordCounterIcon } from "./word-counter-icon";
import { ColorPickerIcon } from "./color-picker-icon";
import { ValidatorsIcon } from "./validators-icon";
import { FormattersIcon } from "./formatters-icon";
import type { HomeToolIconName } from "@/content/home";
import type { SvgIconProps } from "./svg-icon-props";

export { ImageCompressorIcon } from "./image-compressor-icon";
export { ImageResizerIcon } from "./image-resizer-icon";
export { PasswordGeneratorIcon } from "./password-generator-icon";
export { SlugifyIcon } from "./slugify-icon";
export { CsvJsonConverterIcon } from "./csv-json-converter-icon";
export { ColorConverterIcon } from "./color-converter-icon";
export { PlaceholderThumbnailGeneratorIcon } from "./placeholder-thumbnail-generator-icon";
export { QrCodeGeneratorIcon } from "./qr-code-generator-icon";
export { ImageToPdfIcon } from "./image-to-pdf-icon";
export { PdfToImageIcon } from "./pdf-to-image-icon";
export { VideoToAudioConverterIcon } from "./video-to-audio-converter-icon";
export { SiteCheckerIcon } from "./site-checker-icon";
export { UrlEncoderDecoderIcon } from "./url-encoder-decoder-icon";
export { OnlineColorPickerIcon } from "./online-color-picker-icon";
export { ImageToBase64ConverterIcon } from "./image-to-base64-converter-icon";
export { WordCounterIcon } from "./word-counter-icon";
export { ColorPickerIcon } from "./color-picker-icon";
export { ValidatorsIcon } from "./validators-icon";
export { FormattersIcon } from "./formatters-icon";
export type { SvgIconProps } from "./svg-icon-props";

export const homeToolIcons = {
  passwordGenerator: PasswordGeneratorIcon,
  slugify: SlugifyIcon,
  imageResizer: ImageResizerIcon,
  imageCompressor: ImageCompressorIcon,
  csvJsonConverter: CsvJsonConverterIcon,
  colorConverter: ColorConverterIcon,
  placeholderThumbnailGenerator: PlaceholderThumbnailGeneratorIcon,
  qrCodeGenerator: QrCodeGeneratorIcon,
  imageToPdf: ImageToPdfIcon,
  pdfToImage: PdfToImageIcon,
  videoToAudioConverter: VideoToAudioConverterIcon,
  siteChecker: SiteCheckerIcon,
  urlEncoderDecoder: UrlEncoderDecoderIcon,
  onlineColorPicker: OnlineColorPickerIcon,
  imageToBase64Converter: ImageToBase64ConverterIcon,
  wordCounter: WordCounterIcon,
  colorPicker: ColorPickerIcon,
  validators: ValidatorsIcon,
  formatters: FormattersIcon,
} satisfies Record<HomeToolIconName, ComponentType<SvgIconProps>>;
