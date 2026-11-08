import assert from "node:assert/strict";
import test from "node:test";
import { encodeCanvas, readLocalImage } from "../src/lib/browser-images.ts";

test("unsupported and oversized uploads fail before allocating an image URL", async () => {
  await assert.rejects(readLocalImage(new File(["text"], "notes.txt", { type: "text/plain" })), /PNG, JPEG, or WebP/);
  await assert.rejects(readLocalImage({ type: "image/png", size: 31 * 1024 * 1024 }), /30 MB/);
});

test("decoded image limits and decode failures release the allocated object URL", async (context) => {
  const revoke = context.mock.method(URL, "revokeObjectURL", () => {});
  let mode = "oversized";
  const original = Object.getOwnPropertyDescriptor(globalThis, "Image");
  Object.defineProperty(globalThis, "Image", { configurable: true, value: class {
    naturalWidth = 10000;
    naturalHeight = 10000;
    set src(value) {
      this.url = value;
      queueMicrotask(() => mode === "corrupt" ? this.onerror() : this.onload());
    }
  } });
  try {
    const file = new File(["image"], "sample.png", { type: "image/png" });
    await assert.rejects(readLocalImage(file), /too large/);
    assert.equal(revoke.mock.callCount(), 1);
    mode = "corrupt";
    await assert.rejects(readLocalImage(file), /could not be read/);
    assert.equal(revoke.mock.callCount(), 2);
  } finally {
    if (original) Object.defineProperty(globalThis, "Image", original);
    else delete globalThis.Image;
  }
});

test("an unsupported output format fails instead of downloading a mislabeled PNG", async () => {
  const pngFallback = { toBlob(callback) { callback(new Blob(["png"], { type: "image/png" })); } };
  await assert.rejects(encodeCanvas(pngFallback, "image/webp", 0.8), /cannot export this format/);
  const failedCanvas = { toBlob(callback) { callback(null); } };
  await assert.rejects(encodeCanvas(failedCanvas, "image/jpeg", 0.8), /export failed/);
});
