import type { SvgIconProps } from "./svg-icon-props";

export function SiteCheckerIcon(props: SvgIconProps) {
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
      <path d="M5.25 4.5h13.5v15H5.25z" />
      <path d="M8.25 8.25h7.5M8.25 12h7.5M8.25 15.75h4.5" />
      <path d="M17.25 4.5v15" />
      <path d="M13.5 8.25h2.25" />
      <path d="M13.5 12h2.25" />
      <path d="M13.5 15.75h2.25" />
    </svg>
  );
}
