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
        <div className="border-line text-sub rounded-2xl border-2 p-4 text-center text-base">
          データがありません
        </div>
      </>
    );
  }
  return (
    <>
      <div className="text-base font-extrabold">順位</div>
      <div className="border-line overflow-hidden rounded-2xl border-2">
        <table className="w-full border-collapse">
          <thead>
            <tr className="bg-bg">
              <th className="border-line border-r-2 border-b-2 p-2 text-base whitespace-nowrap">
                順位
              </th>
              <th className="border-line border-r-2 border-b-2 p-2 text-left text-base whitespace-nowrap">
                名前
              </th>
              <th className="border-line border-r-2 border-b-2 p-2 text-base whitespace-nowrap">
                試合
              </th>
              <th className="border-line border-r-2 border-b-2 p-2 text-base whitespace-nowrap">
                勝
              </th>
              <th className="border-line border-r-2 border-b-2 p-2 text-base whitespace-nowrap">
                敗
              </th>
              <th className="border-line border-r-2 border-b-2 p-2 text-base whitespace-nowrap">
                G差
              </th>
              <th className="border-line border-b-2 p-2 text-base whitespace-nowrap">点差</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((row, rowIndex) => {
              const rowBorder = rowIndex < rows.length - 1 ? "border-b-2" : "";
              return (
                <tr key={row.participantId} className="text-center">
                  <td className={`border-line border-r-2 p-2 text-2xl font-extrabold ${rowBorder}`}>
                    {row.rank}
                  </td>
                  <td
                    className={`border-line border-r-2 p-2 text-left text-lg font-bold whitespace-nowrap ${rowBorder}`}
                  >
                    {row.name}
                  </td>
                  <td className={`border-line border-r-2 p-2 text-lg ${rowBorder}`}>
                    {row.played}
                  </td>
                  <td
                    className={`border-line text-success border-r-2 p-2 text-lg font-bold ${rowBorder}`}
                  >
                    {row.wins}
                  </td>
                  <td
                    className={`border-line text-danger border-r-2 p-2 text-lg font-bold ${rowBorder}`}
                  >
                    {row.losses}
                  </td>
                  <td className={`border-line border-r-2 p-2 text-lg ${rowBorder}`}>
                    {signed(row.gameDiff)}
                    <span className="text-sub text-base">
                      {" "}
                      ({row.gamesWon}/{row.gamesLost})
                    </span>
                  </td>
                  <td className={`border-line p-2 text-lg ${rowBorder}`}>
                    {signed(row.pointDiff)}
                    <span className="text-sub text-base">
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
