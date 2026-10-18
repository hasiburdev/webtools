export type ColorModelType =
  | "hex"
  | "rgb"
  | "hsl"
  | "hsv"
  | "cmyk"
  | "name";

export interface ColorConversionResult {
  hex: string;
  hexa: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
  cmyk: string;
  cssName: string | null;
  r: number;
  g: number;
  b: number;
  a: number;
  h: number;
  s: number;
  l: number;
  v: number;
  c: number;
  m: number;
  y: number;
  k: number;
}
