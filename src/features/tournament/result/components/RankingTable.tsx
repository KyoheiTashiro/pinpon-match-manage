import { useResult } from "@/features/tournament/result/hooks";

type Props = {
  rows: ReturnType<typeof useResult>["rows"];
};

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

export const RankingTable = ({ rows }: Props) => (
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
  </>
);
