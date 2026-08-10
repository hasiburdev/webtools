import type { SvgIconProps } from "./svg-icon-props";

export function WordCounterIcon(props: SvgIconProps) {
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
      <path d="M5.25 5.25h13.5v13.5H5.25z" />
      <path d="M8.25 9h7.5M8.25 12h7.5M8.25 15h4.5" />
      <path d="M17.25 9h1.5M17.25 12h1.5M17.25 15h1.5" />
    </svg>
  );
}
