import type {
  EncodeMode,
  EncodingStandard,
  SpaceEncoding,
  ParsedUrlBreakdown,
  QueryParamItem,
} from "./types";

/**
 * Safely encode text using the selected standard and space rule
 */
export function encodeUrlText(
  input: string,
  standard: EncodingStandard,
  spaceRule: SpaceEncoding = "percent"
): { output: string; error: string | null } {
  if (!input) return { output: "", error: null };

  try {
    let result = "";

    switch (standard) {
      case "component": {
        result = encodeURIComponent(input);
        if (spaceRule === "plus") {
          result = result.replace(/%20/g, "+");
        }
        break;
      }
      case "full-url": {
        result = encodeURI(input);
        if (spaceRule === "plus") {
          result = result.replace(/%20/g, "+");
        }
        break;
      }
      case "base64": {
        // Handle utf-8 safely
        const bytes = new TextEncoder().encode(input);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        result = btoa(binary);
        break;
      }
      case "base64-url": {
        const bytes = new TextEncoder().encode(input);
        let binary = "";
        for (let i = 0; i < bytes.length; i++) {
          binary += String.fromCharCode(bytes[i]);
        }
        result = btoa(binary)
          .replace(/\+/g, "-")
          .replace(/\//g, "_")
          .replace(/=+$/, "");
        break;
      }
    }

    return { output: result, error: null };
  } catch (err) {
    return {
      output: "",
      error: err instanceof Error ? err.message : "Encoding failed",
    };
  }
}

/**
 * Safely decode text using the selected standard and space rule
 */
export function decodeUrlText(
  input: string,
  standard: EncodingStandard,
  spaceRule: SpaceEncoding = "percent"
): { output: string; error: string | null } {
  if (!input) return { output: "", error: null };

  try {
    let processed = input;
    if (spaceRule === "plus") {
      processed = processed.replace(/\+/g, " ");
    }

    let result = "";

    switch (standard) {
      case "component": {
        result = decodeURIComponent(processed);
        break;
      }
      case "full-url": {
        result = decodeURI(processed);
        break;
      }
      case "base64": {
        const binary = atob(processed.trim());
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        result = new TextDecoder().decode(bytes);
        break;
      }
      case "base64-url": {
        let base64 = processed
          .trim()
          .replace(/-/g, "+")
          .replace(/_/g, "/");
        while (base64.length % 4 !== 0) {
          base64 += "=";
        }
        const binary = atob(base64);
        const bytes = new Uint8Array(binary.length);
        for (let i = 0; i < binary.length; i++) {
          bytes[i] = binary.charCodeAt(i);
        }
        result = new TextDecoder().decode(bytes);
        break;
      }
    }

    return { output: result, error: null };
  } catch (err) {
    return {
      output: "",
      error:
        err instanceof Error
          ? err.message
          : "Invalid or malformed encoded URL string",
    };
  }
}

/**
 * Parses a string into URL segments and query parameters
 */
export function parseUrlBreakdown(input: string): ParsedUrlBreakdown {
  const trimmed = input.trim();
  if (!trimmed) {
    return { isValidUrl: false, params: [] };
  }

  // Check if it's a full URL or a relative query string
  try {
    let urlObj: URL;
    let isFullUrl = false;

    if (/^[a-zA-Z][a-zA-Z\d+\-.]*:\/\//i.test(trimmed)) {
      urlObj = new URL(trimmed);
      isFullUrl = true;
    } else if (trimmed.startsWith("/") || trimmed.startsWith("?") || trimmed.includes("?")) {
      urlObj = new URL(trimmed, "http://dummy.local");
      isFullUrl = false;
    } else if (trimmed.includes("=") || trimmed.includes("&")) {
      urlObj = new URL(`http://dummy.local/?${trimmed}`);
      isFullUrl = false;
    } else {
      return { isValidUrl: false, params: [] };
    }

    const params: QueryParamItem[] = [];
    urlObj.searchParams.forEach((val, key) => {
      params.push({
        id: Math.random().toString(36).slice(2, 9),
        key,
        value: val,
        enabled: true,
      });
    });

    if (isFullUrl) {
      return {
        isValidUrl: true,
        protocol: urlObj.protocol,
        host: urlObj.host,
        pathname: urlObj.pathname,
        params,
        hash: urlObj.hash,
      };
    } else {
      return {
        isValidUrl: false,
        pathname: trimmed.split("?")[0] || "",
        params,
        hash: urlObj.hash,
      };
    }
  } catch {
    return { isValidUrl: false, params: [] };
  }
}

/**
 * Reconstructs a full URL or query string from breakdown parts
 */
export function buildUrlFromBreakdown(
  breakdown: ParsedUrlBreakdown,
  params: QueryParamItem[]
): string {
  const searchParams = new URLSearchParams();
  for (const item of params) {
    if (item.enabled && item.key) {
      searchParams.append(item.key, item.value);
    }
  }

  const queryStr = searchParams.toString();
  const queryPart = queryStr ? `?${queryStr}` : "";
  const hashPart = breakdown.hash ? (breakdown.hash.startsWith("#") ? breakdown.hash : `#${breakdown.hash}`) : "";

  if (breakdown.isValidUrl && breakdown.protocol && breakdown.host) {
    const path = breakdown.pathname ?? "/";
    return `${breakdown.protocol}//${breakdown.host}${path}${queryPart}${hashPart}`;
  }

  const basePath = breakdown.pathname && breakdown.pathname !== "http://dummy.local" ? breakdown.pathname : "";
  return `${basePath}${queryPart}${hashPart}`;
}
