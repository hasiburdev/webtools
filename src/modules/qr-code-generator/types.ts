export type QrContentType =
  | "url"
  | "text"
  | "wifi"
  | "vcard"
  | "email"
  | "sms"
  | "phone";

export type QrErrorCorrectionLevel = "L" | "M" | "Q" | "H";

export interface WifiData {
  ssid: string;
  password?: string;
  encryption: "WPA" | "WEP" | "nopass";
  hidden: boolean;
}

export interface VCardData {
  firstName: string;
  lastName: string;
  organization?: string;
  title?: string;
  phone?: string;
  email?: string;
  website?: string;
  note?: string;
}

export interface EmailData {
  email: string;
  subject?: string;
  body?: string;
}

export interface SmsData {
  phone: string;
  message?: string;
}

export interface QrConfig {
  contentType: QrContentType;
  // Raw text or specific data objects
  rawText: string;
  url: string;
  wifi: WifiData;
  vcard: VCardData;
  email: EmailData;
  sms: SmsData;
  phone: string;

  // Styling
  fgColor: string;
  bgColor: string;
  errorCorrectionLevel: QrErrorCorrectionLevel;
  margin: number;
  size: number;
}
