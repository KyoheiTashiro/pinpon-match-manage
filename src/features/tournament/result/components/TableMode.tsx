import { SIDE } from "@/domain/match";
import { useResult } from "@/features/tournament/result/hooks";
import type { MatchResultRow } from "@/features/tournament/result/hooks";

// ----- 点数表モード -----
type Props = {
  rows: ReturnType<typeof useResult>["rows"];
  matchResults: MatchResultRow[];
  bestOf: number;
};

export const TableMode = ({ rows, matchResults, bestOf }: Props) => (
  <>
    <div className="text-base font-extrabold">順位</div>
    <table className="w-full border-collapse border-2 border-line">
      <thead>
        <tr className="bg-bg">
          <th className="whitespace-nowrap border-2 border-line p-2 text-base">順位</th>
          <th className="whitespace-nowrap border-2 border-line p-2 text-left text-base">名前</th>
          <th className="whitespace-nowrap border-2 border-line p-2 text-base">試合</th>
          <th className="whitespace-nowrap border-2 border-line p-2 text-base">勝</th>
          <th className="whitespace-nowrap border-2 border-line p-2 text-base">敗</th>
          <th className="whitespace-nowrap border-2 border-line p-2 text-base">G差</th>
          <th className="whitespace-nowrap border-2 border-line p-2 text-base">点差</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((row) => (
          <tr key={row.participantId} className="text-center">
            <td className="border-2 border-line p-2 text-2xl font-extrabold">{row.rank}</td>
            <td className="whitespace-nowrap border-2 border-line p-2 text-left text-lg font-bold">
              {row.name}
            </td>
            <td className="border-2 border-line p-2 text-lg">{row.played}</td>
            <td className="border-2 border-line p-2 text-lg font-bold text-success">{row.wins}</td>
            <td className="border-2 border-line p-2 text-lg font-bold text-danger">{row.losses}</td>
            <td className="border-2 border-line p-2 text-lg">
              {signed(row.gameDiff)}
              <span className="text-base text-sub">
                {" "}
                ({row.gamesWon}/{row.gamesLost})
              </span>
            </td>
            <td className="border-2 border-line p-2 text-lg">
              {signed(row.pointDiff)}
              <span className="text-base text-sub">
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
        <table className="w-full border-collapse border-2 border-line">
          <thead>
            <tr className="bg-bg">
              <th className="whitespace-nowrap border-2 border-line p-2 text-left text-base">
                対戦
              </th>
              {Array.from({ length: bestOf }, (_, index) => (
                <th key={index} className="whitespace-nowrap border-2 border-line p-2 text-base">
                  G{index + 1}
                </th>
              ))}
              <th className="whitespace-nowrap border-2 border-line p-2 text-base">セット</th>
            </tr>
          </thead>
          <tbody>
            {matchResults.map((match) => (
              <tr key={match.id}>
                <td className="border-2 border-line p-2 text-base">
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
                        className="border-2 border-line p-2 text-center text-base text-sub"
                      >
                        -
                      </td>
                    );
                  }
                  return (
                    <td
                      key={gameIndex}
                      className="whitespace-nowrap border-2 border-line p-2 text-center text-base"
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
                <td className="whitespace-nowrap border-2 border-line p-2 text-center text-base font-bold">
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
