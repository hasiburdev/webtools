import type { SvgIconProps } from "./svg-icon-props";

export function ImageToPdfIcon(props: SvgIconProps) {
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
      <path d="M8.25 15.75h3l-1.5-2.25zM14.25 14.25h1.5a1.5 1.5 0 0 1 0 3h-1.5zM17.25 14.25v3M19.5 14.25h-1.5v3" />
      <path d="M3.75 18.75v-3l-1.5 1.5 1.5 1.5" />
    </svg>
  );
}
