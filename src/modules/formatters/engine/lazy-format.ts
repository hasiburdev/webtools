import { calculateStats, generateErrorSnippet } from "../json/format-json";
import type {
  FormatError,
  FormatResult,
  FormatterLanguage,
  UniversalFormatOptions,
} from "../types";

/**
 * Normalizes error messages and extracts line/column information
 */
function normalizeError(err: unknown, input: string): FormatError {
  const message = err instanceof Error ? err.message : String(err);
  let line: number | undefined;
  let column: number | undefined;

  // 1. Prettier syntax error format: (line:col) or error.loc
  if (err && typeof err === "object") {
    const anyErr = err as Record<string, unknown>;
    if (anyErr.loc && typeof anyErr.loc === "object") {
      const loc = anyErr.loc as Record<string, unknown>;
      if (loc.start && typeof loc.start === "object") {
        const start = loc.start as Record<string, unknown>;
        if (typeof start.line === "number") line = start.line;
        if (typeof start.column === "number") column = start.column;
      }
    }
    // YAML error linePos
    if (Array.isArray(anyErr.linePos) && anyErr.linePos[0]) {
      const lp = anyErr.linePos[0] as { line?: number; col?: number };
      if (typeof lp.line === "number") line = lp.line;
      if (typeof lp.col === "number") column = lp.col;
    }
  }

  // 2. Regex fallback for (line:col) or line X column Y
  if (line === undefined) {
    const match = message.match(/\((\d+):(\d+)\)/);
    if (match) {
      line = parseInt(match[1], 10);
      column = parseInt(match[2], 10);
    }
  }

  if (line === undefined) {
    const match = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (match) {
      line = parseInt(match[1], 10);
      column = parseInt(match[2], 10);
    }
  }

  if (line === undefined) {
    const match = message.match(/at line (\d+)/i);
    if (match) {
      line = parseInt(match[1], 10);
      column = 1;
    }
  }

  const cleanMessage = message
    .replace(/^SyntaxError:\s*/i, "")
    .replace(/^YAMLParseError:\s*/i, "")
    .trim();

  const snippet =
    line !== undefined ? generateErrorSnippet(input, line, column ?? 1) : undefined;

  return {
    message: cleanMessage || "Formatting syntax error",
    line,
    column,
    snippet,
  };
}

/**
 * Lazy loads the appropriate formatter library and executes formatting.
 * Keeps initial bundle size tiny by fetching packages only on-demand!
 */
export async function formatCode(
  input: string,
  language: FormatterLanguage,
  options: UniversalFormatOptions,
): Promise<FormatResult> {
  const trimmed = input.trim();
  if (!trimmed) {
    return {
      success: true,
      output: "",
      stats: calculateStats(input, ""),
    };
  }

  const tabWidth = options.indent === "4" ? 4 : 2;
  const useTabs = options.indent === "tab";
  const indentString = options.indent === "4" ? "    " : options.indent === "tab" ? "\t" : "  ";

  try {
    let output = "";

    switch (language) {
      case "json": {
        const { formatJson } = await import("../json/format-json");
        return formatJson(input, options);
      }

      case "yaml": {
        const YAML = await import("yaml");
        const parsed = YAML.parse(input);
        output = YAML.stringify(parsed, {
          indent: tabWidth,
          sortMapEntries: options.sortKeys,
        });
        break;
      }

      case "toml": {
        const TOML = await import("smol-toml");
        const parsed = TOML.parse(input);
        output = TOML.stringify(parsed);
        break;
      }

      case "sql": {
        const { format: formatSql } = await import("sql-formatter");
        output = formatSql(input, {
          tabWidth,
          useTabs,
          keywordCase: options.sqlKeywordCase || "upper",
        });
        break;
      }

      case "xml": {
        const xmlFormatModule = await import("xml-formatter");
        const xmlFormat = xmlFormatModule.default || xmlFormatModule;
        output = xmlFormat(input, {
          indentation: indentString,
          collapseContent: true,
          lineSeparator: "\n",
        });
        break;
      }

      case "html": {
        const prettierModule = await import("prettier/standalone");
        const prettier = prettierModule.default || prettierModule;
        const htmlPlugin = await import("prettier/plugins/html");
        output = await prettier.format(input, {
          parser: "html",
          plugins: [htmlPlugin.default || htmlPlugin],
          tabWidth,
          useTabs,
        });
        break;
      }

      case "css": {
        const prettierModule = await import("prettier/standalone");
        const prettier = prettierModule.default || prettierModule;
        const postcssPlugin = await import("prettier/plugins/postcss");
        output = await prettier.format(input, {
          parser: "css",
          plugins: [postcssPlugin.default || postcssPlugin],
          tabWidth,
          useTabs,
        });
        break;
      }

      case "javascript": {
        const prettierModule = await import("prettier/standalone");
        const prettier = prettierModule.default || prettierModule;
        const babelPlugin = await import("prettier/plugins/babel");
        const estreePlugin = await import("prettier/plugins/estree");
        output = await prettier.format(input, {
          parser: "babel",
          plugins: [babelPlugin.default || babelPlugin, estreePlugin.default || estreePlugin],
          tabWidth,
          useTabs,
          semi: options.semi ?? true,
          singleQuote: options.singleQuote ?? false,
        });
        break;
      }

      case "typescript": {
        const prettierModule = await import("prettier/standalone");
        const prettier = prettierModule.default || prettierModule;
        const tsPlugin = await import("prettier/plugins/typescript");
        const estreePlugin = await import("prettier/plugins/estree");
        output = await prettier.format(input, {
          parser: "typescript",
          plugins: [tsPlugin.default || tsPlugin, estreePlugin.default || estreePlugin],
          tabWidth,
          useTabs,
          semi: options.semi ?? true,
          singleQuote: options.singleQuote ?? false,
        });
        break;
      }

      case "markdown": {
        const prettierModule = await import("prettier/standalone");
        const prettier = prettierModule.default || prettierModule;
        const mdPlugin = await import("prettier/plugins/markdown");
        output = await prettier.format(input, {
          parser: "markdown",
          plugins: [mdPlugin.default || mdPlugin],
          tabWidth,
          useTabs,
        });
        break;
      }

      default: {
        output = input;
      }
    }

    return {
      success: true,
      output,
      stats: calculateStats(input, output),
    };
  } catch (err) {
    return {
      success: false,
      output: "",
      error: normalizeError(err, input),
      stats: calculateStats(input, ""),
    };
  }
}
