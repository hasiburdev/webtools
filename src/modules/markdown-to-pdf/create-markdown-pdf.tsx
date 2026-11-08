import type { ReactNode } from "react";
import { Document, Link, Page, Text, View, pdf } from "@react-pdf/renderer";
import { Lexer, type MarkedToken, type Token } from "marked";
import { decodeHTML } from "entities";
import { documentThemes, MAX_MARKDOWN_LENGTH, safeLink, type MarkdownPdfOptions } from "./settings";

function MarkdownDocument({ markdown, options }: { markdown: string; options: MarkdownPdfOptions }) {
  const theme = documentThemes[options.theme];
  const size = options.fontSize;

  function inline(tokens: Token[]): ReactNode[] {
    return tokens.map((item, index) => {
      const token = item as MarkedToken;
      switch (token.type) {
        case "strong": return <Text key={index} style={{ fontWeight: "bold" }}>{inline(token.tokens)}</Text>;
        case "em": return <Text key={index} style={{ fontStyle: "italic" }}>{inline(token.tokens)}</Text>;
        case "del": return <Text key={index} style={{ textDecoration: "line-through" }}>{inline(token.tokens)}</Text>;
        case "codespan": return <Text key={index} style={{ fontFamily: "Courier", fontSize: size * 0.88, backgroundColor: theme.soft }}>{token.text}</Text>;
        case "link": {
          const href = safeLink(decodeHTML(token.href));
          return href ? <Link key={index} src={href} style={{ color: theme.accent }}>{inline(token.tokens)}</Link> : <Text key={index}>{inline(token.tokens)}</Text>;
        }
        case "image": return <Text key={index} style={{ fontStyle: "italic", color: theme.accent }}>[Image: {decodeHTML(token.text || "Untitled")}]</Text>;
        case "br": return "\n";
        case "escape": return token.text;
        case "text": return token.tokens ? <Text key={index}>{inline(token.tokens)}</Text> : decodeHTML(token.text);
        case "html": return token.text;
        default: return "text" in token ? decodeHTML(String(token.text)) : "";
      }
    });
  }

  function blocks(tokens: Token[], depth = 0): ReactNode[] {
    if (depth > 20) throw new Error("This document has too many nested blocks. Simplify nested lists or quotes.");
    return tokens.map((item, index) => {
      const token = item as MarkedToken;
      switch (token.type) {
        case "space": case "def": return null;
        case "heading": return <Text key={index} minPresenceAhead={size * 3} style={{ fontSize: [27, 20, 15, 13, 12, 11][token.depth - 1], fontWeight: "bold", color: theme.accent, marginTop: token.depth === 1 ? 0 : 14, marginBottom: 9, lineHeight: 1.2 }}>{inline(token.tokens)}</Text>;
        case "paragraph": case "text": return <Text key={index} orphans={2} widows={2} style={{ marginBottom: 10 }}>{token.tokens ? inline(token.tokens) : decodeHTML(token.text)}</Text>;
        case "blockquote": return <View key={index} style={{ borderLeftWidth: 3, borderLeftColor: theme.accent, backgroundColor: theme.soft, padding: 12, paddingBottom: 2, marginBottom: 12 }}>{blocks(token.tokens, depth + 1)}</View>;
        case "code": return <Text key={index} style={{ fontFamily: "Courier", fontSize: size * 0.82, lineHeight: 1.5, backgroundColor: theme.soft, padding: 12, marginBottom: 12 }}>{token.text.replace(/\t/g, "    ")}</Text>;
        case "hr": return <View key={index} style={{ borderBottomWidth: 1, borderBottomColor: theme.border, marginTop: 10, marginBottom: 18 }} />;
        case "list": return <View key={index} style={{ marginBottom: 8 }}>{token.items.map((entry, entryIndex) => <View key={entryIndex} style={{ flexDirection: "row", paddingLeft: 4 }}>
          <Text style={{ width: entry.task ? 28 : 24, flexShrink: 0 }}>{entry.task ? (entry.checked ? "[x]" : "[ ]") : token.ordered ? `${Number(token.start) + entryIndex}.` : "•"}</Text>
          <View style={{ flexGrow: 1, flexShrink: 1 }}>{blocks(entry.tokens, depth + 1)}</View>
        </View>)}</View>;
        case "table": return <View key={index} style={{ marginBottom: 14, borderTopWidth: 1, borderLeftWidth: 1, borderColor: theme.border }}>
          {[token.header, ...token.rows].map((row, rowIndex) => <View key={rowIndex} style={{ flexDirection: "row", backgroundColor: rowIndex === 0 || rowIndex % 2 === 0 ? theme.soft : theme.paper }}>
            {row.map((cell, cellIndex) => <View key={cellIndex} style={{ width: `${100 / token.header.length}%`, borderRightWidth: 1, borderBottomWidth: 1, borderColor: theme.border, padding: 7 }}>
              <Text style={{ fontSize: size * 0.9, fontWeight: rowIndex === 0 ? "bold" : "normal", textAlign: token.align[cellIndex] || "left" }}>{inline(cell.tokens)}</Text>
            </View>)}
          </View>)}
        </View>;
        case "html": return <Text key={index} style={{ marginBottom: 10 }}>{token.text}</Text>;
        default: return null;
      }
    });
  }

  return <Document title="Markdown document" creator="WebTools">
    <Page size={options.pageSize} wrap style={{ fontFamily: theme.font, fontSize: size, lineHeight: 1.6, color: theme.ink, backgroundColor: theme.paper, paddingTop: 44, paddingHorizontal: 44, paddingBottom: 54 }}>
      {blocks(Lexer.lex(markdown, { gfm: true }))}
    </Page>
  </Document>;
}

// Serialize renders: the renderer shares a reconciler across PDF instances.
let renderQueue: Promise<unknown> = Promise.resolve();

export function createMarkdownPdf(markdown: string, options: MarkdownPdfOptions): Promise<Blob> {
  if (!markdown.trim()) return Promise.reject(new Error("Write or upload some Markdown first."));
  if (markdown.length > MAX_MARKDOWN_LENGTH) return Promise.reject(new Error("Keep your document below 100,000 characters."));
  const result = renderQueue.then(() => pdf(<MarkdownDocument markdown={markdown} options={options} />).toBlob());
  renderQueue = result.catch(() => undefined);
  return result;
}
