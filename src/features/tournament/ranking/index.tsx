import { useParams } from 'react-router-dom';
import { BigButton } from '../../../components/ui/BigButton';
import { useImageCapture } from '../../../lib/useImageCapture';
import { useRankingRows } from './hooks';

export const RankingTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  if (!tournamentId) return null;
  return <RankingView tournamentId={tournamentId} />;
};

const RankingView = ({ tournamentId }: { tournamentId: string }) => {
  const { rows, tournament } = useRankingRows(tournamentId);
  const { ref, saving, save } = useImageCapture('順位', tournament?.name);

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">順位</h2>

      {rows.length === 0 ? (
        <p className="text-sub">参加者を登録してください。</p>
      ) : (
        <>
        <div className="overflow-x-auto">
        <div ref={ref} className="bg-white p-3 space-y-2 inline-block align-top min-w-full">
        <div className="border-b-2 border-line pb-2">
          <div className="text-xl font-extrabold">{tournament.name}</div>
          <div className="text-sm text-sub">{tournament.date}</div>
        </div>
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
        </div>
        <BigButton onClick={save} disabled={saving}>
          {saving ? '保存中…' : '順位表の画像を保存'}
        </BigButton>
        </>
      )}
    </div>
  );
};

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);
