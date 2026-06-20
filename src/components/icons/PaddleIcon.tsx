import { base, type IconProps } from "@/components/icons/base";

export const PaddleIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <ellipse cx="11" cy="10" rx="7" ry="6" />
    <path d="M6.2 14.8 3 21l3 1 2.8-6.5" />
    <circle cx="18.5" cy="17.5" r="1.6" fill="currentColor" />
  </svg>
);
