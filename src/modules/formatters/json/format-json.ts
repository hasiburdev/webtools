import type {
  FormatError,
  FormatResult,
  FormatStats,
  JsonFormatOptions,
} from "../types";

/**
 * Deeply sort object keys alphabetically (case-insensitive or standard order)
 */
export function sortKeysDeep(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(sortKeysDeep);
  }
  if (value !== null && typeof value === "object" && !(value instanceof Date) && !(value instanceof RegExp)) {
    const record = value as Record<string, unknown>;
    const sortedObj: Record<string, unknown> = {};
    const keys = Object.keys(record).sort((a, b) => a.localeCompare(b));
    for (const key of keys) {
      sortedObj[key] = sortKeysDeep(record[key]);
    }
    return sortedObj;
  }
  return value;
}

/**
 * Robust scanner to repair common JSON syntax mistakes:
 * - Strips single-line (`//`) and multi-line (`/* ... *\/`) comments outside strings
 * - Converts single-quoted strings to valid double-quoted strings
 * - Fixes unquoted keys (`{ key: "value" }` -> `{ "key": "value" }`)
 * - Removes trailing commas before `}` and `]`
 */
export function repairJson(raw: string): string {
  let result = "";
  let inString = false;
  let quoteChar = "";
  let isEscaped = false;
  let i = 0;

  while (i < raw.length) {
    const char = raw[i];
    const nextChar = raw[i + 1];

    if (inString) {
      if (isEscaped) {
        result += char;
        isEscaped = false;
      } else if (char === "\\") {
        result += char;
        isEscaped = true;
      } else if (char === quoteChar) {
        inString = false;
        result += '"';
      } else if (quoteChar === "'" && char === '"') {
        result += '\\"';
      } else {
        result += char;
      }
      i++;
      continue;
    }

    // Check single-line comment
    if (char === "/" && nextChar === "/") {
      while (i < raw.length && raw[i] !== "\n") {
        i++;
      }
      continue;
    }

    // Check multi-line comment
    if (char === "/" && nextChar === "*") {
      i += 2;
      while (i < raw.length && !(raw[i] === "*" && raw[i + 1] === "/")) {
        i++;
      }
      i += 2;
      continue;
    }

    // Check string boundary
    if (char === '"' || char === "'") {
      inString = true;
      quoteChar = char;
      result += '"';
      i++;
      continue;
    }

    result += char;
    i++;
  }

  // Remove trailing commas before } or ]
  let cleaned = result.replace(/,\s*([}\]])/g, "$1");

  // Fix unquoted property names: { foo: 1 } or , foo: 1
  cleaned = cleaned.replace(/([{,]\s*)([a-zA-Z_$][a-zA-Z0-9_$-]*)\s*:/g, '$1"$2":');

  return cleaned;
}

/**
 * Safely calculates byte count using UTF-8 encoding
 */
export function getByteLength(str: string): number {
  if (typeof TextEncoder !== "undefined") {
    return new TextEncoder().encode(str).length;
  }
  return str.length;
}

/**
 * Calculate metrics for input and formatted output
 */
export function calculateStats(input: string, output: string): FormatStats {
  const inputLines = input.length === 0 ? 0 : input.split("\n").length;
  const outputLines = output.length === 0 ? 0 : output.split("\n").length;

  return {
    inputChars: input.length,
    outputChars: output.length,
    inputBytes: getByteLength(input),
    outputBytes: getByteLength(output),
    inputLines,
    outputLines,
  };
}

/**
 * Generates a helpful snippet pointing to line and column of the syntax error
 */
export function generateErrorSnippet(input: string, line: number, column: number): string {
  const lines = input.split("\n");
  if (lines.length === 0) return "";

  const targetLineIndex = Math.max(0, Math.min(line - 1, lines.length - 1));
  const start = Math.max(0, targetLineIndex - 2);
  const end = Math.min(lines.length - 1, targetLineIndex + 2);

  const output: string[] = [];
  const maxLineNumLength = String(end + 1).length;

  for (let i = start; i <= end; i++) {
    const lineNum = String(i + 1).padStart(maxLineNumLength, " ");
    const isTarget = i === targetLineIndex;
    const prefix = isTarget ? "> " : "  ";
    output.push(`${prefix}${lineNum} | ${lines[i]}`);
    if (isTarget) {
      const colPointer = Math.max(1, Math.min(column, (lines[i]?.length ?? 0) + 1));
      const pointerIndent = " ".repeat(prefix.length + maxLineNumLength + 3 + (colPointer - 1));
      output.push(`${pointerIndent}^`);
    }
  }

  return output.join("\n");
}

/**
 * Extracts line, column, and context from a JSON parsing error
 */
export function extractJsonError(err: unknown, input: string): FormatError {
  const message = err instanceof Error ? err.message : String(err);
  let line: number | undefined;
  let column: number | undefined;

  // Pattern 1: "... at line 2 column 5" (Firefox / Node / modern V8)
  const lineColMatch = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
  if (lineColMatch) {
    line = parseInt(lineColMatch[1], 10);
    column = parseInt(lineColMatch[2], 10);
  }

  // Pattern 2: "... at position 123"
  if (line === undefined || column === undefined) {
    const posMatch = message.match(/position\s+(\d+)/i);
    if (posMatch) {
      const pos = parseInt(posMatch[1], 10);
      const safePos = Math.max(0, Math.min(pos, input.length));
      const before = input.slice(0, safePos);
      const lines = before.split("\n");
      line = lines.length;
      column = lines[lines.length - 1].length + 1;
    }
  }

  // Pattern 3: V8 context snippet: ...<snippet> is not valid JSON
  if (line === undefined || column === undefined) {
    const snippetMatch = message.match(/\.\.\.([\s\S]+)\s*is not valid JSON/i);
    if (snippetMatch) {
      let context = snippetMatch[1].trim();
      if (context.endsWith('"')) context = context.slice(0, -1);
      if (context.startsWith('"')) context = context.slice(1);
      const pos = input.indexOf(context);
      if (pos !== -1) {
        let targetPos = pos;
        const tokenMatch = message.match(/Unexpected token '([^']+)'/i);
        if (tokenMatch) {
          const tokenStr = tokenMatch[1];
          const tokenOffset = context.lastIndexOf(tokenStr);
          if (tokenOffset !== -1) {
            targetPos = pos + tokenOffset;
          }
        }
        const before = input.slice(0, targetPos);
        const lines = before.split("\n");
        line = lines.length;
        column = lines[lines.length - 1].length + 1;
      }
    }
  }


  // Fallback: if we still don't have line/column, scan input to find where it breaks
  if (line === undefined || column === undefined) {
    const trimmed = input.trim();
    if (!trimmed) {
      return { message: "Input is empty", line: 1, column: 1 };
    }
    // Check unmatched braces/brackets/quotes
    let openBrace = 0;
    let openBracket = 0;
    let inQuote = false;
    let lastNonWhitespacePos = 0;

    for (let i = 0; i < input.length; i++) {
      const c = input[i];
      if (c === '"' && (i === 0 || input[i - 1] !== "\\")) {
        inQuote = !inQuote;
      }
      if (!inQuote) {
        if (c === "{") openBrace++;
        else if (c === "}") openBrace--;
        else if (c === "[") openBracket++;
        else if (c === "]") openBracket--;
      }
      if (!/\s/.test(c)) {
        lastNonWhitespacePos = i;
      }
    }

    const targetPos = inQuote || openBrace !== 0 || openBracket !== 0 ? lastNonWhitespacePos : 0;
    const before = input.slice(0, targetPos);
    const lines = before.split("\n");
    line = lines.length;
    column = lines[lines.length - 1].length + 1;
  }

  const snippet = generateErrorSnippet(input, line, column);

  // Clean user-friendly message
  const userMessage = message
    .replace(/^JSON\.parse:\s*/i, "")
    .replace(/^SyntaxError:\s*/i, "")
    .trim();

  return {
    message: userMessage || "Invalid JSON syntax",
    line,
    column,
    snippet,
  };
}

/**
 * Escapes non-ASCII characters to \uXXXX
 */
export function escapeUnicode(str: string): string {
  return str.replace(/[\u007f-\uffff]/g, (c) => {
    return "\\u" + ("0000" + c.charCodeAt(0).toString(16)).slice(-4);
  });
}

/**
 * Formats a JSON string with options
 */
export function formatJson(input: string, options: JsonFormatOptions): FormatResult {
  const trimmed = input.trim();

  if (!trimmed) {
    return {
      success: true,
      output: "",
      stats: calculateStats(input, ""),
    };
  }

  let parsed: unknown;
  let parseError: unknown = null;

  // Step 1: Attempt strict JSON.parse
  try {
    parsed = JSON.parse(input);
  } catch (err) {
    parseError = err;
  }

  // Step 2: If strict failed and lenient is enabled, attempt auto-repair
  if (parseError !== null) {
    if (options.lenient) {
      try {
        const repaired = repairJson(input);
        parsed = JSON.parse(repaired);
        parseError = null; // Successfully repaired!
      } catch {
        // Keep original strict error for accurate location in original text
      }
    }
  }

  if (parseError !== null) {
    return {
      success: false,
      output: "",
      error: extractJsonError(parseError, input),
      stats: calculateStats(input, ""),
    };
  }

  // Step 3: Sort keys if requested
  if (options.sortKeys) {
    parsed = sortKeysDeep(parsed);
  }

  // Step 4: Stringify with chosen indentation
  let formatted = "";
  if (options.indent === "minify") {
    formatted = JSON.stringify(parsed);
  } else {
    const space = options.indent === "tab" ? "\t" : parseInt(options.indent, 10);
    formatted = JSON.stringify(parsed, null, space);
  }

  // Step 5: Escape Unicode if requested
  if (options.escapeUnicode) {
    formatted = escapeUnicode(formatted);
  }

  return {
    success: true,
    output: formatted,
    stats: calculateStats(input, formatted),
  };
}
