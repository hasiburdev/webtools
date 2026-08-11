import type { SvgIconProps } from "./svg-icon-props";

export function QrCodeGeneratorIcon(props: SvgIconProps) {
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
      <path d="M4.5 4.5h5.25v5.25H4.5zM14.25 4.5h5.25v5.25h-5.25zM4.5 14.25h5.25v5.25H4.5z" />
      <path d="M14.25 14.25h2.25v2.25h-2.25zM18 14.25h1.5v1.5H18zM14.25 18h5.25v1.5h-5.25z" />
      <path d="M12 4.5v15M9 12h3m3 0h4.5" />
    </svg>
  );
}
