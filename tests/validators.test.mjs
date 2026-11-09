import assert from "node:assert/strict";
import test from "node:test";
import {
  MAX_VALIDATION_LENGTH,
  validateCode,
} from "../src/modules/validators/validate-code.ts";
import { LANGUAGE_SAMPLES } from "../src/modules/formatters/samples.ts";

const valid = {
  json: '{"name":"WebTools","active":true}',
  yaml: "name: WebTools\nactive: true\n",
  toml: '[app]\nname = "WebTools"\n',
  sql: "SELECT id, name FROM users WHERE active = 1;",
  xml: '<?xml version="1.0"?><root><item id="1">Hello</item></root>',
  html: '<main><h1>WebTools</h1><input type="text"><p>Hello</p></main>',
  css: ":root { --brand: blue; } .card { display: flex; color: var(--brand); gap: 1rem; }",
  javascript: "export const greet = (name) => `Hi ${name}`;",
  typescript:
    "interface User { name: string } const user: User = { name: 'Ada' };",
  markdown: "# WebTools\n\nA helpful paragraph.\n",
};

const invalid = {
  json: '{"name":"WebTools",}',
  yaml: "name: one\nname: two\n",
  toml: 'name = "one"\nname = "two"',
  sql: "SELECT * FROM WHERE;",
  xml: "<root>\n<item></root>",
  html: "<main>\n<span>Hello</main>",
  css: ".card { color: not-a-color; }",
  javascript: "const answer = ;",
  typescript: "interface User { name: }",
};

for (const [language, source] of Object.entries(valid)) {
  test(`${language}: valid input passes`, async () => {
    const result = await validateCode(source, language);
    assert.equal(result.status, "valid", JSON.stringify(result));
    assert.deepEqual(result.issues, []);
  });
}

for (const [language, source] of Object.entries(invalid)) {
  test(`${language}: invalid input reports an error and location`, async () => {
    const result = await validateCode(source, language);
    assert.equal(result.status, "invalid", JSON.stringify(result));
    const issue = result.issues.find((issue) => issue.severity === "error");
    assert.ok(issue?.message);
    assert.ok(issue.line >= 1, JSON.stringify(issue));
    assert.ok(issue.column >= 1, JSON.stringify(issue));
    assert.match(issue.snippet, /\^/);
  });
}

test("all formatter samples can be validated", async () => {
  for (const [language, samples] of Object.entries(LANGUAGE_SAMPLES)) {
    for (const sample of samples) {
      const result = await validateCode(sample.content, language);
      assert.equal(
        result.status,
        "valid",
        `${sample.id}: ${JSON.stringify(result)}`,
      );
    }
  }
});

test("JSON validation never repairs malformed input", async () => {
  for (const source of [
    "{foo: 1}",
    "{'foo': 1}",
    '{"x":1,}',
    '// comment\n{"x":1}',
  ]) {
    assert.equal((await validateCode(source, "json")).status, "invalid");
  }
});

test("YAML validates every document and allows unresolved custom tags as warnings", async () => {
  assert.equal(
    (await validateCode("name: first\n---\nname: second\n", "yaml")).status,
    "valid",
  );
  const result = await validateCode(
    "name: first\n---\nname: second\nname: third",
    "yaml",
  );
  assert.equal(result.status, "invalid");
  assert.equal(result.issues[0].line, 4);
  const tagged = await validateCode("value: !custom hello", "yaml");
  assert.equal(tagged.status, "valid");
  assert.equal(tagged.issues[0].severity, "warning");
});

test("SQL checks the selected dialect and reports malformed queries", async () => {
  for (const dialect of ["MySQL", "PostgreSQL", "SQLite"]) {
    assert.equal(
      (await validateCode(valid.sql, "sql", dialect)).status,
      "valid",
    );
    assert.equal(
      (await validateCode(invalid.sql, "sql", dialect)).status,
      "invalid",
    );
  }
  assert.equal(
    (await validateCode("SELECT `name` FROM `users`;", "sql", "MySQL")).status,
    "valid",
  );
  assert.equal(
    (await validateCode("SELECT id::text FROM users;", "sql", "PostgreSQL"))
      .status,
    "valid",
  );
});

test("HTML detects duplicate IDs and attributes and supports fragments", async () => {
  for (const source of [
    '<div id="same"></div><span id="same"></span>',
    '<div class="one" class="two"></div>',
  ]) {
    assert.ok((await validateCode(source, "html")).issues.length > 0);
  }
  assert.equal((await validateCode("<p>Hello</p>", "html")).status, "valid");
});

test("XML rejects multiple roots, unknown entities, duplicate attributes, and unbound namespaces", async () => {
  for (const source of [
    "<a/><b/>",
    "<root>&bad;</root>",
    '<root a="1" a="2"/>',
    "<unknown:root/>",
  ]) {
    assert.equal((await validateCode(source, "xml")).status, "invalid", source);
  }
  assert.equal(
    (
      await validateCode(
        '<root xmlns:x="urn:test"><x:item>&amp;</x:item></root>',
        "xml",
      )
    ).status,
    "valid",
  );
});

test("CSS checks unclosed blocks, malformed declarations, custom properties, and unknown properties", async () => {
  for (const source of [
    "a { color: red;",
    "a { color red; }",
    "a { width: bananas; }",
  ]) {
    assert.equal((await validateCode(source, "css")).status, "invalid", source);
  }
  const unknown = await validateCode("a { future-property: anything; }", "css");
  assert.equal(unknown.status, "valid");
  assert.equal(unknown.issues[0].severity, "warning");
});

test("JavaScript supports JSX and recovery errors without executing code", async () => {
  assert.equal(
    (await validateCode("const view = <div>Hello</div>;", "javascript")).status,
    "valid",
  );
  assert.equal(
    (await validateCode("const x = 1; const x = 2;", "javascript")).status,
    "invalid",
  );
  const result = await validateCode(
    'throw new Error("must not execute");',
    "javascript",
  );
  assert.equal(result.status, "valid");
});

test("TypeScript reports syntax, without claiming to type check", async () => {
  assert.equal(
    (await validateCode("const count: number = 'text';", "typescript")).status,
    "valid",
  );
  const result = await validateCode("const count: = 1;", "typescript");
  assert.equal(result.status, "invalid");
  assert.equal(result.issues[0].column, 14);
});

test("Markdown reports lint warnings, including undefined references", async () => {
  const result = await validateCode(
    "# Hello\n\n[missing][unknown]\n",
    "markdown",
  );
  assert.equal(result.status, "valid");
  assert.ok(
    result.issues.some(
      (issue) =>
        issue.severity === "warning" &&
        issue.rule === "no-undefined-references" &&
        issue.line === 3,
    ),
  );
});

test("empty input is idle; oversized input is not reported as invalid syntax", async () => {
  for (const language of Object.keys(valid))
    assert.deepEqual(await validateCode(" \n\t", language), {
      status: "empty",
      issues: [],
    });
  const result = await validateCode(
    "a".repeat(MAX_VALIDATION_LENGTH + 1),
    "json",
  );
  assert.equal(result.status, "unavailable");
  assert.match(result.issues[0].message, /200,000/);
  assert.equal((await validateCode(valid.json, "json")).status, "valid");
});
