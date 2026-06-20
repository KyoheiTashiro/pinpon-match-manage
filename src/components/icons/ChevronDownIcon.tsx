import { base, type IconProps } from "@/components/icons/base";

export const ChevronDownIcon = (props: IconProps) => (
  <svg {...base} strokeWidth={2.5} {...props}>
    <polyline points="6 9 12 15 18 9" />
  </svg>
);
