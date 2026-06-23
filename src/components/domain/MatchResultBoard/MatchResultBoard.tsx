import { GameScoreColumn } from "@/components/domain/GameScoreColumn";
import type { GameScore } from "@/components/domain/GameScoreColumn";
import { WinnerBadge } from "@/components/domain/WinnerBadge";

export type PlayerSide = {
  name: string;
  wins: number;
  isWinner: boolean;
};

/**
 * 表示バリアント。
 * - card: 一覧カード（明背景・小フォント・勝者バッジ・区切り線）
 * - scoreboard: 全画面表示（青背景・特大フォント・勝者は色のみ）
 */
type Variant = "card" | "scoreboard";

type Props = {
  left: PlayerSide;
  right: PlayerSide;
  games: GameScore[];
  variant?: Variant;
};

type CellStyle = {
  showBadge: boolean;
  cell: string;
  name: string;
  nameWinner: string;
  nameLoser: string;
  wins: string;
  winsWinner: string;
  winsLoser: string;
};

type VariantStyle = CellStyle & {
  outer: string;
  gameScore: string;
  gameWin: string;
  gameSeparator: string;
};

const VARIANT: Record<Variant, VariantStyle> = {
  card: {
    outer:
      "divide-line grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-stretch divide-x",
    showBadge: true,
    cell: "flex min-w-0 flex-col items-center justify-center gap-1 px-4",
    name: "w-full text-center text-lg break-words",
    nameWinner: "",
    nameLoser: "text-sub",
    wins: "text-[3rem] leading-none font-extrabold tabular-nums",
    winsWinner: "text-success",
    winsLoser: "text-sub",
    gameScore: "w-full min-w-0 px-4 text-lg",
    gameWin: "text-success",
    gameSeparator: "text-sub",
  },
  scoreboard: {
    outer: "grid w-full max-w-6xl grid-cols-3 items-center gap-x-6 gap-y-4 sm:gap-x-10",
    showBadge: false,
    cell: "flex flex-col items-center gap-4",
    name: "text-center text-[clamp(2rem,5vw,5rem)] font-extrabold break-words",
    nameWinner: "text-green-500",
    nameLoser: "",
    wins: "text-[clamp(4rem,12vw,12rem)] leading-none font-extrabold tabular-nums",
    winsWinner: "text-green-500",
    winsLoser: "",
    gameScore: "text-[clamp(1.75rem,4vw,3.5rem)] font-extrabold sm:gap-3",
    gameWin: "text-green-500",
    gameSeparator: "text-white/40",
  },
};

// 左右パネルは対称なので内部ヘルパで共通化する。
const PlayerCell = ({ side, style }: { side: PlayerSide; style: CellStyle }) => {
  const nameColor = side.isWinner ? style.nameWinner : style.nameLoser;
  const winsColor = side.isWinner ? style.winsWinner : style.winsLoser;
  return (
    <div className={style.cell}>
      {style.showBadge && (
        <div className="flex h-10 w-full items-center justify-center">
          {side.isWinner && <WinnerBadge size="lg" />}
        </div>
      )}
      <span className={`${style.name} ${nameColor}`}>{side.name}</span>
      <span className={`${style.wins} ${winsColor}`}>{side.wins}</span>
    </div>
  );
};

/**
 * 1対戦の結果ボード（左パネル / ゲームスコア / 右パネル の3カラム）。
 * feature の型に依存しない汎用 props を受け取る共有コンポーネント。
 * 全画面センタリング等のページレイアウトは呼び出し側の責務。
 */
export const MatchResultBoard = ({ left, right, games, variant = "card" }: Props) => {
  const style = VARIANT[variant];
  return (
    <div className={style.outer}>
      <PlayerCell side={left} style={style} />
      <GameScoreColumn
        games={games}
        className={style.gameScore}
        winClassName={style.gameWin}
        separatorClassName={style.gameSeparator}
      />
      <PlayerCell side={right} style={style} />
    </div>
  );
};
