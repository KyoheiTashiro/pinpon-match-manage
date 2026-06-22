import { SIDE } from "@/domain/match";
import { ScoreColumn } from "@/features/tournament/scoreboard/components/ScoreColumn";
import type { ScoreInputProps } from "@/features/tournament/scoreboard/types";

export const ScoreInputView = ({
  left,
  right,
  leftWins,
  rightWins,
  matchWinner,
  locked,
  swapped,
  onSwap,
}: ScoreInputProps) => {
  return (
    <div className="grid min-h-0 flex-1 grid-cols-[1fr_auto_1fr] items-stretch">
      <ScoreColumn {...left} />

      <div className="flex min-w-[140px] flex-col items-center justify-center border-x border-white/20 px-1 sm:px-2">
        <div className="mt-2 text-[clamp(3rem,12vw,9rem)] leading-none font-extrabold tabular-nums">
          <span className={matchWinner === SIDE.LEFT ? "text-green-500" : ""}>{leftWins}</span>
          <span className="mx-1 text-white/40">-</span>
          <span className={matchWinner === SIDE.RIGHT ? "text-green-500" : ""}>{rightWins}</span>
        </div>
        {locked && (
          <div className="mt-3 text-xs font-extrabold text-amber-300 sm:text-sm">入力不可</div>
        )}
        <button
          type="button"
          onClick={onSwap}
          aria-label="左右を入れ替える"
          aria-pressed={swapped}
          className="mt-3 rounded-lg border-2 border-white/60 px-2 py-2 text-base font-extrabold transition hover:bg-white/10 active:scale-95 sm:text-lg"
        >
          ⇄ 入替
        </button>
      </div>

      <ScoreColumn {...right} />
    </div>
  );
};
