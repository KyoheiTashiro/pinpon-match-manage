import type { Side } from "../../../../../domain/match";
import { ScoreColumn } from "./ScoreColumn";

type Props = {
  leftName: string;
  rightName: string;
  leftScore: number;
  rightScore: number;
  leftWins: number;
  rightWins: number;
  winner: Side | null;
  matchWinner: Side | null;
  leftMatchPoint: boolean;
  rightMatchPoint: boolean;
  server: Side | null;
  locked: boolean;
  swapped: boolean;
  onSwap: () => void;
  onAddLeft: () => void;
  onSubLeft: () => void;
  onAddRight: () => void;
  onSubRight: () => void;
  canSubLeft: boolean;
  canSubRight: boolean;
};

export const ScoreInputView = ({
  leftName,
  rightName,
  leftScore,
  rightScore,
  leftWins,
  rightWins,
  winner,
  matchWinner,
  leftMatchPoint,
  rightMatchPoint,
  server,
  locked,
  swapped,
  onSwap,
  onAddLeft,
  onSubLeft,
  onAddRight,
  onSubRight,
  canSubLeft,
  canSubRight,
}: Props) => {
  return (
    <div className="flex-1 min-h-0 grid grid-cols-[1fr_auto_1fr] items-stretch">
      <ScoreColumn
        name={leftName}
        score={leftScore}
        isGameWinner={winner === "L"}
        isMatchWinner={matchWinner === "L"}
        isMatchPoint={leftMatchPoint}
        isServing={server === "L"}
        disabled={locked}
        disableAdd={winner === "L"}
        canSub={canSubLeft}
        onAdd={onAddLeft}
        onSub={onSubLeft}
      />

      <div className="flex flex-col items-center justify-center px-1 sm:px-2 border-x border-white/20 min-w-[140px]">
        <div className="text-[clamp(3rem,12vw,9rem)] leading-none font-extrabold mt-2 tabular-nums">
          <span className={matchWinner === "L" ? "text-green-500" : ""}>{leftWins}</span>
          <span className="mx-1 text-white/40">-</span>
          <span className={matchWinner === "R" ? "text-green-500" : ""}>{rightWins}</span>
        </div>
        {locked && (
          <div className="mt-3 text-xs sm:text-sm font-extrabold text-amber-300">入力不可</div>
        )}
        <button
          type="button"
          onClick={onSwap}
          aria-label="左右を入れ替える"
          aria-pressed={swapped}
          className="mt-3 px-2 py-2 text-base sm:text-lg font-extrabold rounded-lg border-2 border-white/60 hover:bg-white/10 active:scale-95 transition"
        >
          ⇄ 入替
        </button>
      </div>

      <ScoreColumn
        name={rightName}
        score={rightScore}
        isGameWinner={winner === "R"}
        isMatchWinner={matchWinner === "R"}
        isMatchPoint={rightMatchPoint}
        isServing={server === "R"}
        disabled={locked}
        disableAdd={winner === "R"}
        canSub={canSubRight}
        onAdd={onAddRight}
        onSub={onSubRight}
      />
    </div>
  );
};
