"use client";

import { useState, useRef, useEffect, useMemo } from "react";
import {
  Globe,
  FileText,
  Wifi,
  User,
  Mail,
  MessageSquare,
  Phone,
  Download,
  Copy,
  Check,
  Upload,
  Trash2,
  Sliders,
  Palette,
  FileCode,
  Sparkles,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Slider } from "@/components/ui/slider";
import type {
  QrConfig,
  QrContentType,
  QrErrorCorrectionLevel,
} from "./types";
import {
  buildQrPayload,
  generateQrSvg,
  renderQrToCanvas,
  downloadFile,
} from "./qr-utils";

const FG_COLOR_PRESETS = [
  { name: "Black", color: "#000000" },
  { name: "Slate", color: "#0f172a" },
  { name: "Blue", color: "#2563eb" },
  { name: "Indigo", color: "#4f46e5" },
  { name: "Emerald", color: "#059669" },
  { name: "Crimson", color: "#dc2626" },
  { name: "Purple", color: "#7c3aed" },
];

export function QrCodeGenerator() {
  const [config, setConfig] = useState<QrConfig>({
    contentType: "url",
    rawText: "WebTools — Fast, privacy-first developer utilities.",
    url: "https://webtools.hasiburhasan.com",
    wifi: {
      ssid: "Office_Guest_5G",
      password: "SuperSecretWifiPassword",
      encryption: "WPA",
      hidden: false,
    },
    vcard: {
      firstName: "Hasibur Rahman",
      lastName: "Hasan",
      organization: "WebTools",
      title: "Lead Developer",
      phone: "+1234567890",
      email: "hello@hasiburhasan.com",
      website: "https://hasiburhasan.com",
      note: "Full-stack developer",
    },
    email: {
      email: "hello@hasiburhasan.com",
      subject: "Inquiry via WebTools",
      body: "Hi Hasibur,\n\nI really like the WebTools suite!",
    },
    sms: {
      phone: "+1234567890",
      message: "Hey! Check out this awesome QR code.",
    },
    phone: "+1234567890",

    fgColor: "#0f172a",
    bgColor: "#ffffff",
    errorCorrectionLevel: "M",
    margin: 2,
    size: 512,
  });

  const [logoDataUri, setLogoDataUri] = useState<string | null>(null);
  const [copiedKey, setCopiedKey] = useState<string | null>(null);
  const [svgMarkup, setSvgMarkup] = useState<string>("");

  const canvasRef = useRef<HTMLCanvasElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);

  const payload = useMemo(() => buildQrPayload(config), [config]);

  // Update canvas and SVG whenever config, payload, or logo changes
  useEffect(() => {
    let isCancelled = false;

    async function updateQr() {
      if (!payload) return;

      // 1. Generate SVG
      try {
        const svg = await generateQrSvg(payload, config);
        if (!isCancelled) setSvgMarkup(svg);
      } catch {
        // Handle error silently
      }

      // 2. Render to canvas
      if (canvasRef.current) {
        try {
          await renderQrToCanvas(
            canvasRef.current,
            payload,
            config,
            logoDataUri
          );
        } catch {
          // Handle error silently
        }
      }
    }

    updateQr();
    return () => {
      isCancelled = true;
    };
  }, [config, payload, logoDataUri]);

  const handleLogoUpload = (files: FileList | null) => {
    if (!files || files.length === 0) return;
    const file = files[0];
    const reader = new FileReader();
    reader.onload = () => {
      setLogoDataUri(reader.result as string);
      // Logos require high error correction to remain readable
      setConfig((prev) => ({ ...prev, errorCorrectionLevel: "H" }));
    };
    reader.readAsDataURL(file);
  };

  const handleCopy = async (key: string, text: string) => {
    await navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handleDownloadPng = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob((blob) => {
      if (blob) downloadFile(blob, `qrcode-${config.contentType}.png`);
    }, "image/png");
  };

  const handleDownloadWebp = () => {
    if (!canvasRef.current) return;
    canvasRef.current.toBlob(
      (blob) => {
        if (blob) downloadFile(blob, `qrcode-${config.contentType}.webp`);
      },
      "image/webp",
      0.95
    );
  };

  const handleDownloadSvg = () => {
    const blob = new Blob([svgMarkup], { type: "image/svg+xml;charset=utf-8" });
    downloadFile(blob, `qrcode-${config.contentType}.svg`);
  };

  const contentTypes: { id: QrContentType; label: string; icon: React.ReactNode }[] = [
    { id: "url", label: "URL", icon: <Globe className="size-3.5" /> },
    { id: "text", label: "Text", icon: <FileText className="size-3.5" /> },
    { id: "wifi", label: "Wi-Fi", icon: <Wifi className="size-3.5" /> },
    { id: "vcard", label: "Contact", icon: <User className="size-3.5" /> },
    { id: "email", label: "Email", icon: <Mail className="size-3.5" /> },
    { id: "sms", label: "SMS", icon: <MessageSquare className="size-3.5" /> },
    { id: "phone", label: "Phone", icon: <Phone className="size-3.5" /> },
  ];

  return (
    <div className="space-y-8">
      {/* Content Type Selector */}
      <div className="flex flex-wrap gap-1.5 rounded-xl border border-border bg-card p-2 shadow-xs">
        {contentTypes.map((type) => (
          <button
            key={type.id}
            type="button"
            onClick={() =>
              setConfig((prev) => ({ ...prev, contentType: type.id }))
            }
            className={`flex items-center gap-1.5 rounded-lg px-3.5 py-2 text-xs font-medium transition-all ${
              config.contentType === type.id
                ? "bg-primary text-primary-foreground font-semibold shadow-xs"
                : "text-muted-foreground hover:bg-muted hover:text-foreground"
            }`}
          >
            {type.icon}
            <span>{type.label}</span>
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-12">
        {/* Left Side: Input Form & Customization (7 cols) */}
        <div className="space-y-6 lg:col-span-7">
          {/* Dynamic Content Inputs */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Sparkles className="size-4 text-primary" /> QR Content
            </h2>

            {/* URL Mode */}
            {config.contentType === "url" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Website URL
                </label>
                <Input
                  type="url"
                  placeholder="https://example.com"
                  value={config.url}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, url: e.target.value }))
                  }
                  className="font-mono text-xs"
                />
              </div>
            )}

            {/* Plain Text Mode */}
            {config.contentType === "text" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Plain Text / Notes
                </label>
                <Textarea
                  placeholder="Type any text message to encode into the QR code..."
                  rows={4}
                  value={config.rawText}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, rawText: e.target.value }))
                  }
                  className="font-mono text-xs"
                />
              </div>
            )}

            {/* Wi-Fi Mode */}
            {config.contentType === "wifi" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Network Name (SSID)
                  </label>
                  <Input
                    type="text"
                    placeholder="MyHomeWifi"
                    value={config.wifi.ssid}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, ssid: e.target.value },
                      }))
                    }
                    className="text-xs font-mono"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Password
                    </label>
                    <Input
                      type="text"
                      placeholder="Password (leave empty if open)"
                      value={config.wifi.password || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          wifi: { ...prev.wifi, password: e.target.value },
                        }))
                      }
                      className="text-xs font-mono"
                    />
                  </div>

                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Security Type
                    </label>
                    <select
                      value={config.wifi.encryption}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          wifi: {
                            ...prev.wifi,
                            encryption: e.target
                              .value as QrConfig["wifi"]["encryption"],
                          },
                        }))
                      }
                      className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                    >
                      <option value="WPA">WPA / WPA2 / WPA3</option>
                      <option value="WEP">WEP</option>
                      <option value="nopass">None (Open Network)</option>
                    </select>
                  </div>
                </div>

                <label className="flex items-center gap-2 pt-1 text-xs text-muted-foreground cursor-pointer">
                  <input
                    type="checkbox"
                    checked={config.wifi.hidden}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        wifi: { ...prev.wifi, hidden: e.target.checked },
                      }))
                    }
                    className="rounded border-border text-primary focus:ring-primary size-3.5 cursor-pointer"
                  />
                  <span>Hidden Network (SSID is not broadcasted)</span>
                </label>
              </div>
            )}

            {/* vCard Mode */}
            {config.contentType === "vcard" && (
              <div className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      First Name
                    </label>
                    <Input
                      type="text"
                      placeholder="John"
                      value={config.vcard.firstName}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          vcard: { ...prev.vcard, firstName: e.target.value },
                        }))
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Last Name
                    </label>
                    <Input
                      type="text"
                      placeholder="Doe"
                      value={config.vcard.lastName}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          vcard: { ...prev.vcard, lastName: e.target.value },
                        }))
                      }
                      className="text-xs"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Phone Number
                    </label>
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={config.vcard.phone || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          vcard: { ...prev.vcard, phone: e.target.value },
                        }))
                      }
                      className="text-xs font-mono"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Email Address
                    </label>
                    <Input
                      type="email"
                      placeholder="john@example.com"
                      value={config.vcard.email || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          vcard: { ...prev.vcard, email: e.target.value },
                        }))
                      }
                      className="text-xs font-mono"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Organization
                    </label>
                    <Input
                      type="text"
                      placeholder="Acme Inc."
                      value={config.vcard.organization || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          vcard: {
                            ...prev.vcard,
                            organization: e.target.value,
                          },
                        }))
                      }
                      className="text-xs"
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-medium text-foreground">
                      Website
                    </label>
                    <Input
                      type="url"
                      placeholder="https://example.com"
                      value={config.vcard.website || ""}
                      onChange={(e) =>
                        setConfig((prev) => ({
                          ...prev,
                          vcard: { ...prev.vcard, website: e.target.value },
                        }))
                      }
                      className="text-xs font-mono"
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Email Mode */}
            {config.contentType === "email" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Recipient Email
                  </label>
                  <Input
                    type="email"
                    placeholder="contact@example.com"
                    value={config.email.email}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        email: { ...prev.email, email: e.target.value },
                      }))
                    }
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Subject Line
                  </label>
                  <Input
                    type="text"
                    placeholder="Meeting inquiry"
                    value={config.email.subject || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        email: { ...prev.email, subject: e.target.value },
                      }))
                    }
                    className="text-xs"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Message Body
                  </label>
                  <Textarea
                    placeholder="Message..."
                    rows={3}
                    value={config.email.body || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        email: { ...prev.email, body: e.target.value },
                      }))
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* SMS Mode */}
            {config.contentType === "sms" && (
              <div className="space-y-3">
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+1234567890"
                    value={config.sms.phone}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sms: { ...prev.sms, phone: e.target.value },
                      }))
                    }
                    className="text-xs font-mono"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs font-medium text-foreground">
                    Message
                  </label>
                  <Textarea
                    placeholder="Type SMS text..."
                    rows={3}
                    value={config.sms.message || ""}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        sms: { ...prev.sms, message: e.target.value },
                      }))
                    }
                    className="text-xs"
                  />
                </div>
              </div>
            )}

            {/* Phone Call Mode */}
            {config.contentType === "phone" && (
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-foreground">
                  Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 123-4567"
                  value={config.phone}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, phone: e.target.value }))
                  }
                  className="text-xs font-mono"
                />
              </div>
            )}
          </div>

          {/* Styling & Logo Customization */}
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <h2 className="text-sm font-semibold text-foreground flex items-center gap-2">
              <Palette className="size-4 text-primary" /> Colors & Customization
            </h2>

            {/* Foreground color & presets */}
            <div className="space-y-2">
              <label className="text-xs font-medium text-muted-foreground">
                QR Code Color
              </label>
              <div className="flex flex-wrap items-center gap-2">
                <input
                  type="color"
                  value={config.fgColor}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, fgColor: e.target.value }))
                  }
                  className="size-7 rounded border border-border cursor-pointer"
                />
                <Input
                  type="text"
                  value={config.fgColor}
                  onChange={(e) =>
                    setConfig((prev) => ({ ...prev, fgColor: e.target.value }))
                  }
                  className="w-24 h-7 font-mono text-xs"
                />
                <div className="flex items-center gap-1">
                  {FG_COLOR_PRESETS.map((p) => (
                    <button
                      key={p.name}
                      type="button"
                      onClick={() =>
                        setConfig((prev) => ({ ...prev, fgColor: p.color }))
                      }
                      title={p.name}
                      className="size-5 rounded-full border border-black/10 shadow-xs hover:scale-110 transition-transform"
                      style={{ backgroundColor: p.color }}
                    />
                  ))}
                </div>
              </div>
            </div>

            {/* Background Color */}
            <div className="grid grid-cols-2 gap-4 pt-1">
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Background Color
                </label>
                <div className="flex items-center gap-2">
                  <input
                    type="color"
                    value={
                      config.bgColor === "transparent"
                        ? "#ffffff"
                        : config.bgColor
                    }
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        bgColor: e.target.value,
                      }))
                    }
                    className="size-7 rounded border border-border cursor-pointer"
                  />
                  <Input
                    type="text"
                    value={config.bgColor}
                    onChange={(e) =>
                      setConfig((prev) => ({
                        ...prev,
                        bgColor: e.target.value,
                      }))
                    }
                    className="h-7 font-mono text-xs"
                  />
                </div>
              </div>

              {/* Error correction level */}
              <div className="space-y-1.5">
                <label className="text-xs font-medium text-muted-foreground">
                  Error Correction
                </label>
                <select
                  value={config.errorCorrectionLevel}
                  onChange={(e) =>
                    setConfig((prev) => ({
                      ...prev,
                      errorCorrectionLevel: e.target
                        .value as QrErrorCorrectionLevel,
                    }))
                  }
                  className="w-full rounded-md border border-border bg-background px-2.5 py-1.5 text-xs text-foreground focus:outline-hidden focus:ring-1 focus:ring-primary"
                >
                  <option value="L">L — Low (7% recovery)</option>
                  <option value="M">M — Medium (15% recovery)</option>
                  <option value="Q">Q — Quartile (25% recovery)</option>
                  <option value="H">H — High (30% recovery, best with logo)</option>
                </select>
              </div>
            </div>

            {/* Center Logo Upload */}
            <div className="space-y-2 pt-2 border-t border-border">
              <div className="flex items-center justify-between">
                <label className="text-xs font-medium text-muted-foreground">
                  Center Logo / Icon (Optional)
                </label>
                {logoDataUri && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setLogoDataUri(null)}
                    className="h-6 text-xs text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="mr-1 size-3" /> Remove Logo
                  </Button>
                )}
              </div>

              {!logoDataUri ? (
                <div
                  onClick={() => logoInputRef.current?.click()}
                  className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-border p-3 text-center hover:bg-muted/30 cursor-pointer transition-colors"
                >
                  <input
                    ref={logoInputRef}
                    type="file"
                    accept="image/*"
                    onChange={(e) => handleLogoUpload(e.target.files)}
                    className="sr-only"
                  />
                  <Upload className="size-3.5 text-muted-foreground" />
                  <span className="text-xs text-muted-foreground">
                    Upload icon or logo (PNG, SVG, JPG)
                  </span>
                </div>
              ) : (
                <div className="flex items-center gap-3 rounded-lg border border-border bg-muted/40 p-2">
                  {/* eslint-disable-next-line @next/next/no-img-element */}
                  <img
                    src={logoDataUri}
                    alt="Logo"
                    className="size-8 object-contain rounded border border-border bg-white p-0.5"
                  />
                  <span className="text-xs text-muted-foreground">
                    Center logo active (Error correction automatically set to High)
                  </span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Side: Live QR Display & Export (5 cols) */}
        <div className="space-y-6 lg:col-span-5">
          <div className="rounded-xl border border-border bg-card p-5 shadow-xs space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-sm font-semibold text-foreground">
                Live Preview
              </span>
              <Button
                size="sm"
                variant="outline"
                onClick={() => handleCopy("svg", svgMarkup)}
                className="h-7 text-xs"
              >
                {copiedKey === "svg" ? (
                  <>
                    <Check className="mr-1 size-3 text-emerald-500" /> Copied
                  </>
                ) : (
                  <>
                    <FileCode className="mr-1 size-3" /> Copy SVG
                  </>
                )}
              </Button>
            </div>

            {/* Checkerboard container for previewing transparency */}
            <div className="relative flex min-h-[340px] items-center justify-center overflow-hidden rounded-xl border border-border bg-[linear-gradient(45deg,#f0f0f0_25%,transparent_25%),linear-gradient(-45deg,#f0f0f0_25%,transparent_25%),linear-gradient(45deg,transparent_75%,#f0f0f0_75%),linear-gradient(-45deg,transparent_75%,#f0f0f0_75%)] bg-[size:16px_16px] bg-[position:0_0,0_8px,8px_-8px,-8px_0] dark:bg-zinc-950 p-6 shadow-inner">
              <canvas
                ref={canvasRef}
                className="max-h-[280px] max-w-[280px] rounded-lg shadow-md"
              />
            </div>

            {/* Payload summary */}
            <div className="rounded-lg bg-muted/50 p-3 text-xs space-y-1">
              <div className="flex justify-between font-medium text-muted-foreground">
                <span>Encoded Payload:</span>
                <span className="font-mono">{payload.length} chars</span>
              </div>
              <p className="font-mono text-foreground break-all line-clamp-2">
                {payload}
              </p>
            </div>

            {/* Export Actions */}
            <div className="space-y-2 pt-2">
              <Button
                onClick={handleDownloadPng}
                className="w-full gap-2 font-semibold"
              >
                <Download className="size-4" /> Download High-Res PNG
              </Button>

              <div className="grid grid-cols-2 gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadSvg}
                  className="gap-1 text-xs"
                >
                  <Download className="size-3.5" /> Download SVG
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDownloadWebp}
                  className="gap-1 text-xs"
                >
                  <Download className="size-3.5" /> Download WebP
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
