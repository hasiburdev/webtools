import type { RGBA, HSLA, HSVA, CMYK } from "../color-picker/types";
import {
  hexToRgba,
  rgbaToHex,
  rgbaToHsla,
  hslaToRgba,
  rgbaToHsva,
  hsvaToRgba,
  rgbaToCmyk,
  clamp,
} from "../color-picker/color-math";
import { CSS_NAMED_COLORS, HEX_TO_NAME } from "./named-colors";
import type { ColorConversionResult } from "./types";

/**
 * Parses user input in any standard color format and converts to RGBA
 */
export function parseAnyColor(input: string): RGBA | null {
  const trimmed = input.trim().toLowerCase();
  if (!trimmed) return null;

  // 1. Check CSS named colors
  if (CSS_NAMED_COLORS[trimmed]) {
    return hexToRgba(CSS_NAMED_COLORS[trimmed]);
  }

  // 2. Check HEX (#fff, #ffffff, #ffffff80, or without #)
  if (
    trimmed.startsWith("#") ||
    /^[0-9a-f]{3}$/i.test(trimmed) ||
    /^[0-9a-f]{6}$/i.test(trimmed) ||
    /^[0-9a-f]{8}$/i.test(trimmed)
  ) {
    const withHash = trimmed.startsWith("#") ? trimmed : `#${trimmed}`;
    const parsed = hexToRgba(withHash);
    if (parsed) return parsed;
  }

  // 3. Check RGB / RGBA: rgb(255, 255, 255) or rgba(255, 255, 255, 0.5) or 255, 255, 255
  const rgbMatch = trimmed.match(
    /^rgba?\s*\(\s*(\d{1,3})\s*,\s*(\d{1,3})\s*,\s*(\d{1,3})(?:\s*,\s*([0-1]?(?:\.\d+)?|\d{1,3}%))?\s*\)$/
  );
  if (rgbMatch) {
    const r = clamp(parseInt(rgbMatch[1], 10), 0, 255);
    const g = clamp(parseInt(rgbMatch[2], 10), 0, 255);
    const b = clamp(parseInt(rgbMatch[3], 10), 0, 255);
    let a = 1;
    if (rgbMatch[4] !== undefined) {
      if (rgbMatch[4].endsWith("%")) {
        a = clamp(parseFloat(rgbMatch[4]) / 100, 0, 1);
      } else {
        a = clamp(parseFloat(rgbMatch[4]), 0, 1);
      }
    }
    return { r, g, b, a };
  }

  // 4. Check HSL / HSLA: hsl(120, 100%, 50%) or hsla(120, 100%, 50%, 0.8)
  const hslMatch = trimmed.match(
    /^hsla?\s*\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)(?:\s*,\s*([0-1]?(?:\.\d+)?|\d{1,3}%))?\s*\)$/
  );
  if (hslMatch) {
    const h = (parseFloat(hslMatch[1]) % 360 + 360) % 360;
    const s = clamp(parseFloat(hslMatch[2]), 0, 100);
    const l = clamp(parseFloat(hslMatch[3]), 0, 100);
    let a = 1;
    if (hslMatch[4] !== undefined) {
      if (hslMatch[4].endsWith("%")) {
        a = clamp(parseFloat(hslMatch[4]) / 100, 0, 1);
      } else {
        a = clamp(parseFloat(hslMatch[4]), 0, 1);
      }
    }
    return hslaToRgba({ h, s, l, a });
  }

  // 5. Check HSV / HSB: hsv(120, 100%, 50%)
  const hsvMatch = trimmed.match(
    /^hsv\s*\(\s*(\d{1,3}(?:\.\d+)?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*\)$/
  );
  if (hsvMatch) {
    const h = (parseFloat(hsvMatch[1]) % 360 + 360) % 360;
    const s = clamp(parseFloat(hsvMatch[2]), 0, 100);
    const v = clamp(parseFloat(hsvMatch[3]), 0, 100);
    return hsvaToRgba({ h, s, v, a: 1 });
  }

  // 6. Check CMYK: cmyk(0%, 100%, 100%, 0%)
  const cmykMatch = trimmed.match(
    /^cmyk\s*\(\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*,\s*(\d{1,3}(?:\.\d+)?%?)\s*\)$/
  );
  if (cmykMatch) {
    const c = clamp(parseFloat(cmykMatch[1]), 0, 100) / 100;
    const m = clamp(parseFloat(cmykMatch[2]), 0, 100) / 100;
    const y = clamp(parseFloat(cmykMatch[3]), 0, 100) / 100;
    const k = clamp(parseFloat(cmykMatch[4]), 0, 100) / 100;

    const r = Math.round(255 * (1 - c) * (1 - k));
    const g = Math.round(255 * (1 - m) * (1 - k));
    const b = Math.round(255 * (1 - y) * (1 - k));
    return { r, g, b, a: 1 };
  }

  return null;
}

/**
 * Builds full conversion result from RGBA
 */
export function convertColor(rgba: RGBA): ColorConversionResult {
  const hsla = rgbaToHsla(rgba);
  const hsva = rgbaToHsva(rgba);
  const cmyk = rgbaToCmyk(rgba);

  const hex = rgbaToHex(rgba, false);
  const hexa = rgbaToHex(rgba, true);
  const rgb = `rgb(${rgba.r}, ${rgba.g}, ${rgba.b})`;
  const rgbaStr = `rgba(${rgba.r}, ${rgba.g}, ${rgba.b}, ${rgba.a})`;
  const hsl = `hsl(${hsla.h}, ${hsla.s}%, ${hsla.l}%)`;
  const hslaStr = `hsla(${hsla.h}, ${hsla.s}%, ${hsla.l}%, ${hsla.a})`;
  const hsv = `hsv(${hsva.h}, ${hsva.s}%, ${hsva.v}%)`;
  const cmykStr = `cmyk(${cmyk.c}%, ${cmyk.m}%, ${cmyk.y}%, ${cmyk.k}%)`;

  const cssName = HEX_TO_NAME[hex.toLowerCase()] || null;

  return {
    hex,
    hexa,
    rgb,
    rgba: rgbaStr,
    hsl,
    hsla: hslaStr,
    hsv,
    cmyk: cmykStr,
    cssName,
    r: rgba.r,
    g: rgba.g,
    b: rgba.b,
    a: rgba.a,
    h: hsla.h,
    s: hsla.s,
    l: hsla.l,
    v: hsva.v,
    c: cmyk.c,
    m: cmyk.m,
    y: cmyk.y,
    k: cmyk.k,
  };
}
