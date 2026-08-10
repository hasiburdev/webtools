import type { SvgIconProps } from "./svg-icon-props";

export function PlaceholderThumbnailGeneratorIcon(props: SvgIconProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      focusable="false"
      {...props}
    >
      <rect x="4.5" y="5.25" width="15" height="13.5" rx="1.75" />
      <path d="m7.5 15 2.25-2.25 2.25 2.25 2.25-3 2.25 3" />
      <circle cx="9" cy="9" r="1.25" />
    </svg>
  );
}
