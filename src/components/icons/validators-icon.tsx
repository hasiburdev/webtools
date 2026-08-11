import type { SvgIconProps } from "./svg-icon-props";

export function ValidatorsIcon(props: SvgIconProps) {
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
      <path d="M6 4.5h8.25l3.75 3.75v11.25H6z" />
      <path d="M14.25 4.5v4.5h4.5" />
      <path d="m8.25 13.5 1.5 1.5 3-3" />
      <path d="M8.25 17.25h7.5" />
    </svg>
  );
}
