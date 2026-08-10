import type { SvgIconProps } from "./svg-icon-props";

export function ImageToBase64ConverterIcon(props: SvgIconProps) {
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
      <path d="m8.25 14.25 2.25-2.25 2.25 2.25 2.25-3 1.5 1.5" />
      <path d="M8.25 9h3" />
      <path d="M15.75 9.75h2.25M15.75 12h2.25M15.75 14.25h2.25" />
    </svg>
  );
}
