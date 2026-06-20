import { base, type IconProps } from "@/components/icons/base";

export const TrophyIcon = (props: IconProps) => (
  <svg {...base} {...props}>
    <path d="M7 4h10v4a5 5 0 0 1-10 0V4Z" />
    <path d="M17 5h3v2a3 3 0 0 1-3 3" />
    <path d="M7 5H4v2a3 3 0 0 0 3 3" />
    <path d="M10 13h4l-.5 4h-3z" />
    <path d="M8 21h8" />
    <path d="M12 17v4" />
  </svg>
);
