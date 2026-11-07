import type {
  RGBA,
  HSLA,
  HSVA,
  CMYK,
  ColorFormats,
  ContrastDetails,
  ColorHarmony,
} from "./types";

/** Clamp a number between min and max */
export function clamp(val: number, min: number, max: number): number {
  return Math.min(Math.max(val, min), max);
}

/** Parse any hex format (#rgb, #rgba, #rrggbb, #rrggbbaa) */
export function hexToRgba(hex: string): RGBA | null {
  const cleanHex = hex.trim().replace(/^#/, "");
  if (!/^[0-9a-fA-F]+$/.test(cleanHex)) return null;

  let r = 0, g = 0, b = 0, a = 1;

  if (cleanHex.length === 3) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
  } else if (cleanHex.length === 4) {
    r = parseInt(cleanHex[0] + cleanHex[0], 16);
    g = parseInt(cleanHex[1] + cleanHex[1], 16);
    b = parseInt(cleanHex[2] + cleanHex[2], 16);
    a = Math.round((parseInt(cleanHex[3] + cleanHex[3], 16) / 255) * 100) / 100;
  } else if (cleanHex.length === 6) {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
  } else if (cleanHex.length === 8) {
    r = parseInt(cleanHex.slice(0, 2), 16);
    g = parseInt(cleanHex.slice(2, 4), 16);
    b = parseInt(cleanHex.slice(4, 6), 16);
    a = Math.round((parseInt(cleanHex.slice(6, 8), 16) / 255) * 100) / 100;
  } else {
    return null;
  }

  return { r, g, b, a };
}

/** Convert RGBA to hex string */
export function rgbaToHex(rgba: RGBA, includeAlpha = false): string {
  const rHex = clamp(Math.round(rgba.r), 0, 255).toString(16).padStart(2, "0");
  const gHex = clamp(Math.round(rgba.g), 0, 255).toString(16).padStart(2, "0");
  const bHex = clamp(Math.round(rgba.b), 0, 255).toString(16).padStart(2, "0");

  if (!includeAlpha || rgba.a >= 1) {
    return `#${rHex}${gHex}${bHex}`;
  }

  const aHex = clamp(Math.round(rgba.a * 255), 0, 255).toString(16).padStart(2, "0");
  return `#${rHex}${gHex}${bHex}${aHex}`;
}

/** Convert RGBA to HSLA */
export function rgbaToHsla(rgba: RGBA): HSLA {
  const r = clamp(rgba.r, 0, 255) / 255;
  const g = clamp(rgba.g, 0, 255) / 255;
  const b = clamp(rgba.b, 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  let s = 0;
  const l = (max + min) / 2;

  if (delta !== 0) {
    s = l > 0.5 ? delta / (2 - max - min) : delta / (max + min);

    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / delta + 2) * 60;
        break;
      case b:
        h = ((r - g) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    l: Math.round(l * 100),
    a: Math.round(rgba.a * 100) / 100,
  };
}

/** Convert HSLA to RGBA */
export function hslaToRgba(hsla: HSLA): RGBA {
  const h = (hsla.h % 360 + 360) % 360;
  const s = clamp(hsla.s, 0, 100) / 100;
  const l = clamp(hsla.l, 0, 100) / 100;

  const c = (1 - Math.abs(2 * l - 1)) * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = l - c / 2;

  let rPrime = 0, gPrime = 0, bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
    a: hsla.a,
  };
}

/** Convert RGBA to HSVA */
export function rgbaToHsva(rgba: RGBA): HSVA {
  const r = clamp(rgba.r, 0, 255) / 255;
  const g = clamp(rgba.g, 0, 255) / 255;
  const b = clamp(rgba.b, 0, 255) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const delta = max - min;

  let h = 0;
  const v = max;
  const s = max === 0 ? 0 : delta / max;

  if (delta !== 0) {
    switch (max) {
      case r:
        h = ((g - b) / delta + (g < b ? 6 : 0)) * 60;
        break;
      case g:
        h = ((b - r) / delta + 2) * 60;
        break;
      case b:
        h = ((r - g) / delta + 4) * 60;
        break;
    }
  }

  return {
    h: Math.round(h),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
    a: Math.round(rgba.a * 100) / 100,
  };
}

/** Convert HSVA to RGBA */
export function hsvaToRgba(hsva: HSVA): RGBA {
  const h = (hsva.h % 360 + 360) % 360;
  const s = clamp(hsva.s, 0, 100) / 100;
  const v = clamp(hsva.v, 0, 100) / 100;

  const c = v * s;
  const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
  const m = v - c;

  let rPrime = 0, gPrime = 0, bPrime = 0;

  if (h >= 0 && h < 60) {
    rPrime = c; gPrime = x; bPrime = 0;
  } else if (h >= 60 && h < 120) {
    rPrime = x; gPrime = c; bPrime = 0;
  } else if (h >= 120 && h < 180) {
    rPrime = 0; gPrime = c; bPrime = x;
  } else if (h >= 180 && h < 240) {
    rPrime = 0; gPrime = x; bPrime = c;
  } else if (h >= 240 && h < 300) {
    rPrime = x; gPrime = 0; bPrime = c;
  } else {
    rPrime = c; gPrime = 0; bPrime = x;
  }

  return {
    r: Math.round((rPrime + m) * 255),
    g: Math.round((gPrime + m) * 255),
    b: Math.round((bPrime + m) * 255),
    a: hsva.a,
  };
}

/** Convert RGBA to CMYK */
export function rgbaToCmyk(rgba: RGBA): CMYK {
  const r = clamp(rgba.r, 0, 255) / 255;
  const g = clamp(rgba.g, 0, 255) / 255;
  const b = clamp(rgba.b, 0, 255) / 255;

  const k = 1 - Math.max(r, g, b);
  if (k === 1) {
    return { c: 0, m: 0, y: 0, k: 100 };
  }

  const c = (1 - r - k) / (1 - k);
  const m = (1 - g - k) / (1 - k);
  const y = (1 - b - k) / (1 - k);

  return {
    c: Math.round(c * 100),
    m: Math.round(m * 100),
    y: Math.round(y * 100),
    k: Math.round(k * 100),
  };
}

/** Build all string format variations */
export function getFormattedColor(rgba: RGBA): ColorFormats {
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

  return {
    hex,
    hexa,
    rgb,
    rgba: rgbaStr,
    hsl,
    hsla: hslaStr,
    hsv,
    cmyk: cmykStr,
  };
}

/** WCAG 2.1 Relative Luminance */
export function getRelativeLuminance(rgba: RGBA): number {
  const normalize = (val: number) => {
    const s = val / 255;
    return s <= 0.04045 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  };

  const r = normalize(rgba.r);
  const g = normalize(rgba.g);
  const b = normalize(rgba.b);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/** Calculate contrast ratio between two luminance values */
export function getContrastRatio(lum1: number, lum2: number): number {
  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);
  return Math.round(((lighter + 0.05) / (darker + 0.05)) * 100) / 100;
}

/** Comprehensive WCAG contrast analysis against White (#fff) and Black (#000) */
export function calculateContrast(rgba: RGBA): ContrastDetails {
  const colorLum = getRelativeLuminance(rgba);
  const whiteLum = 1.0;
  const blackLum = 0.0;

  const ratioWithWhite = getContrastRatio(colorLum, whiteLum);
  const ratioWithBlack = getContrastRatio(colorLum, blackLum);

  return {
    ratioWithWhite,
    ratioWithBlack,
    bestTextColor: ratioWithBlack >= ratioWithWhite ? "#000000" : "#ffffff",
    aaNormalWhite: ratioWithWhite >= 4.5,
    aaLargeWhite: ratioWithWhite >= 3.0,
    aaaNormalWhite: ratioWithWhite >= 7.0,
    aaNormalBlack: ratioWithBlack >= 4.5,
    aaLargeBlack: ratioWithBlack >= 3.0,
    aaaNormalBlack: ratioWithBlack >= 7.0,
  };
}

/** Generate color harmonies from an HSLA base */
export function getHarmonies(hsla: HSLA): ColorHarmony[] {
  const makeHex = (hOffset: number) => {
    const adjustedH = (hsla.h + hOffset + 360) % 360;
    const targetRgba = hslaToRgba({ ...hsla, h: adjustedH });
    return rgbaToHex(targetRgba, false);
  };

  const baseHex = rgbaToHex(hslaToRgba(hsla), false);

  return [
    {
      name: "Complementary",
      description: "Opposite side of the color wheel (180°)",
      colors: [baseHex, makeHex(180)],
    },
    {
      name: "Analogous",
      description: "Adjacent colors on the wheel (±30°)",
      colors: [makeHex(-30), baseHex, makeHex(30)],
    },
    {
      name: "Triadic",
      description: "Three evenly spaced colors (120° apart)",
      colors: [baseHex, makeHex(120), makeHex(240)],
    },
    {
      name: "Tetradic",
      description: "Four colors arranged into two complementary pairs (90° apart)",
      colors: [baseHex, makeHex(90), makeHex(180), makeHex(270)],
    },
    {
      name: "Split Complementary",
      description: "Base color plus the two colors adjacent to its complement",
      colors: [baseHex, makeHex(150), makeHex(210)],
    },
  ];
}

/** Generate lighter tints by mixing with white */
export function getTints(rgba: RGBA, count = 7): string[] {
  const tints: string[] = [];
  for (let i = 1; i <= count; i++) {
    const factor = i / (count + 1);
    const r = Math.round(rgba.r + (255 - rgba.r) * factor);
    const g = Math.round(rgba.g + (255 - rgba.g) * factor);
    const b = Math.round(rgba.b + (255 - rgba.b) * factor);
    tints.push(rgbaToHex({ r, g, b, a: 1 }, false));
  }
  return tints;
}

/** Generate darker shades by mixing with black */
export function getShades(rgba: RGBA, count = 7): string[] {
  const shades: string[] = [];
  for (let i = 1; i <= count; i++) {
    const factor = 1 - i / (count + 1);
    const r = Math.round(rgba.r * factor);
    const g = Math.round(rgba.g * factor);
    const b = Math.round(rgba.b * factor);
    shades.push(rgbaToHex({ r, g, b, a: 1 }, false));
  }
  return shades;
}
