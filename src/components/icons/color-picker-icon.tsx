import type { SvgIconProps } from "./svg-icon-props";

export function ColorPickerIcon(props: SvgIconProps) {
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
      <path d="M6 18 18 6" />
      <path d="M14.25 4.5 19.5 9.75 9.75 19.5H4.5v-5.25z" />
      <circle cx="8.25" cy="15.75" r="1.25" />
      <path d="M11.25 6.75 17.25 12.75" />
    </svg>
  );
}
