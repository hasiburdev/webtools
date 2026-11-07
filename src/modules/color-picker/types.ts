export interface RGBA {
  r: number; // 0 - 255
  g: number; // 0 - 255
  b: number; // 0 - 255
  a: number; // 0 - 1
}

export interface HSLA {
  h: number; // 0 - 360
  s: number; // 0 - 100
  l: number; // 0 - 100
  a: number; // 0 - 1
}

export interface HSVA {
  h: number; // 0 - 360
  s: number; // 0 - 100
  v: number; // 0 - 100
  a: number; // 0 - 1
}

export interface CMYK {
  c: number; // 0 - 100
  m: number; // 0 - 100
  y: number; // 0 - 100
  k: number; // 0 - 100
}

export interface ColorFormats {
  hex: string;
  hexa: string;
  rgb: string;
  rgba: string;
  hsl: string;
  hsla: string;
  hsv: string;
  cmyk: string;
}

export interface ContrastDetails {
  ratioWithWhite: number;
  ratioWithBlack: number;
  bestTextColor: "#ffffff" | "#000000";
  aaNormalWhite: boolean;
  aaLargeWhite: boolean;
  aaaNormalWhite: boolean;
  aaNormalBlack: boolean;
  aaLargeBlack: boolean;
  aaaNormalBlack: boolean;
}

export interface ColorHarmony {
  name: string;
  description: string;
  colors: string[];
}
