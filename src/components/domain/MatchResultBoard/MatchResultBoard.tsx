import { WinnerBadge } from "@/components/domain/WinnerBadge";

export type PlayerSide = {
  name: string;
  wins: number;
  isWinner: boolean;
};

// ゲームごとのスコア（左 - 右）。勝者判定・swap・フィルタは呼び出し側の責務。
export type GameScore = {
  leftScore: number;
  rightScore: number;
  leftWon: boolean;
  rightWon: boolean;
};

type Props = {
  left: PlayerSide;
  right: PlayerSide;
  games: GameScore[];
};

// 左右パネルは対称なので内部ヘルパで共通化する。
const PlayerCell = ({ side }: { side: PlayerSide }) => (
  <div className="flex min-w-0 flex-col items-center justify-center gap-1 px-4">
    <div className="flex h-10 w-full items-center justify-center">
      {side.isWinner && <WinnerBadge size="lg" />}
    </div>
    <span className={`w-full text-center text-lg break-words ${side.isWinner ? "" : "text-sub"}`}>
      {side.name}
    </span>
    <span
      className={`text-[3rem] leading-none font-extrabold tabular-nums ${
        side.isWinner ? "text-success" : "text-sub"
      }`}
    >
      {side.wins}
    </span>
  </div>
);

/**
 * 1対戦の結果ボード（左パネル / ゲームスコア / 右パネル の3カラム）。
 * feature の型に依存しない汎用 props を受け取る共有コンポーネント。
 * 明背景・カード内での表示を前提とする（全画面センタリング等のレイアウトは呼び出し側の責務）。
 */
export const MatchResultBoard = ({ left, right, games }: Props) => (
  <div className="divide-line grid grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)] items-stretch divide-x">
    <PlayerCell side={left} />
    <div className="flex w-full min-w-0 flex-col justify-center gap-2 px-4 text-lg tabular-nums">
      {games.map((game, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- ゲーム配列は固定長・順序不変
        <div key={index} className="flex items-center justify-center gap-2">
          <span className={`min-w-[2ch] text-center ${game.leftWon ? "text-success" : ""}`}>
            {game.leftScore}
          </span>
          <span className="text-sub">-</span>
          <span className={`min-w-[2ch] text-center ${game.rightWon ? "text-success" : ""}`}>
            {game.rightScore}
          </span>
        </div>
      ))}
    </div>
    <PlayerCell side={right} />
  </div>
);
