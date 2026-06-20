import { SIDE } from "@/domain/match";
import type { MatchResultRow } from "@/features/tournament/result/hooks";

type Props = {
  matchResults: MatchResultRow[];
  bestOf: number;
};

export const MatchResultsTable = ({ matchResults, bestOf }: Props) => {
  if (matchResults.length === 0) {
    return (
      <div className="space-y-2 pt-2">
        <div className="text-base font-extrabold">対戦結果</div>
        <div className="border-line text-sub rounded-2xl border-2 p-4 text-center text-base">
          データがありません
        </div>
      </div>
    );
  }
  return (
    <div className="space-y-2 pt-2">
      <div className="text-base font-extrabold">対戦結果</div>
      <div className="border-line overflow-hidden rounded-2xl border-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg">
              <th className="border-line border-r-2 border-b-2 p-2 text-left text-base whitespace-nowrap">
                対戦
              </th>
              {Array.from({ length: bestOf }, (_, index) => (
                <th
                  key={index}
                  className="border-line border-r-2 border-b-2 p-2 text-base whitespace-nowrap"
                >
                  G{index + 1}
                </th>
              ))}
              <th className="border-line border-b-2 p-2 text-base whitespace-nowrap">セット</th>
            </tr>
          </thead>
          <tbody>
            {matchResults.map((match, rowIndex) => {
              const rowBorder = rowIndex < matchResults.length - 1 ? "border-b-2" : "";
              return (
                <tr key={match.id}>
                  <td className={`border-line border-r-2 p-2 text-base ${rowBorder}`}>
                    <span className={match.winner === SIDE.LEFT ? "font-extrabold" : "text-sub"}>
                      {match.leftName}
                    </span>
                    <span className="text-sub"> vs </span>
                    <span className={match.winner === SIDE.RIGHT ? "font-extrabold" : "text-sub"}>
                      {match.rightName}
                    </span>
                  </td>
                  {Array.from({ length: bestOf }, (_, gameIndex) => {
                    const game = match.games[gameIndex];
                    if (!game) {
                      return (
                        <td
                          key={gameIndex}
                          className={`border-line text-sub border-r-2 p-2 text-center text-base ${rowBorder}`}
                        >
                          -
                        </td>
                      );
                    }
                    return (
                      <td
                        key={gameIndex}
                        className={`border-line border-r-2 p-2 text-center text-base whitespace-nowrap ${rowBorder}`}
                      >
                        <span className={game.leftScore > game.rightScore ? "font-extrabold" : ""}>
                          {game.leftScore}
                        </span>
                        <span className="text-sub">-</span>
                        <span className={game.rightScore > game.leftScore ? "font-extrabold" : ""}>
                          {game.rightScore}
                        </span>
                      </td>
                    );
                  })}
                  <td
                    className={`border-line p-2 text-center text-base font-bold whitespace-nowrap ${rowBorder}`}
                  >
                    {match.leftWins}-{match.rightWins}
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
