import { useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { BigButton } from '../components/BigButton';
import { computeRanking } from '../domain/ranking';
import { saveAsImage } from '../lib/saveAsImage';

export const RankingTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const tournament = useAppStore((s) =>
    tournamentId ? s.tournaments[tournamentId] : undefined,
  );
  const matches = useAppStore((s) => s.matches);
  const participants = useAppStore((s) => s.participants);

  const captureRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

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

  const handleSaveImage = async () => {
    if (!captureRef.current || !tournament) return;
    setSaving(true);
    try {
      const date = new Date().toISOString().slice(0, 10);
      const filename = `順位_${tournament.name}_${date}.png`;
      await saveAsImage(captureRef.current, filename);
    } catch (e) {
      console.error(e);
      alert('画像の保存に失敗しました。');
    } finally {
      setSaving(false);
    }
  };

  if (!tournament) return null;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">順位</h2>

      {rows.length === 0 ? (
        <p className="text-sub">参加者を登録してください。</p>
      ) : (
        <>
        <div className="overflow-x-auto">
        <div ref={captureRef} className="bg-white p-3 space-y-2 inline-block align-top min-w-full">
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
        <BigButton onClick={handleSaveImage} disabled={saving}>
          {saving ? '保存中…' : '順位表の画像を保存'}
        </BigButton>
        </>
      )}
    </div>
  );
};

const signed = (n: number) => (n > 0 ? `+${n}` : `${n}`);
