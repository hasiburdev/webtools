import type { SvgIconProps } from "./svg-icon-props";

export function OnlineColorPickerIcon(props: SvgIconProps) {
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
      <path d="M14.25 4.5 19.5 9.75 9.75 19.5H4.5v-5.25z" />
      <path d="M12 7.5 16.5 12" />
      <circle cx="7.5" cy="16.5" r="1.25" />
    </svg>
  );
}
