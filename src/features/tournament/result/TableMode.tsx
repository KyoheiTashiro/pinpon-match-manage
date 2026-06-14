import { useResultRows } from "@/features/tournament/result/hooks";
import type { MatchResultRow } from "@/features/tournament/result/hooks";

// ----- 点数表モード -----
type TableModeProps = {
  rows: ReturnType<typeof useResultRows>["rows"];
  matchResults: MatchResultRow[];
  bestOf: number;
};

export const TableMode = ({ rows, matchResults, bestOf }: TableModeProps) => (
  <>
    <div className="text-base font-extrabold">順位</div>
    <table className="w-full border-2 border-line border-collapse">
      <thead>
        <tr className="bg-bg">
          <th className="border-2 border-line p-2 text-base whitespace-nowrap">順位</th>
          <th className="border-2 border-line p-2 text-base text-left whitespace-nowrap">名前</th>
          <th className="border-2 border-line p-2 text-base whitespace-nowrap">試合</th>
          <th className="border-2 border-line p-2 text-base whitespace-nowrap">勝</th>
          <th className="border-2 border-line p-2 text-base whitespace-nowrap">敗</th>
          <th className="border-2 border-line p-2 text-base whitespace-nowrap">G差</th>
          <th className="border-2 border-line p-2 text-base whitespace-nowrap">点差</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.participantId} className="text-center">
            <td className="border-2 border-line p-2 text-2xl font-extrabold">{row.rank}</td>
            <td className="border-2 border-line p-2 text-lg font-bold text-left whitespace-nowrap">
              {row.name}
            </td>
            <td className="border-2 border-line p-2 text-lg">{row.played}</td>
            <td className="border-2 border-line p-2 text-lg text-success font-bold">{row.wins}</td>
            <td className="border-2 border-line p-2 text-lg text-danger font-bold">{row.losses}</td>
            <td className="border-2 border-line p-2 text-lg">
              {signed(row.gameDiff)}
              <span className="text-sub text-base">
                {" "}
                ({row.gamesWon}/{row.gamesLost})
              </span>
            </td>
            <td className="border-2 border-line p-2 text-lg">
              {signed(row.pointDiff)}
              <span className="text-sub text-base">
                {" "}
                ({row.pointsFor}/{row.pointsAgainst})
              </span>
            </td>
          </tr>
        ))}
      </tbody>
    </table>
    {matchResults.length > 0 && (
      <div className="space-y-2 pt-2">
        <div className="text-base font-extrabold">対戦結果</div>
        <table className="w-full border-2 border-line border-collapse">
          <thead>
            <tr className="bg-bg">
              <th className="border-2 border-line p-2 text-base text-left whitespace-nowrap">
                対戦
              </th>
              {Array.from({ length: bestOf }, (_, index) => (
                <th key={index} className="border-2 border-line p-2 text-base whitespace-nowrap">
                  G{index + 1}
                </th>
              ))}
              <th className="border-2 border-line p-2 text-base whitespace-nowrap">セット</th>
            </tr>
          </thead>
          <tbody>
            {matchResults.map((match) => (
              <tr key={match.id}>
                <td className="border-2 border-line p-2 text-base">
                  <span className={match.winner === "L" ? "font-extrabold" : "text-sub"}>
                    {match.leftName}
                  </span>
                  <span className="text-sub"> vs </span>
                  <span className={match.winner === "R" ? "font-extrabold" : "text-sub"}>
                    {match.rightName}
                  </span>
                </td>
                {Array.from({ length: bestOf }, (_, gameIndex) => {
                  const game = match.games[gameIndex];
                  if (!game) {
                    return (
                      <td
                        key={gameIndex}
                        className="border-2 border-line p-2 text-base text-center text-sub"
                      >
                        -
                      </td>
                    );
                  }
                  return (
                    <td
                      key={gameIndex}
                      className="border-2 border-line p-2 text-base text-center whitespace-nowrap"
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
                <td className="border-2 border-line p-2 text-base text-center font-bold whitespace-nowrap">
                  {match.leftWins}-{match.rightWins}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    )}
  </>
);

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);
