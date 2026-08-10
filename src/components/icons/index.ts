import type { ComponentType } from "react";

import { ImageCompressorIcon } from "./image-compressor-icon";
import { ImageResizerIcon } from "./image-resizer-icon";
import { PasswordGeneratorIcon } from "./password-generator-icon";
import { SlugifyIcon } from "./slugify-icon";
import type { HomeToolIconName } from "@/content/home";
import type { SvgIconProps } from "./svg-icon-props";

export { ImageCompressorIcon } from "./image-compressor-icon";
export { ImageResizerIcon } from "./image-resizer-icon";
export { PasswordGeneratorIcon } from "./password-generator-icon";
export { SlugifyIcon } from "./slugify-icon";
export type { SvgIconProps } from "./svg-icon-props";

export const homeToolIcons = {
  passwordGenerator: PasswordGeneratorIcon,
  slugify: SlugifyIcon,
  imageResizer: ImageResizerIcon,
  imageCompressor: ImageCompressorIcon,
} satisfies Record<HomeToolIconName, ComponentType<SvgIconProps>>;
