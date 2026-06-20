import { base, type IconProps } from "@/components/icons/base";

export const HelpIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="12" cy="12" r="9" />
    <path d="M9.2 9a3 3 0 0 1 5.6 1.2c0 2-3 2.5-3 4.3" />
    <circle cx="12" cy="17.5" r="1.5" fill="currentColor" stroke="none" />
  </svg>
);
