import { useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { computeRanking } from '../domain/ranking';

export const RankingTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const tournament = useAppStore((s) =>
    tournamentId ? s.tournaments[tournamentId] : undefined,
  );
  const matches = useAppStore((s) => s.matches);
  const participants = useAppStore((s) => s.participants);

  const rows = useMemo(() => {
    if (!tournament) return [];
    const names: Record<string, string> = {};
    for (const id of tournament.participantIds) {
      const p = participants[id];
      if (p) names[id] = p.name;
    }
    const ms = tournament.matchIds.map((id) => matches[id]).filter(Boolean);
    return computeRanking(ms, names);
  }, [tournament, matches, participants]);

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">順位</h2>

      {rows.length === 0 ? (
        <p className="text-sub">参加者を登録してください。</p>
      ) : (
        <div className="overflow-x-auto">
          <table className="w-full border-2 border-line border-collapse">
            <thead>
              <tr className="bg-bg">
                <th className="border-2 border-line p-2 text-base">順位</th>
                <th className="border-2 border-line p-2 text-base text-left">名前</th>
                <th className="border-2 border-line p-2 text-base">試合</th>
                <th className="border-2 border-line p-2 text-base">勝</th>
                <th className="border-2 border-line p-2 text-base">敗</th>
                <th className="border-2 border-line p-2 text-base">ゲーム差</th>
                <th className="border-2 border-line p-2 text-base">点差</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.participantId} className="text-center">
                  <td className="border-2 border-line p-2 text-2xl font-extrabold">
                    {r.rank}
                  </td>
                  <td className="border-2 border-line p-2 text-lg font-bold text-left">
                    {r.name}
                  </td>
                  <td className="border-2 border-line p-2 text-lg">{r.played}</td>
                  <td className="border-2 border-line p-2 text-lg text-success font-bold">
                    {r.wins}
                  </td>
                  <td className="border-2 border-line p-2 text-lg text-danger font-bold">
                    {r.losses}
                  </td>
                  <td className="border-2 border-line p-2 text-lg">
                    {signed(r.gameDiff)}
                    <span className="text-sub text-base"> ({r.gamesWon}/{r.gamesLost})</span>
                  </td>
                  <td className="border-2 border-line p-2 text-lg">
                    {signed(r.pointDiff)}
                    <span className="text-sub text-base"> ({r.pointsFor}/{r.pointsAgainst})</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);
