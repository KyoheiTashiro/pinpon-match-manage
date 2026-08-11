import { FORMAT, type Format } from "@/store/types";

/** 形式ごとに対戦表を表示できる最小参加者数 */
export const MIN_PLAYERS = {
  [FORMAT.SINGLES]: 2,
  [FORMAT.DOUBLES]: 4,
} as const satisfies Record<Format, number>;
