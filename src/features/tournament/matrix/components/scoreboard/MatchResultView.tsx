import type { Game } from "../../../../../domain/match";
import { isGameFinished } from "../../../../../domain/match";

type Props = {
  leftName: string;
  rightName: string;
  leftWins: number;
  rightWins: number;
  matchWinner: "L" | "R" | null;
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
    .map((g, i) => ({ g, i }))
    .filter(({ g }) => isGameFinished(g) || g.leftScore > 0 || g.rightScore > 0);

  return (
    <div className="flex-1 min-h-0 overflow-auto px-4 py-6 flex flex-col items-center justify-center">
      <div className="w-full max-w-6xl grid grid-cols-3 items-center gap-x-6 sm:gap-x-10 gap-y-4">
        <div className="flex flex-col items-center gap-4">
          <div
            className={`text-[clamp(4rem,12vw,12rem)] leading-none font-extrabold tabular-nums ${
              matchWinner === "L" ? "text-green-500" : ""
            }`}
          >
            {leftWins}
          </div>
          <div
            className={`text-center text-[clamp(2rem,5vw,5rem)] font-extrabold break-words ${
              matchWinner === "L" ? "text-green-500" : ""
            }`}
          >
            {leftName}
          </div>
        </div>
        <div className="flex flex-col gap-2 sm:gap-3 text-[clamp(1.75rem,4vw,3.5rem)] font-extrabold tabular-nums">
          {playedGames.map(({ g, i }) => {
            const l = swapped ? g.rightScore : g.leftScore;
            const r = swapped ? g.leftScore : g.rightScore;
            return (
              <div key={i} className="flex items-center justify-center gap-3 sm:gap-5">
                <span className="text-right min-w-[2ch]">{l}</span>
                <span className="text-white/40">-</span>
                <span className="text-left min-w-[2ch]">{r}</span>
              </div>
            );
          })}
        </div>
        <div className="flex flex-col items-center gap-4">
          <div
            className={`text-[clamp(4rem,12vw,12rem)] leading-none font-extrabold tabular-nums ${
              matchWinner === "R" ? "text-green-500" : ""
            }`}
          >
            {rightWins}
          </div>
          <div
            className={`text-center text-[clamp(2rem,5vw,5rem)] font-extrabold break-words ${
              matchWinner === "R" ? "text-green-500" : ""
            }`}
          >
            {rightName}
          </div>
        </div>
      </div>
    </div>
  );
};
