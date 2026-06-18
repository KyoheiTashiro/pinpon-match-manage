import { useResult } from "@/features/tournament/result/hooks";

type Props = {
  rows: ReturnType<typeof useResult>["rows"];
};

const signed = (value: number) => (value > 0 ? `+${value}` : `${value}`);

export const RankingTable = ({ rows }: Props) => {
  if (rows.length === 0) {
    return (
      <>
        <div className="text-base font-extrabold">順位</div>
        <div className="rounded-2xl border-2 border-line p-4 text-center text-base text-sub">
          データがありません
        </div>
      </>
    );
  }
  return (
    <>
      <div className="text-base font-extrabold">順位</div>
      <div className="overflow-hidden rounded-2xl border-2 border-line">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg">
              <th className="whitespace-nowrap border-b-2 border-r-2 border-line p-2 text-base">
                順位
              </th>
              <th className="whitespace-nowrap border-b-2 border-r-2 border-line p-2 text-left text-base">
                名前
              </th>
              <th className="whitespace-nowrap border-b-2 border-r-2 border-line p-2 text-base">
                試合
              </th>
              <th className="whitespace-nowrap border-b-2 border-r-2 border-line p-2 text-base">
                勝
              </th>
              <th className="whitespace-nowrap border-b-2 border-r-2 border-line p-2 text-base">
                敗
              </th>
              <th className="whitespace-nowrap border-b-2 border-r-2 border-line p-2 text-base">
                G差
              </th>
              <th className="whitespace-nowrap border-b-2 border-line p-2 text-base">点差</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowBorder = rowIndex < rows.length - 1 ? "border-b-2" : "";
              return (
                <tr key={row.participantId} className="text-center">
                  <td className={`border-r-2 border-line p-2 text-2xl font-extrabold ${rowBorder}`}>
                    {row.rank}
                  </td>
                  <td
                    className={`whitespace-nowrap border-r-2 border-line p-2 text-left text-lg font-bold ${rowBorder}`}
                  >
                    {row.name}
                  </td>
                  <td className={`border-r-2 border-line p-2 text-lg ${rowBorder}`}>
                    {row.played}
                  </td>
                  <td
                    className={`border-r-2 border-line p-2 text-lg font-bold text-success ${rowBorder}`}
                  >
                    {row.wins}
                  </td>
                  <td
                    className={`border-r-2 border-line p-2 text-lg font-bold text-danger ${rowBorder}`}
                  >
                    {row.losses}
                  </td>
                  <td className={`border-r-2 border-line p-2 text-lg ${rowBorder}`}>
                    {signed(row.gameDiff)}
                    <span className="text-base text-sub">
                      {" "}
                      ({row.gamesWon}/{row.gamesLost})
                    </span>
                  </td>
                  <td className={`border-line p-2 text-lg ${rowBorder}`}>
                    {signed(row.pointDiff)}
                    <span className="text-base text-sub">
                      {" "}
                      ({row.pointsFor}/{row.pointsAgainst})
                    </span>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </>
  );
};
