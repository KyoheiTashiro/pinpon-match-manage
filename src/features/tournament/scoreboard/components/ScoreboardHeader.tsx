import { ChevronDownIcon } from "@/components/icons";
import { Button } from "@/components/ui";
import type { Game } from "@/domain/match";
import { isGameFinished } from "@/domain/match";
import { SCOREBOARD_ACTION, type ScoreboardAction } from "@/features/tournament/scoreboard/hooks";

type Props = {
  games: Game[];
  gameIndex: number;
  setGameIndex: (index: number) => void;
  isGameSelectable: (index: number) => boolean;
  showResult: boolean;
  action: ScoreboardAction | null;
  nextGameIndex: number;
  onBack: () => void;
  onShowResult: () => void;
  onCloseAll?: () => void;
};

export const ScoreboardHeader = ({
  games,
  gameIndex,
  setGameIndex,
  isGameSelectable,
  showResult,
  action,
  nextGameIndex,
  onBack,
  onShowResult,
  onCloseAll,
}: Props) => {
  return (
    <div
      className={`flex shrink-0 items-center justify-between border-b px-3 py-2 ${
        showResult ? "border-line bg-white" : "border-white/20"
      }`}
    >
      <Button
        type="button"
        variant={showResult ? "secondary" : "secondary"}
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
            const done = isGameFinished(game);
            const unreachable = !isGameSelectable(index);
            return (
              <button
                key={index}
                type="button"
                onClick={() => setGameIndex(index)}
                disabled={unreachable}
                className={`min-w-[44px] rounded border-2 px-2 py-1 text-sm font-extrabold ${
                  index === gameIndex
                    ? "border-white bg-white text-black"
                    : done
                      ? "border-success text-green-500"
                      : unreachable
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
        {action === SCOREBOARD_ACTION.NEXT && (
          <Button variant="success" size="sm" onClick={() => setGameIndex(nextGameIndex)}>
            次に進む
          </Button>
        )}
        {action === SCOREBOARD_ACTION.SHOW_RESULT && (
          <Button variant="success" size="sm" onClick={onShowResult}>
            結果を見る
          </Button>
        )}
        {action === SCOREBOARD_ACTION.CLOSE && (
          <Button
            variant="success"
            size="sm"
            onClick={() => {
              onBack();
              onCloseAll?.();
            }}
          >
            対戦表に戻る
          </Button>
        )}
      </div>
    </div>
  );
};
