import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import type { Game } from "@/domain/match";
import { isGameFinished } from "@/domain/match";

type Props = {
  games: Game[];
  gameIndex: number;
  setGameIndex: (index: number) => void;
  lockedFromIndex: number;
  showResult: boolean;
  showNextGameBtn: boolean;
  showResultBtn: boolean;
  showBackBtn: boolean;
  nextGameIndex: number;
  onBack: () => void;
  onShowResult: () => void;
  onCloseAll?: () => void;
};

export const ScoreboardHeader = ({
  games,
  gameIndex,
  setGameIndex,
  lockedFromIndex,
  showResult,
  showNextGameBtn,
  showResultBtn,
  showBackBtn,
  nextGameIndex,
  onBack,
  onShowResult,
  onCloseAll,
}: Props) => {
  return (
    <div className="flex shrink-0 items-center justify-between border-b border-white/20 px-3 py-2">
      <Button
        type="button"
        variant="secondary"
        size="sm"
        onClick={onBack}
        aria-label="戻る"
        className="inline-flex items-center gap-1"
      >
        <ChevronDownIcon className="rotate-90" /> 戻る
      </Button>
      <div className="flex flex-wrap justify-center gap-1">
        {!showResult &&
          games.map((game, index) => {
            const empty = game.leftScore === 0 && game.rightScore === 0;
            const done = isGameFinished(game);
            const isLocked = index >= lockedFromIndex;
            return (
              <button
                key={index}
                type="button"
                onClick={() => setGameIndex(index)}
                disabled={isLocked && empty}
                className={`min-w-[44px] rounded border-2 px-2 py-1 text-sm font-extrabold ${
                  index === gameIndex
                    ? "border-white bg-white text-black"
                    : done
                      ? "border-success text-green-500"
                      : isLocked && empty
                        ? "border-white/20 text-white/30"
                        : "border-white/60 text-white"
                }`}
              >
                G{index + 1}
              </button>
            );
          })}
      </div>
      <div className="flex min-w-[110px] justify-end">
        {showNextGameBtn && (
          <button
            type="button"
            onClick={() => setGameIndex(nextGameIndex)}
            className="border-success bg-success rounded-lg border-2 px-4 py-2 text-base font-extrabold text-white transition hover:brightness-110 active:scale-95"
          >
            次に進む
          </button>
        )}
        {showResultBtn && (
          <button
            type="button"
            onClick={onShowResult}
            className="border-success bg-success rounded-lg border-2 px-4 py-2 text-base font-extrabold text-white transition hover:brightness-110 active:scale-95"
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
            className="border-success bg-success rounded-lg border-2 px-4 py-2 text-base font-extrabold text-white transition hover:brightness-110 active:scale-95"
          >
            対戦表に戻る
          </button>
        )}
      </div>
    </div>
  );
};
