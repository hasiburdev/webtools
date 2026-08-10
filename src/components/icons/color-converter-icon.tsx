import type { SvgIconProps } from "./svg-icon-props";

export function ColorConverterIcon(props: SvgIconProps) {
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
      <path d="M7.5 4.5h9a3 3 0 0 1 3 3v9a3 3 0 0 1-3 3h-9a3 3 0 0 1-3-3v-9a3 3 0 0 1 3-3Z" />
      <path d="M7.5 12a4.5 4.5 0 0 1 9 0" />
      <path d="M12 7.5v9" />
    </svg>
  );
}
