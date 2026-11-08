import assert from "node:assert/strict";
import test from "node:test";
import { calculatePdfLayout } from "../src/modules/image-to-pdf/pdf-layout.ts";

test("fixed pages preserve the image ratio, fit within margins, and center the image", () => {
  for (const size of ["a4", "letter"]) {
    for (const orientation of ["portrait", "landscape"]) {
      for (const [width, height] of [[1920, 1080], [400, 3000], [16000, 10], [10, 16000]]) {
        for (const margin of [0, 18, 36]) {
          const layout = calculatePdfLayout(width, height, size, orientation, margin);
          assert.ok(Math.abs(layout.width / layout.height - width / height) < 1e-6);
          assert.ok(layout.x >= margin - 1e-6);
          assert.ok(layout.y >= margin - 1e-6);
          assert.ok(layout.x + layout.width <= layout.pageWidth - margin + 1e-6);
          assert.ok(layout.y + layout.height <= layout.pageHeight - margin + 1e-6);
          assert.ok(Math.abs(layout.x * 2 + layout.width - layout.pageWidth) < 1e-6);
          assert.ok(Math.abs(layout.y * 2 + layout.height - layout.pageHeight) < 1e-6);
        }
      }
    }
  }
});

test("A4 and Letter dimensions use PDF points and landscape swaps the axes", () => {
  for (const [size, expected] of [["a4", [595.28, 841.89]], ["letter", [612, 792]]]) {
    const portrait = calculatePdfLayout(100, 100, size, "portrait", 0);
    const landscape = calculatePdfLayout(100, 100, size, "landscape", 0);
    assert.deepEqual([portrait.pageWidth, portrait.pageHeight], expected);
    assert.deepEqual([landscape.pageHeight, landscape.pageWidth], expected);
  }
});

test("fit-to-image sizing uses 96 dpi and adds margins without changing the image size", () => {
  const layout = calculatePdfLayout(800, 400, "fit", "landscape", 18);
  assert.deepEqual(layout, { pageWidth: 636, pageHeight: 336, x: 18, y: 18, width: 600, height: 300 });
});

test("invalid dimensions and unusable margins fail explicitly", () => {
  for (const value of [0, -1, NaN, Infinity]) {
    assert.throws(() => calculatePdfLayout(value, 100, "a4", "portrait", 18));
    assert.throws(() => calculatePdfLayout(100, value, "a4", "portrait", 18));
  }
  for (const margin of [-1, NaN, Infinity, 400]) {
    assert.throws(() => calculatePdfLayout(100, 100, "letter", "portrait", margin));
  }
});
