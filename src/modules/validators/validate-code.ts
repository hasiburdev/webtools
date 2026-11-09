import type {
  SqlDialect,
  ValidationIssue,
  ValidationResult,
  ValidatorLanguage,
} from "./types";

export const MAX_VALIDATION_LENGTH = 200_000;
export const SQL_DIALECTS: SqlDialect[] = ["MySQL", "PostgreSQL", "SQLite"];

function issueAt(
  message: string,
  line?: number,
  column?: number,
  severity: ValidationIssue["severity"] = "error",
  rule?: string,
): ValidationIssue {
  return { message, severity, line, column, rule };
}

function withSnippet(issue: ValidationIssue, lines: string[]): ValidationIssue {
  const { line, column } = issue;
  let snippet: string | undefined;
  if (line !== undefined) {
    const start = Math.max(0, line - 2);
    snippet = lines
      .slice(start, line + 1)
      .map((text, index) => {
        const current = start + index + 1;
        // Bound excerpts for minified files and retain the area around the error.
        const offset = current === line ? Math.max(0, (column ?? 1) - 81) : 0;
        const excerpt = `${offset ? "…" : ""}${text.slice(offset, offset + 240)}${text.length > offset + 240 ? "…" : ""}`;
        const prefix = `${current === line ? ">" : " "} ${current} | `;
        return `${prefix}${excerpt}${current === line ? `\n${" ".repeat(prefix.length + Math.min(240, Math.max(0, (column ?? 1) - 1 - offset)) + (offset ? 1 : 0))}^` : ""}`;
      })
      .join("\n");
  }
  return { ...issue, snippet };
}

function syntaxIssue(
  error: unknown,
  input: string,
  language: ValidatorLanguage,
): ValidationIssue {
  const err = error as {
    message?: string;
    line?: number;
    column?: number;
    loc?: {
      line?: number;
      column?: number;
      start?: { line: number; column: number };
    };
    location?: { start?: { line: number; column: number } };
    linePos?: { line: number; col: number }[];
  };
  const message = err?.message ?? String(error);
  let line =
    err?.linePos?.[0]?.line ??
    err?.location?.start?.line ??
    err?.loc?.start?.line ??
    err?.loc?.line ??
    err?.line;
  let column =
    err?.linePos?.[0]?.col ??
    err?.location?.start?.column ??
    err?.loc?.start?.column ??
    err?.loc?.column ??
    err?.column;
  if (
    (language === "javascript" || language === "typescript") &&
    column !== undefined
  )
    column += 1;
  if (line === undefined) {
    const match = message.match(/line\s+(\d+)\s+column\s+(\d+)/i);
    if (match) {
      line = Number(match[1]);
      column = Number(match[2]);
    }
  }
  if (line === undefined && language === "json") {
    const position = message.match(/position\s+(\d+)/i);
    const offset = position
      ? Number(position[1])
      : /end of JSON/i.test(message)
        ? input.length
        : undefined;
    if (offset !== undefined) {
      const before = input.slice(0, offset).split("\n");
      line = before.length;
      column = before[before.length - 1].length + 1;
    }
  }
  return issueAt(message, line, column);
}

/** Load only the selected language's parser; never evaluate user code. */
export async function validateCode(
  input: string,
  language: ValidatorLanguage,
  dialect: SqlDialect = "MySQL",
): Promise<ValidationResult> {
  if (!input.trim()) return { status: "empty", issues: [] };
  if (input.length > MAX_VALIDATION_LENGTH)
    return {
      status: "unavailable",
      issues: [
        {
          severity: "error",
          message:
            "Use 200,000 characters or fewer to validate in your browser.",
        },
      ],
    };

  const issues: ValidationIssue[] = [];
  // Separate loading failures from invalid source text.
  let check: () => void | Promise<void>;
  try {
    switch (language) {
      case "json":
        check = () => {
          JSON.parse(input);
        };
        break;
      case "yaml": {
        const { LineCounter, parseAllDocuments } = await import("yaml");
        check = () => {
          const lineCounter = new LineCounter();
          for (const document of parseAllDocuments(input, {
            lineCounter,
            prettyErrors: false,
            uniqueKeys: true,
          })) {
            for (const error of [...document.errors, ...document.warnings]) {
              const position = lineCounter.linePos(error.pos[0]);
              issues.push(
                issueAt(
                  error.message,
                  position.line,
                  position.col,
                  document.errors.includes(error) ? "error" : "warning",
                ),
              );
            }
          }
        };
        break;
      }
      case "toml": {
        const { parse } = await import("smol-toml");
        check = () => {
          parse(input);
        };
        break;
      }
      case "sql": {
        const parserModule =
          dialect === "PostgreSQL"
            ? await import("node-sql-parser/build/postgresql.js")
            : dialect === "SQLite"
              ? await import("node-sql-parser/build/sqlite.js")
              : await import("node-sql-parser/build/mysql.js");
        const { Parser } = parserModule.default ?? parserModule;
        const parser = new Parser();
        check = () => {
          parser.astify(input, { database: dialect });
        };
        break;
      }
      case "xml": {
        const { SaxesParser } = await import("saxes");
        check = () => {
          const parser = new SaxesParser({ xmlns: true });
          parser.on("error", (error) => {
            issues.push(
              issueAt(
                error.message.replace(/^\d+:\d+:\s*/, ""),
                parser.line,
                Math.max(1, parser.column),
              ),
            );
          });
          parser.write(input).close();
        };
        break;
      }
      case "html": {
        const hintModule = await import("htmlhint");
        const { HTMLHint } = hintModule.default ?? hintModule;
        check = () => {
          const hints = HTMLHint.verify(input, {
            "tag-pair": true,
            "attr-no-duplication": true,
            "id-unique": true,
            "attr-unsafe-chars": true,
            "tagname-specialchars": true,
          });
          for (const hint of hints)
            issues.push(
              issueAt(
                hint.message,
                hint.line,
                hint.col,
                hint.type === "error" ? "error" : "warning",
                hint.rule.id,
              ),
            );
        };
        break;
      }
      case "css": {
        const [css, prettier, postcss] = await Promise.all([
          import("css-tree"),
          import("prettier/standalone"),
          import("prettier/plugins/postcss"),
        ]);
        check = async () => {
          // PostCSS catches unclosed blocks that CSS's recovery rules allow.
          await prettier.format(input, { parser: "css", plugins: [postcss] });
          const tree = css.parse(input, {
            positions: true,
            onParseError: (error) =>
              issues.push(syntaxIssue(error, input, language)),
          });
          css.walk(tree, {
            visit: "Declaration",
            enter(node) {
              if (node.property.startsWith("--")) return;
              const result = css.lexer.matchProperty(node.property, node.value);
              if (!result.error) return;
              const unsupported = /Unknown property|var\(/i.test(
                result.error.message,
              );
              if (/var\(/i.test(result.error.message)) return;
              issues.push(
                issueAt(
                  `${node.property}: ${result.error.message}`,
                  node.loc?.start.line,
                  node.loc?.start.column,
                  unsupported ? "warning" : "error",
                ),
              );
            },
          });
        };
        break;
      }
      case "javascript":
      case "typescript": {
        const { parse } = await import("@babel/parser");
        check = () => {
          const ast = parse(input, {
            sourceType: "unambiguous",
            plugins: language === "typescript" ? ["typescript"] : ["jsx"],
            errorRecovery: true,
          });
          for (const error of ast.errors)
            issues.push(syntaxIssue(error, input, language));
        };
        break;
      }
      case "markdown": {
        const [{ remark }, { default: recommended }] = await Promise.all([
          import("remark"),
          import("remark-preset-lint-recommended"),
        ]);
        check = async () => {
          const file = await remark().use(recommended).process(input);
          for (const message of file.messages)
            issues.push(
              issueAt(
                message.reason,
                message.line,
                message.column,
                "warning",
                message.ruleId ?? undefined,
              ),
            );
        };
        break;
      }
    }
  } catch {
    return {
      status: "unavailable",
      issues: [
        {
          severity: "error",
          message:
            "The validator could not load. Check your connection and try Validate again.",
        },
      ],
    };
  }

  try {
    await check();
  } catch (error) {
    issues.push(syntaxIssue(error, input, language));
  }
  // Generate bounded excerpts once, rather than splitting the whole input for
  // every diagnostic. The UI shows the first 100; reports retain all messages.
  const lines = input.split("\n");
  return {
    status: issues.some((issue) => issue.severity === "error")
      ? "invalid"
      : "valid",
    issues: issues.map((issue, index) =>
      index < 100 ? withSnippet(issue, lines) : issue,
    ),
  };
}
