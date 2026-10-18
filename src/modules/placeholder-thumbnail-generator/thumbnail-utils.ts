import type { ThumbnailConfig, ThumbnailPreset, PatternType } from "./types";

export const THUMBNAIL_PRESETS: ThumbnailPreset[] = [
  {
    name: "YouTube Thumbnail",
    category: "Video",
    width: 1280,
    height: 720,
    aspectRatio: "16:9",
  },
  {
    name: "Open Graph / FB Share",
    category: "Social",
    width: 1200,
    height: 630,
    aspectRatio: "1.91:1",
  },
  {
    name: "Twitter / X Card",
    category: "Social",
    width: 1200,
    height: 675,
    aspectRatio: "16:9",
  },
  {
    name: "Instagram Square",
    category: "Social",
    width: 1080,
    height: 1080,
    aspectRatio: "1:1",
  },
  {
    name: "Instagram Story / Reel",
    category: "Social",
    width: 1080,
    height: 1920,
    aspectRatio: "9:16",
  },
  {
    name: "Full HD (1080p)",
    category: "Web & Display",
    width: 1920,
    height: 1080,
    aspectRatio: "16:9",
  },
  {
    name: "Standard Web (800×600)",
    category: "Web & Display",
    width: 800,
    height: 600,
    aspectRatio: "4:3",
  },
  {
    name: "Square Thumbnail (400×400)",
    category: "Web & Display",
    width: 400,
    height: 400,
    aspectRatio: "1:1",
  },
  {
    name: "Medium Rectangle (Ad)",
    category: "Web & Display",
    width: 300,
    height: 250,
    aspectRatio: "6:5",
  },
  {
    name: "Leaderboard Banner",
    category: "Web & Display",
    width: 728,
    height: 90,
    aspectRatio: "8:1",
  },
];

/**
 * Generate standalone SVG markup matching the configuration
 */
export function generateSvgMarkup(config: ThumbnailConfig): string {
  const {
    width,
    height,
    backgroundStyle,
    bgColor1,
    bgColor2,
    gradientAngle,
    textColor,
    title,
    subtitle,
    fontFamily,
    fontSize,
    pattern,
    patternOpacity,
    borderWidth,
    borderColor,
  } = config;

  const fontStack =
    fontFamily === "mono"
      ? "ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, monospace"
      : fontFamily === "serif"
        ? "Georgia, Cambria, 'Times New Roman', Times, serif"
        : "system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif";

  const effectiveTitle = title || `${width} × ${height}`;
  const effectiveFontSize = fontSize > 0 ? fontSize : Math.max(16, Math.min(width, height) * 0.08);
  const subtitleFontSize = effectiveFontSize * 0.45;

  // Patterns definition
  let patternDef = "";
  let patternFill = "";

  if (pattern === "grid") {
    patternDef = `
      <pattern id="grid-pattern" width="40" height="40" patternUnits="userSpaceOnUse">
        <path d="M 40 0 L 0 0 0 40" fill="none" stroke="${textColor}" stroke-width="1" opacity="${patternOpacity}" />
      </pattern>`;
    patternFill = `<rect width="${width}" height="${height}" fill="url(#grid-pattern)" />`;
  } else if (pattern === "stripes") {
    patternDef = `
      <pattern id="stripes-pattern" width="30" height="30" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">
        <line x1="0" y1="0" x2="0" y2="30" stroke="${textColor}" stroke-width="6" opacity="${patternOpacity}" />
      </pattern>`;
    patternFill = `<rect width="${width}" height="${height}" fill="url(#stripes-pattern)" />`;
  } else if (pattern === "dots") {
    patternDef = `
      <pattern id="dots-pattern" width="30" height="30" patternUnits="userSpaceOnUse">
        <circle cx="15" cy="15" r="2.5" fill="${textColor}" opacity="${patternOpacity}" />
      </pattern>`;
    patternFill = `<rect width="${width}" height="${height}" fill="url(#dots-pattern)" />`;
  } else if (pattern === "crosshatch") {
    patternDef = `
      <pattern id="crosshatch-pattern" width="20" height="20" patternUnits="userSpaceOnUse">
        <path d="M 0 0 L 20 20 M 20 0 L 0 20" stroke="${textColor}" stroke-width="1" opacity="${patternOpacity}" />
      </pattern>`;
    patternFill = `<rect width="${width}" height="${height}" fill="url(#crosshatch-pattern)" />`;
  }

  // Background definition
  let bgDef = "";
  let bgFill = bgColor1;

  if (backgroundStyle === "gradient") {
    const angleRad = (gradientAngle * Math.PI) / 180;
    const x1 = Math.round(50 - Math.cos(angleRad) * 50);
    const y1 = Math.round(50 - Math.sin(angleRad) * 50);
    const x2 = Math.round(50 + Math.cos(angleRad) * 50);
    const y2 = Math.round(50 + Math.sin(angleRad) * 50);

    bgDef = `
      <linearGradient id="bg-grad" x1="${x1}%" y1="${y1}%" x2="${x2}%" y2="${y2}%">
        <stop offset="0%" stop-color="${bgColor1}" />
        <stop offset="100%" stop-color="${bgColor2}" />
      </linearGradient>`;
    bgFill = "url(#bg-grad)";
  }

  const borderAttr =
    borderWidth > 0
      ? `stroke="${borderColor}" stroke-width="${borderWidth * 2}"`
      : "";

  return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${width} ${height}" width="${width}" height="${height}">
  <defs>
    ${bgDef}
    ${patternDef}
  </defs>

  <!-- Background -->
  <rect width="${width}" height="${height}" fill="${bgFill}" ${borderAttr} />

  <!-- Pattern Overlay -->
  ${patternFill}

  <!-- Text -->
  <g text-anchor="middle" font-family="${fontStack}" fill="${textColor}">
    <text x="${width / 2}" y="${height / 2 + (subtitle ? -subtitleFontSize * 0.5 : effectiveFontSize * 0.35)}" font-size="${effectiveFontSize}" font-weight="bold" letter-spacing="-0.02em">
      ${escapeXml(effectiveTitle)}
    </text>
    ${
      subtitle
        ? `<text x="${width / 2}" y="${height / 2 + effectiveFontSize * 0.85}" font-size="${subtitleFontSize}" opacity="0.85" font-weight="500">
      ${escapeXml(subtitle)}
    </text>`
        : ""
    }
  </g>
</svg>`;
}

function escapeXml(unsafe: string): string {
  return unsafe.replace(/[<>&'"]/g, (c) => {
    switch (c) {
      case "<":
        return "&lt;";
      case ">":
        return "&gt;";
      case "&":
        return "&amp;";
      case "'":
        return "&apos;";
      case '"':
        return "&quot;";
      default:
        return c;
    }
  });
}

/**
 * Render thumbnail onto an HTML Canvas and export as Blob or DataURL
 */
export function renderThumbnailToCanvas(
  canvas: HTMLCanvasElement,
  config: ThumbnailConfig
): Promise<void> {
  return new Promise((resolve, reject) => {
    const svgMarkup = generateSvgMarkup(config);
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    const url = URL.createObjectURL(blob);
    const img = new Image();

    img.onload = () => {
      canvas.width = config.width;
      canvas.height = config.height;
      const ctx = canvas.getContext("2d");
      if (!ctx) {
        URL.revokeObjectURL(url);
        return reject(new Error("Unable to get canvas context"));
      }
      ctx.clearRect(0, 0, config.width, config.height);
      ctx.drawImage(img, 0, 0);
      URL.revokeObjectURL(url);
      resolve();
    };

    img.onerror = (e) => {
      URL.revokeObjectURL(url);
      reject(e);
    };

    img.src = url;
  });
}

/**
 * Download a file from blob
 */
export function downloadBlob(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
