import type { SvgIconProps } from "./svg-icon-props";

export function CsvJsonConverterIcon(props: SvgIconProps) {
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
      <path d="M4.5 6.75h15v10.5h-15z" />
      <path d="M8.25 6.75v10.5M15.75 6.75v10.5M4.5 10.5h15M4.5 14.25h15" />
    </svg>
  );
}
