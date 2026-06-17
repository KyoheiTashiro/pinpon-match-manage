import { SIDE } from "@/domain/match";
import type { Game, Side } from "@/domain/match";
import { isGameFinished } from "@/domain/match";

type Props = {
  leftName: string;
  rightName: string;
  leftWins: number;
  rightWins: number;
  matchWinner: Side | null;
  games: Game[];
  swapped: boolean;
};

export const MatchResultView = ({
  leftName,
  rightName,
  leftWins,
  rightWins,
  matchWinner,
  games,
  swapped,
}: Props) => {
  const playedGames = games
    .map((game, gameIndex) => ({ game, gameIndex }))
    .filter(({ game }) => isGameFinished(game) || game.leftScore > 0 || game.rightScore > 0);

  return (
    <div className="flex min-h-0 flex-1 flex-col items-center justify-center overflow-auto px-4 py-6">
      <div className="grid w-full max-w-6xl grid-cols-3 items-center gap-x-6 gap-y-4 sm:gap-x-10">
        <div className="flex flex-col items-center gap-4">
          <div
            className={`text-[clamp(4rem,12vw,12rem)] font-extrabold tabular-nums leading-none ${
              matchWinner === SIDE.LEFT ? "text-green-500" : ""
            }`}
          >
            {leftWins}
          </div>
          <div
            className={`break-words text-center text-[clamp(2rem,5vw,5rem)] font-extrabold ${
              matchWinner === SIDE.LEFT ? "text-green-500" : ""
            }`}
          >
            {leftName}
          </div>
        </div>
        <div className="flex flex-col gap-2 text-[clamp(1.75rem,4vw,3.5rem)] font-extrabold tabular-nums sm:gap-3">
          {playedGames.map(({ game, gameIndex }) => {
            const leftScore = swapped ? game.rightScore : game.leftScore;
            const rightScore = swapped ? game.leftScore : game.rightScore;
            return (
              <div key={gameIndex} className="flex items-center justify-center gap-3 sm:gap-5">
                <span className="min-w-[2ch] text-right">{leftScore}</span>
                <span className="text-white/40">-</span>
                <span className="min-w-[2ch] text-left">{rightScore}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-4">
          <div
            className={`text-[clamp(4rem,12vw,12rem)] font-extrabold tabular-nums leading-none ${
              matchWinner === SIDE.RIGHT ? "text-green-500" : ""
            }`}
          >
            {rightWins}
          </div>
          <div
            className={`break-words text-center text-[clamp(2rem,5vw,5rem)] font-extrabold ${
              matchWinner === SIDE.RIGHT ? "text-green-500" : ""
            }`}
          >
            {rightName}
          </div>
        </div>
      </div>
    </div>
  );
};
