export type EncodeMode = "encode" | "decode";

export type EncodingStandard = "component" | "full-url" | "base64" | "base64-url";

export type SpaceEncoding = "percent" | "plus";

export interface QueryParamItem {
  id: string;
  key: string;
  value: string;
  enabled: boolean;
}

export interface ParsedUrlBreakdown {
  isValidUrl: boolean;
  protocol?: string;
  host?: string;
  pathname?: string;
  params: QueryParamItem[];
  hash?: string;
}
