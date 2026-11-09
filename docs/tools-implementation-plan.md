# WebTools feature audit and implementation plan

Reviewed against the repository on 2026-11-09. This is a code audit; a live catalog entry means a route and implementation exist, not that every browser flow has been verified.

## Current scope

The catalog now contains **19 tools: 17 live and 2 pending**. The requested SEO checker (sitemap, robots.txt, RSS, Open Graph and meta-tag inspection) has been removed from the catalog, icon registry, and roadmap. Home and About both derive their lists from `src/content/home.ts`, so both reflect the removal. There was no checker route or processing module to remove. Existing page titles and sharing metadata remain in `src/content/seo.ts`.

The previous plan was stale: Validators is implemented, and Markdown to PDF is also live. Neither needs to be built from scratch.

| Tool | Route | Code status |
| --- | --- | --- |
| Password Generator | `/password-generator` | Live |
| Slugify | `/slugify` | Live |
| Image Resizer | `/image-resizer` | Live; reliability and touch gaps below |
| Image Compressor | `/image-compressor` | Live; single image |
| CSV ↔ JSON | `/csv-json-converter` | Live; first 20 rows previewed |
| Color Converter | `/color-converter` | Live |
| Placeholder Thumbnail Generator | `/placeholder-thumbnail-generator` | Live |
| QR Code Generator | `/qr-code-generator` | Live |
| Image to PDF | `/image-to-pdf` | Live |
| Markdown to PDF | `/markdown-to-pdf` | Live |
| PDF to Image | Proposed: `/pdf-to-image` | Pending; disabled card and icon only |
| Video to Audio Converter | Proposed: `/video-to-audio-converter` | Pending; disabled card and icon only |
| URL Encoder/Decoder | `/url-encoder-decoder` | Live |
| Online Color Picker | `/online-color-picker` | Live |
| Image to Base64 Converter | `/image-to-base64-converter` | Live |
| Word Counter | `/word-counter` | Live |
| Color Picker | `/color-picker` | Live |
| Validators | `/validators` | Live; 10 languages |
| Formatters | `/formatters` | Live; 10 languages |

## Confirmed gaps and priority

These gaps are visible in the source. Enhancements from the previous roadmap are distinguished from entire missing tools.

| Priority | Gap | Evidence | Implementation |
| --- | --- | --- | --- |
| P1 | Image Resizer lacks newer upload/export safeguards | `src/modules/image-resizer/image-resizer.tsx` accepts `image/*`, has no decode-error UI or file/pixel budget, uses unrestricted output state and `toDataURL`, and lacks unmount URL cleanup | Share validation and blob export from `src/lib/browser-images.ts`; validate output dimensions before allocating a canvas; add errors, stale-load protection, and cleanup |
| P1 | Mobile crop interaction is incomplete | Resizer canvas uses mouse handlers; numeric crop controls appear after creating a selection | Use Pointer Events and pointer capture; provide keyboard crop creation and numeric adjustments immediately |
| P1 | Mobile menu focus handling is incomplete | `src/components/mobile-menu.tsx` translates the closed panel offscreen but leaves links focusable; no focus trap/restoration | Use the installed Base UI dialog primitive, preserving Escape, scroll locking, focus containment, and return focus |
| P1 | PDF to Image is absent | No route/module or `pdfjs-dist` dependency | Build the PDF.js workflow below |
| P2 | Video to Audio is absent | No route/module or audio conversion engine | Validate a local FFmpeg WASM approach, then implement the workflow below |
| P2 | CSV pagination and reverse nesting are missing | `csv-json-converter.tsx` uses `tableData.slice(0, 20)`; `csv-json-utils.ts` has flattening but no unflattening | Paginate the table; add opt-in nesting with explicit collision rules |
| P2 | Large data processing can block interaction | CSV conversion and language parsing run on the client thread; debounce alone does not offload computation | Establish input budgets and move expensive work into workers with cancellation and stale-result protection |
| P2 | Image Compressor lacks planned batch/ZIP and comparison slider | Current component loads one image through `useLocalImage` and shows two previews | Add a bounded queue, per-file results, cancellation, ZIP export, and an accessible comparison slider |
| P3 | Image to PDF lacks drag reordering | Ordering already works with arrow buttons | Add pointer/keyboard drag reordering, retaining arrows |
| P3 | Validator formatting and Go support from the old roadmap are absent | Validator language list mirrors formatters; no Go parser or format action | Reuse the formatter engine; treat Go as a separate parser project if still wanted |
| P3 | Tool discovery is basic | `src/components/home/tools-list.tsx` renders an unfiltered catalog | Add search, categories, empty results, and optionally local favorites |
| P3 | Browser coverage and contributor docs are limited | Four Node test files; README is still starter text | Add focused browser flows and document actual setup, limits, and deployment |

## Delivery order

Estimates are planning ranges for one developer, including focused verification. Reassess after the media feasibility work; these are not delivery commitments.

### 1. Reliability and accessibility — 2–3 developer days

1. Update Image Resizer while preserving crop/preset behavior. Extract dimension validation; propose output caps of 40 megapixels and 16,384 pixels per side. Validate finite positive integers in code, rather than relying on input `max` attributes.
2. Reuse shared loading/export helpers, extending them for crop regions. Decide and document which existing resizer formats to retain; do not silently drop GIF/BMP/SVG support when adopting the PNG/JPEG/WebP helper. Reject corrupt and unsupported inputs visibly.
3. Revoke source URLs on replacement/unmount, discard stale decodes, clear temporary canvases, and verify blob MIME types match selected formats.
4. Add pointer-based cropping, keyboard crop creation/adjustments, and drawer focus management.
5. Resolve the existing lint baseline: `react-hooks/set-state-in-effect` errors in `src/components/theme-toggle.tsx`, `src/modules/password-generator/password-generator.tsx`, and `src/modules/url-encoder-decoder/url-encoder-decoder.tsx`. Derive URL breakdown from input; subscribe to theme changes; handle password generation lifecycle without suppressing the rule. Remove unused imports reported by lint.

Acceptance: corrupt/oversized images show errors; oversized output cannot allocate a canvas; replacing an image during decoding cannot restore old state; PNG/JPEG/WebP downloads match MIME/extension; touch and keyboard users can crop; closed navigation is absent from tab order and closing restores focus; lint passes without disabling rules.

### 2. PDF to Image — 3–5 developer days

Create `src/app/pdf-to-image/page.tsx` and `src/modules/pdf-to-image/` with a client UI, loader, page-range helpers, export queue, types, and barrel export. Reuse `ToolPage`, buttons, byte formatting, blob downloads, and the existing icon.

1. Add a pinned compatible `pdfjs-dist` dependency and lazy-load it on this tool. Ship its matching worker and required font/CMap/WASM assets on the same origin. Automate copying assets from the installed package so upgrades cannot leave a stale worker.
2. First prove the worker loads from the production static export without a CDN. Open local PDF bytes, display page count, and handle corrupt files/password requests with actionable states.
3. Render the visible page and bounded low-resolution thumbnails. Add current-page, selected-range (`1,3-5`), and all-pages selection with validation.
4. Export PNG/JPEG/WebP with 1×/2× scale and JPEG/WebP quality. Keep exported dimensions independent of device pixel ratio, fill JPEG transparency white, and verify encoder support.
5. Deliver single-page downloads first, then bounded ZIP export using a shared ZIP helper. Render sequentially, release resources, and stop on cancellation/navigation.
6. Proposed initial limits: 30 MB per input, 40 megapixels per rendered page, and 100 selected pages per batch. Add an aggregate output-byte budget because ZIP libraries may retain all blobs. Tune limits using desktop/mobile measurements.
7. Add route metadata and activate the catalog card only after acceptance checks pass.

Acceptance: mixed page sizes/rotations render correctly; invalid ranges fail; filenames use zero-padded page numbers; output dimensions and MIME types match settings; encrypted/corrupt PDFs are handled; cancellation/repeated uploads release resources; the exported site serves every worker asset. Test ordinary, scanned, font-heavy, and large documents across Chromium, Firefox, and Safari.

The approach follows the [official PDF.js examples](https://mozilla.github.io/pdf.js/examples/): page viewports, canvas rendering, and waiting for prior renders before reusing a canvas.

### 3. Data and image enhancements — 3–5 developer days

1. Add CSV preview page size, previous/next, row counts, and reset/clamp behavior on input changes. Downloads must include all rows regardless of preview pagination.
2. Implement opt-in unflattening with a documented dotted-key convention. Reject scalar/object collisions and ambiguous paths; define array behavior and block prototype keys (`__proto__`, `constructor`, `prototype`). Keep flat conversion available for literal dotted headers.
3. Add CSV upload/text limits before parsing, read errors, and stale-upload protection. Move large parsing jobs into workers with request IDs; terminate/replace work on cancellation. Reuse the convention for validators and formatters.
4. Add a bounded compressor batch queue with shared image limits, per-file savings/errors, retry, cancel, individual download, and size-limited ZIP download.
5. Add a keyboard-operable comparison slider. Add Image to PDF drag reordering after queue/export behavior is stable.

Acceptance: the final CSV page is reachable; nested conversions are collision-safe; old jobs cannot replace current output; large jobs leave controls responsive; one corrupt image cannot fail the entire batch; ZIP size stays within budget; PDF order matches pointer/keyboard reordering.

### 4. Video to Audio — 1–2 day feasibility spike, then 4–6 developer days

This is the highest-risk missing tool because decoding, encoding, worker loading, and peak memory must work in a static deployment.

1. Prototype lazy-loaded, single-thread `@ffmpeg/ffmpeg` and `@ffmpeg/core` with same-origin assets. Verify local MP4/AAC and WebM/Opus samples produce playable WAV/MP3; test MOV separately. Record actual supported codecs and peak memory before promising format support.
2. Prove worker/WASM loading from the exported site with the host's MIME/CSP settings. Keep the engine out of the initial homepage bundle and show engine loading status when conversion is requested.
3. Create `src/app/video-to-audio-converter/page.tsx` and `src/modules/video-to-audio-converter/`. Add upload/drop, details, video preview where supported, output format, Convert, progress, audio preview, and download.
4. Extract audio and handle videos without an audio track. Add WAV first, then MP3 at verified bitrates (128/192/320 kbps) if supported by the chosen core. Validate trim bounds/output duration before enabling trimming. Offer audio-track selection or explicitly document the default track.
5. Start with a proposed 50 MB input limit plus measured duration/output-memory budgets. WAV size depends on duration, channels, and sample rate; file size alone is insufficient.
6. Cancel by terminating the worker and recreate it for another job. Delete virtual filesystem inputs/outputs after success/failure, revoke preview URLs, and reject stale results.
7. Activate the catalog card after real-file conversion and static-export checks pass. Waveform visualization can follow later if it helps trimming.

Acceptance: outputs play with expected duration, channels, and MIME type; unsupported codecs, missing audio, corrupt input, and invalid trim bounds have readable states; cancel permits another conversion; navigation releases the engine; files stay local.

The [FFmpeg WASM usage guide](https://ffmpegwasm.netlify.app/docs/getting-started/usage/) documents engine loading and additional SharedArrayBuffer requirements for its multi-thread core. Use single-thread initially; evaluate multi-threading after hosting/memory measurements. Check the selected core and bundled library licenses described in its [FAQ](https://ffmpegwasm.netlify.app/docs/faq/) when choosing the shipped build.

The old plan's `decodeAudioData`-first recommendation should not promise MP4/WebM/MOV support. [MDN documents](https://developer.mozilla.org/en-US/docs/Web/API/BaseAudioContext/decodeAudioData) that it decodes complete file data into an in-memory AudioBuffer and resamples to the context rate. Inference for this project: measure actual container/codec support and memory use instead of assuming a general video extraction pipeline.

### 5. Optional polish — scope after the core releases

- Offer validator formatting through the existing engine. Preserve input for undo, apply changes only on user action, and revalidate. Do not promise automatic repair of malformed code.
- If Go remains desired, decouple validator IDs from formatter IDs and integrate a real Go syntax parser in a worker. Brace counting is insufficient; syntax validation must not claim type checking.
- Add catalog search/categories and optional locally stored favorites with safe behavior when storage is blocked. Keep catalog content available in static HTML.
- Replace the starter README with actual setup, Node/pnpm requirements, checks, architecture, privacy/limits, and static deployment instructions.
- Treat Markdown image embedding and broader Unicode font coverage as separate enhancements: the current UI says images use alt text and the renderer uses built-in font families. Verify fonts/images with rendered fixtures before claiming full fidelity.

## Architecture and release checks

- Preserve `output: "export"` in `next.config.ts`. Build-time rendered page shells are compatible; browser APIs/conversion engines belong in client components/workers. No backend/upload service is required.
- Read relevant installed guides in `node_modules/next/dist/docs/` before route, worker, or bundling changes.
- Keep content local; self-host worker/WASM/font assets and avoid implicit remote document-image fetching. Load heavy libraries only where needed.
- Share dimensions, filenames, cancellation, blob cleanup, and ZIP budgets without building a generic framework for small text tools.
- Keep pending cards disabled until routes/conversions pass verification. Home/About share one catalog entry per tool.
- Run `pnpm test`, `pnpm exec tsc --noEmit`, `pnpm lint`, and `pnpm build`. Serve `out/` over HTTP to verify production assets and direct route access.
- Add meaningful fixtures for page ranges, limits, nested key collisions, queue cancellation, and filenames. Cover actual browser uploads/downloads, navigation focus, and touch crop behavior; Node mocks cannot prove these flows.
- A manifest already exists, but no service worker exists in the source. Local processing does not guarantee offline cold starts; add caching and tests before making that claim.

## Audit verification

- Existing tests: **42 passed** (`pnpm test`).
- TypeScript: `pnpm exec tsc --noEmit` passed.
- Changed catalog/icon registry files pass ESLint; `git diff --check` passes. All 17 live catalog entries resolve to existing page files, and the two remaining disabled entries are PDF to Image and Video to Audio.
- Existing lint baseline: **3 errors, 21 warnings**, in unchanged files. The errors and remediation are listed in phase 1.
- Production build could not complete: Turbopack's CSS worker failed to bind an internal port with `Operation not permitted`, including on an escalated retry. Production build/export verification remains outstanding in a host that permits that worker.
- Browser conversion/accessibility findings above are based on source inspection; cross-browser acceptance work remains part of implementation.
