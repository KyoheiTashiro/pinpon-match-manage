import { base, type IconProps } from "@/components/icons/base";

export const UsersIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <circle cx="9" cy="8" r="3.5" />
    <path d="M2.5 19c0-3.3 2.9-5.5 6.5-5.5s6.5 2.2 6.5 5.5" />
    <circle cx="17" cy="9" r="2.8" />
    <path d="M16 14c3.2.4 5.5 2.4 5.5 5" />
  </svg>
);
