import type { Game } from "../../../../../domain/match";
import { isGameFinished } from "../../../../../domain/match";

type Props = {
  games: Game[];
  idx: number;
  setIdx: (i: number) => void;
  lockedFromIndex: number;
  showResult: boolean;
  showNextGameBtn: boolean;
  showResultBtn: boolean;
  showBackBtn: boolean;
  nextIdx: number;
  onBack: () => void;
  onShowResult: () => void;
  onCloseAll?: () => void;
};

export const ScoreboardHeader = ({
  games,
  idx,
  setIdx,
  lockedFromIndex,
  showResult,
  showNextGameBtn,
  showResultBtn,
  showBackBtn,
  nextIdx,
  onBack,
  onShowResult,
  onCloseAll,
}: Props) => {
  return (
    <div className="flex items-center justify-between px-3 py-2 border-b border-white/20 shrink-0">
      <button
        type="button"
        onClick={onBack}
        aria-label="もどる"
        className="px-4 py-2 text-base font-extrabold rounded-lg border-2 border-white/60 hover:bg-white/10 active:scale-95 transition"
      >
        ← もどる
      </button>
      <div className="flex gap-1 flex-wrap justify-center">
        {!showResult &&
          games.map((g, i) => {
            const empty = g.leftScore === 0 && g.rightScore === 0;
            const done = isGameFinished(g);
            const isLocked = i >= lockedFromIndex;
            return (
              <button
                key={i}
                type="button"
                onClick={() => setIdx(i)}
                disabled={isLocked && empty}
                className={`min-w-[44px] px-2 py-1 text-sm font-extrabold rounded border-2 ${
                  i === idx
                    ? "bg-white text-black border-white"
                    : done
                      ? "border-success text-green-500"
                      : isLocked && empty
                        ? "border-white/20 text-white/30"
                        : "border-white/60 text-white"
                }`}
              >
                G{i + 1}
              </button>
            );
          })}
      </div>
      <div className="min-w-[110px] flex justify-end">
        {showNextGameBtn && (
          <button
            type="button"
            onClick={() => setIdx(nextIdx)}
            className="px-4 py-2 text-base font-extrabold rounded-lg border-2 border-success bg-success text-white hover:brightness-110 active:scale-95 transition"
          >
            次に進む
          </button>
        )}
        {showResultBtn && (
          <button
            type="button"
            onClick={onShowResult}
            className="px-4 py-2 text-base font-extrabold rounded-lg border-2 border-success bg-success text-white hover:brightness-110 active:scale-95 transition"
          >
            結果を見る
          </button>
        )}
        {showBackBtn && (
          <button
            type="button"
            onClick={() => {
              onBack();
              onCloseAll?.();
            }}
            className="px-4 py-2 text-base font-extrabold rounded-lg border-2 border-success bg-success text-white hover:brightness-110 active:scale-95 transition"
          >
            対戦表に戻る
          </button>
        )}
      </div>
    </div>
  );
};
