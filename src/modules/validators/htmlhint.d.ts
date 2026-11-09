// HTMLHint ships declarations but does not expose them through package.json.
declare module "htmlhint" {
  const api: { HTMLHint: typeof import("htmlhint/dist/core/core").HTMLHint };
  export = api;
}
