export type PatternType = "none" | "grid" | "stripes" | "dots" | "crosshatch";

export type BackgroundStyle = "solid" | "gradient";

export type FontFamily = "sans" | "serif" | "mono";

export interface ThumbnailPreset {
  name: string;
  category: "Social" | "Web & Display" | "Video";
  width: number;
  height: number;
  aspectRatio: string;
}

export interface ThumbnailConfig {
  width: number;
  height: number;
  backgroundStyle: BackgroundStyle;
  bgColor1: string;
  bgColor2: string;
  gradientAngle: number;
  textColor: string;
  title: string;
  subtitle: string;
  fontFamily: FontFamily;
  fontSize: number; // 0 for auto
  pattern: PatternType;
  patternOpacity: number; // 0 to 1
  borderWidth: number;
  borderColor: string;
}
