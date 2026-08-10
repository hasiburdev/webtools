import type { SvgIconProps } from "./svg-icon-props";

export function FormattersIcon(props: SvgIconProps) {
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
      <path d="M7.5 5.25h9L19.5 8.25v10.5h-12V5.25z" />
      <path d="M14.25 5.25v3h3" />
      <path d="M8.25 11.25h7.5M8.25 14.25h7.5M8.25 17.25h5.25" />
    </svg>
  );
}
