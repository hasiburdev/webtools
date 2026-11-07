import QRCode from "qrcode";
import type { QrConfig } from "./types";

/**
 * Format payload according to the selected content type
 */
export function buildQrPayload(config: QrConfig): string {
  switch (config.contentType) {
    case "url": {
      const u = config.url.trim();
      if (!u) return "";
      return /^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(u) ? u : `https://${u}`;
    }
    case "text":
      return config.rawText;
    case "wifi": {
      const { ssid, password, encryption, hidden } = config.wifi;
      if (!ssid) return "";
      // Escape special characters in SSID and password: \ ; , : "
      const escape = (str: string) => str.replace(/([\\;,:"'])/g, "\\$1");
      const enc = encryption === "nopass" ? "nopass" : encryption;
      const pass = encryption !== "nopass" && password ? `P:${escape(password)};` : "";
      const hid = hidden ? "H:true;" : "";
      return `WIFI:T:${enc};S:${escape(ssid)};${pass}${hid};`;
    }
    case "vcard": {
      const { firstName, lastName, organization, title, phone, email, website, note } = config.vcard;
      const fullName = `${lastName} ${firstName}`.trim();
      if (!fullName && !phone && !email) return "";

      const lines = [
        "BEGIN:VCARD",
        "VERSION:3.0",
        `N:${lastName};${firstName};;;`,
        `FN:${firstName} ${lastName}`.trim(),
      ];
      if (organization) lines.push(`ORG:${organization}`);
      if (title) lines.push(`TITLE:${title}`);
      if (phone) lines.push(`TEL;TYPE=CELL:${phone}`);
      if (email) lines.push(`EMAIL:${email}`);
      if (website) lines.push(`URL:${website}`);
      if (note) lines.push(`NOTE:${note}`);
      lines.push("END:VCARD");

      return lines.join("\n");
    }
    case "email": {
      const { email, subject, body } = config.email;
      if (!email) return "";
      const params = new URLSearchParams();
      if (subject) params.append("subject", subject);
      if (body) params.append("body", body);
      const query = params.toString();
      return `mailto:${email}${query ? `?${query}` : ""}`;
    }
    case "sms": {
      const { phone, message } = config.sms;
      if (!phone) return "";
      return `smsto:${phone}:${message || ""}`;
    }
    case "phone": {
      const p = config.phone.trim();
      if (!p) return "";
      return `tel:${p}`;
    }
    default:
      return "";
  }
}

/**
 * Generate standalone SVG string
 */
export async function generateQrSvg(
  payload: string,
  config: Pick<QrConfig, "fgColor" | "bgColor" | "errorCorrectionLevel" | "margin">
): Promise<string> {
  if (!payload) return "";

  return QRCode.toString(payload, {
    type: "svg",
    errorCorrectionLevel: config.errorCorrectionLevel,
    margin: config.margin,
    color: {
      dark: config.fgColor,
      light: config.bgColor === "transparent" ? "#00000000" : config.bgColor,
    },
  });
}

/**
 * Render QR to canvas with optional center logo
 */
export async function renderQrToCanvas(
  canvas: HTMLCanvasElement,
  payload: string,
  config: QrConfig,
  logoDataUri?: string | null
): Promise<void> {
  if (!payload) return;

  await QRCode.toCanvas(canvas, payload, {
    width: config.size,
    margin: config.margin,
    errorCorrectionLevel: config.errorCorrectionLevel,
    color: {
      dark: config.fgColor,
      light: config.bgColor === "transparent" ? "#00000000" : config.bgColor,
    },
  });

  // If a logo is provided, draw it at the center of the canvas
  if (logoDataUri) {
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    await new Promise<void>((resolve) => {
      const img = new Image();
      img.onload = () => {
        const logoSize = Math.round(canvas.width * 0.22);
        const logoX = Math.round((canvas.width - logoSize) / 2);
        const logoY = Math.round((canvas.height - logoSize) / 2);
        const padding = Math.round(logoSize * 0.12);

        // Draw background pill behind logo
        ctx.fillStyle = config.bgColor === "transparent" ? "#ffffff" : config.bgColor;
        ctx.beginPath();
        const r = 8;
        ctx.roundRect(
          logoX - padding,
          logoY - padding,
          logoSize + padding * 2,
          logoSize + padding * 2,
          r
        );
        ctx.fill();

        // Draw logo
        ctx.drawImage(img, logoX, logoY, logoSize, logoSize);
        resolve();
      };
      img.onerror = () => resolve();
      img.src = logoDataUri;
    });
  }
}

/**
 * Download a blob
 */
export function downloadFile(blob: Blob, filename: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
