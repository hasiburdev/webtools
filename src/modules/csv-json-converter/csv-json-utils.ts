import Papa from "papaparse";
import type { CsvToJsonOptions, JsonToCsvOptions, ConversionStats } from "./types";

export const SAMPLE_CSV = `id,name,email,role,active,score
1,Alice Johnson,alice@example.com,Admin,true,94.5
2,Bob Smith,bob@example.com,Developer,true,88.2
3,Carol White,carol@example.com,Designer,false,76.0
4,David Lee,david@example.com,Developer,true,91.8
5,Eva Green,eva@example.com,Manager,true,85.4`;

export const SAMPLE_JSON = `[
  {
    "id": 101,
    "product": "Mechanical Keyboard",
    "category": "Electronics",
    "price": 129.99,
    "stock": 45,
    "inStock": true
  },
  {
    "id": 102,
    "product": "Wireless Ergonomic Mouse",
    "category": "Electronics",
    "price": 59.95,
    "stock": 112,
    "inStock": true
  },
  {
    "id": 103,
    "product": "USB-C Dual 4K Dock",
    "category": "Accessories",
    "price": 189.00,
    "stock": 18,
    "inStock": true
  },
  {
    "id": 104,
    "product": "Desk Mat Large 900x400",
    "category": "Accessories",
    "price": 24.50,
    "stock": 0,
    "inStock": false
  }
]`;

/**
 * Convert CSV string to formatted JSON string
 */
export function convertCsvToJson(
  csvContent: string,
  options: CsvToJsonOptions
): {
  jsonString: string;
  tableData: Record<string, unknown>[];
  headers: string[];
  stats: ConversionStats;
  error: string | null;
} {
  const trimmed = csvContent.trim();
  if (!trimmed) {
    return {
      jsonString: "",
      tableData: [],
      headers: [],
      stats: { rowCount: 0, columnCount: 0, inputBytes: 0, outputBytes: 0 },
      error: null,
    };
  }

  try {
    const parseResult = Papa.parse(trimmed, {
      delimiter: options.delimiter === "auto" ? "" : options.delimiter,
      header: options.header,
      dynamicTyping: options.dynamicTyping,
      skipEmptyLines: options.skipEmptyLines,
    });

    if (parseResult.errors.length > 0 && parseResult.data.length === 0) {
      return {
        jsonString: "",
        tableData: [],
        headers: [],
        stats: { rowCount: 0, columnCount: 0, inputBytes: new Blob([csvContent]).size, outputBytes: 0 },
        error: parseResult.errors[0]?.message || "Failed to parse CSV",
      };
    }

    const data = parseResult.data as unknown[];
    const jsonString =
      options.indentSpaces > 0
        ? JSON.stringify(data, null, options.indentSpaces)
        : JSON.stringify(data);

    let headers: string[] = [];
    let tableData: Record<string, unknown>[] = [];

    if (options.header && data.length > 0 && typeof data[0] === "object" && data[0] !== null) {
      tableData = data as Record<string, unknown>[];
      headers = Object.keys(tableData[0]);
    } else if (!options.header && Array.isArray(data[0])) {
      const rows = data as unknown[][];
      headers = rows[0]?.map((_, idx) => `col_${idx + 1}`) || [];
      tableData = rows.map((row) => {
        const obj: Record<string, unknown> = {};
        headers.forEach((h, i) => {
          obj[h] = row[i];
        });
        return obj;
      });
    }

    return {
      jsonString,
      tableData,
      headers,
      stats: {
        rowCount: tableData.length,
        columnCount: headers.length,
        inputBytes: new Blob([csvContent]).size,
        outputBytes: new Blob([jsonString]).size,
      },
      error: null,
    };
  } catch (err) {
    return {
      jsonString: "",
      tableData: [],
      headers: [],
      stats: { rowCount: 0, columnCount: 0, inputBytes: new Blob([csvContent]).size, outputBytes: 0 },
      error: err instanceof Error ? err.message : "Error converting CSV to JSON",
    };
  }
}

/**
 * Flatten a nested JavaScript object into dot-notation keys
 */
export function flattenObject(obj: Record<string, unknown>, prefix = ""): Record<string, unknown> {
  const flattened: Record<string, unknown> = {};

  for (const key of Object.keys(obj)) {
    const val = obj[key];
    const prefixedKey = prefix ? `${prefix}.${key}` : key;

    if (val !== null && typeof val === "object" && !Array.isArray(val) && !(val instanceof Date)) {
      Object.assign(flattened, flattenObject(val as Record<string, unknown>, prefixedKey));
    } else if (Array.isArray(val)) {
      flattened[prefixedKey] = JSON.stringify(val);
    } else {
      flattened[prefixedKey] = val;
    }
  }

  return flattened;
}

/**
 * Convert JSON string to CSV string
 */
export function convertJsonToCsv(
  jsonContent: string,
  options: JsonToCsvOptions
): {
  csvString: string;
  tableData: Record<string, unknown>[];
  headers: string[];
  stats: ConversionStats;
  error: string | null;
} {
  const trimmed = jsonContent.trim();
  if (!trimmed) {
    return {
      csvString: "",
      tableData: [],
      headers: [],
      stats: { rowCount: 0, columnCount: 0, inputBytes: 0, outputBytes: 0 },
      error: null,
    };
  }

  try {
    let parsed: unknown = JSON.parse(trimmed);

    // If single object, wrap into array
    if (parsed && typeof parsed === "object" && !Array.isArray(parsed)) {
      parsed = [parsed];
    }

    if (!Array.isArray(parsed)) {
      return {
        csvString: "",
        tableData: [],
        headers: [],
        stats: { rowCount: 0, columnCount: 0, inputBytes: new Blob([jsonContent]).size, outputBytes: 0 },
        error: "JSON must be an array of objects or a single object",
      };
    }

    let processedData = parsed as Record<string, unknown>[];

    if (options.flattenNested) {
      processedData = processedData.map((item) =>
        item && typeof item === "object" ? flattenObject(item) : item
      );
    }

    const csvString = Papa.unparse(processedData, {
      delimiter: options.delimiter,
      header: options.header,
      quotes: options.quotes,
    });

    const headers =
      processedData.length > 0 && typeof processedData[0] === "object" && processedData[0] !== null
        ? Object.keys(processedData[0])
        : [];

    return {
      csvString,
      tableData: processedData,
      headers,
      stats: {
        rowCount: processedData.length,
        columnCount: headers.length,
        inputBytes: new Blob([jsonContent]).size,
        outputBytes: new Blob([csvString]).size,
      },
      error: null,
    };
  } catch (err) {
    return {
      csvString: "",
      tableData: [],
      headers: [],
      stats: { rowCount: 0, columnCount: 0, inputBytes: new Blob([jsonContent]).size, outputBytes: 0 },
      error: err instanceof Error ? err.message : "Invalid JSON string",
    };
  }
}

/**
 * Trigger file download in browser
 */
export function downloadTextFile(content: string, filename: string, mimeType = "text/plain") {
  const blob = new Blob([content], { type: `${mimeType};charset=utf-8` });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  document.body.appendChild(a);
  a.click();
  document.body.removeChild(a);
  URL.revokeObjectURL(url);
}
