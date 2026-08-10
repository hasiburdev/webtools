import type { SvgIconProps } from "./svg-icon-props";

export function PdfToImageIcon(props: SvgIconProps) {
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
      <path d="M6.75 4.5h7.5l3 3v12h-10.5z" />
      <path d="M14.25 4.5v3h3" />
      <path d="M8.25 15.75l2.25-2.25 1.5 1.5 1.5-1.5 2.25 2.25" />
      <circle cx="10.5" cy="10.5" r="1.25" />
    </svg>
  );
}
