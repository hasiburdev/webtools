export type SlugifyOptions = {
  separator: "-" | "_";
  lowercase: boolean;
};

/**
 * Converts arbitrary text into a URL-friendly slug.
 *
 * Steps:
 * 1. NFD-normalize to decompose accented characters (é → e + ́)
 * 2. Strip combining diacritical marks (U+0300–U+036F)
 * 3. Optionally lowercase the result
 * 4. Replace every run of non-alphanumeric characters with the separator
 * 5. Strip any leading/trailing separator
 */
export function slugify(input: string, options: SlugifyOptions): string {
  const { separator, lowercase } = options;

  if (!input) return "";

  let slug = input
    // Remove diacritics (ü→u, é→e, ñ→n, etc.)
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "");

  if (lowercase) slug = slug.toLowerCase();

  // Replace every run of non-word characters with the chosen separator.
  // Using [^a-zA-Z0-9]+ so a group of specials → exactly one separator.
  slug = slug.replace(/[^a-zA-Z0-9]+/g, separator);

  // Strip leading/trailing separator
  const edge = separator === "-" ? /^-+|-+$/g : /^_+|_+$/g;
  slug = slug.replace(edge, "");

  return slug;
}

/** Returns a short summary string for display in the UI. */
export function describeSlug(input: string, slug: string): string {
  if (!input) return "";
  const words = input.trim().split(/\s+/).filter(Boolean).length;
  const segments = slug ? slug.split(/[-_]/).filter(Boolean).length : 0;
  return `${words} word${words !== 1 ? "s" : ""} → ${segments} segment${segments !== 1 ? "s" : ""}`;
}
