import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";
import { PDFDocument, PDFName, PDFString } from "pdf-lib";
import { documentThemes, pdfFilename, safeLink, sampleMarkdown } from "../src/modules/markdown-to-pdf/settings.ts";

// Node strips TypeScript but not TSX. Compile the real renderer in memory so
// these checks exercise PDF output without a browser or a generated test file.
const sourceUrl = new URL("../src/modules/markdown-to-pdf/create-markdown-pdf.tsx", import.meta.url);
const source = await readFile(sourceUrl, "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { jsx: ts.JsxEmit.ReactJSX, module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2020 },
}).outputText.replace(/from "([^"]+)"/g, (_, specifier) => {
  const resolved = specifier.startsWith(".") ? new URL(`${specifier}.ts`, sourceUrl).href : import.meta.resolve(specifier);
  return `from ${JSON.stringify(resolved)}`;
});
const { createMarkdownPdf } = await import(`data:text/javascript;base64,${Buffer.from(compiled).toString("base64")}`);

test("all document themes generate valid A4 PDFs with content", async () => {
  for (const theme of Object.keys(documentThemes)) {
    const blob = await createMarkdownPdf(sampleMarkdown, { theme, pageSize: "A4", fontSize: 11 });
    assert.equal(blob.type, "application/pdf");
    const document = await PDFDocument.load(await blob.arrayBuffer());
    assert.ok(document.getPageCount() >= 1);
    assert.ok(Math.abs(document.getPage(0).getWidth() - 595.28) < 0.1);
    assert.ok(document.getPage(0).node.Contents());
  }
});

test("long documents paginate on Letter paper, including nested lists and long code", async () => {
  const markdown = `# Long document\n\n${"A paragraph with **emphasis**, &amp; entities.\n\n".repeat(110)}\n1. Parent\n   - Nested child\n\n\`\`\`\n${"a".repeat(350)}\n\`\`\``;
  const blob = await createMarkdownPdf(markdown, { theme: "modern", pageSize: "LETTER", fontSize: 12 });
  const document = await PDFDocument.load(await blob.arrayBuffer());
  assert.ok(document.getPageCount() > 2);
  for (const page of document.getPages()) {
    assert.equal(page.getWidth(), 612);
    assert.equal(page.getHeight(), 792);
  }
});

test("unsafe Markdown links never become PDF actions", async () => {
  const blob = await createMarkdownPdf("[safe](https://example.com) [unsafe](javascript:alert%281%29) ![local alt](https://example.com/tracker.png)", { theme: "minimal", pageSize: "A4", fontSize: 10 });
  const document = await PDFDocument.load(await blob.arrayBuffer());
  const destinations = [];
  for (const page of document.getPages()) {
    const annotations = page.node.Annots();
    for (let index = 0; index < (annotations?.size() ?? 0); index++) {
      const annotation = document.context.lookup(annotations.get(index));
      const action = annotation.lookup(PDFName.of("A"));
      if (action) destinations.push(action.lookup(PDFName.of("URI"), PDFString).decodeText());
    }
  }
  assert.deepEqual(destinations, ["https://example.com"]);
});

test("empty and oversized input fail without preventing later PDF generation", async () => {
  const options = { theme: "modern", pageSize: "A4", fontSize: 11 };
  await assert.rejects(createMarkdownPdf("  ", options), /Markdown first/);
  await assert.rejects(createMarkdownPdf("a".repeat(100_001), options), /100,000/);
  assert.ok((await createMarkdownPdf("# Recovered", options)).size > 0);
});

test("download names and link destinations are safe and predictable", () => {
  assert.equal(pdfFilename("notes.markdown"), "notes.pdf");
  assert.equal(pdfFilename("draft.pdf"), "draft.pdf");
  assert.equal(pdfFilename("<>:/\\|?*"), "document.pdf");
  assert.equal(safeLink("mailto:hello@example.com"), "mailto:hello@example.com");
  for (const value of ["javascript:alert(1)", "data:text/html,hello", "file:///tmp/test", "/relative"]) assert.equal(safeLink(value), undefined);
});
