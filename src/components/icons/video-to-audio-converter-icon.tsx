import type { SvgIconProps } from "./svg-icon-props";

export function VideoToAudioConverterIcon(props: SvgIconProps) {
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
      <rect x="3.75" y="6" width="10.5" height="12" rx="1.5" />
      <path d="m17.25 9 3-2.25v10.5L17.25 15z" />
      <path d="M18 18a1.5 1.5 0 0 0 3 0v-1.5h-3z" />
      <path d="M7.5 12h2.25" />
    </svg>
  );
}
