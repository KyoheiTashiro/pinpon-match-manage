// ゲームごとのスコア（左 - 右）を縦並びで表示する純表示コンポーネント。
// 勝者判定・swap・フィルタは呼び出し側の責務とし、ここは渡された値をそのまま描画する。
export type GameScore = {
  leftScore: number;
  rightScore: number;
  leftWon: boolean;
  rightWon: boolean;
};

type Props = {
  games: GameScore[];
  /** container のサイズ・gap・font を上乗せする追加クラス */
  className?: string;
  /** 勝者スコアの色 */
  winClassName: string;
  /** 区切り "-" の色 */
  separatorClassName: string;
};

export const GameScoreColumn = ({ games, className, winClassName, separatorClassName }: Props) => {
  return (
    <div className={`flex flex-col justify-center gap-2 tabular-nums ${className ?? ""}`}>
      {games.map((game, index) => (
        // oxlint-disable-next-line react/no-array-index-key -- ゲーム配列は固定長・順序不変
        <div key={index} className="flex items-center justify-center gap-2">
          <span className={`min-w-[2ch] text-center ${game.leftWon ? winClassName : ""}`}>
            {game.leftScore}
          </span>
          <span className={separatorClassName}>-</span>
          <span className={`min-w-[2ch] text-center ${game.rightWon ? winClassName : ""}`}>
            {game.rightScore}
          </span>
        </div>
      ))}
    </div>
  );
};
