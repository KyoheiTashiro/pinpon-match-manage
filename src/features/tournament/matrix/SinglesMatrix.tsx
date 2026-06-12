import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { BigButton } from '../../../components/ui/BigButton';
import { useImageCapture } from '../../../lib/useImageCapture';
import { matchSummary, winsNeededForBestOf } from '../../../domain/match';
import { MatchModal } from './components/MatchModal';
import { involvesSingle, useMatrix } from './hooks';

export const SinglesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, ps, singlesCellMatch } =
    useMatrix(tournamentId);

  const { ref, saving, save } = useImageCapture('対戦表', tournament?.name);
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  if (!tournament) return null;

  const wins = winsNeededForBestOf(tournament.bestOf);

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表</h2>

      {ps.length < 2 ? (
        <p className="text-sub">参加者を2人以上 登録してください。</p>
      ) : (
        <>
          <div className="text-sub text-base bg-bg border-2 border-line rounded-xl px-3 py-2">
            <h3 className="font-bold mb-1">使い方</h3>
            <ul className="list-disc list-inside space-y-0.5">
              <li>マスをタップ → 点数入力</li>
            </ul>
          </div>
          <div className="overflow-x-auto">
          <div ref={ref} className="bg-white p-3 space-y-2 inline-block align-top min-w-full">
          <div className="border-b-2 border-line pb-2">
            <div className="text-xl font-extrabold">{tournament.name}</div>
            <div className="text-sm text-sub">{tournament.date}</div>
          </div>
          <table className="matrix border-collapse w-full">
            <thead>
              <tr>
                <th className="sticky left-0 bg-white z-10 border-2 border-line p-2 min-w-cell" aria-label="対戦表の行列ヘッダー"></th>
                {ps.map((p) => (
                  <th
                    key={p.id}
                    className="border-2 border-line p-2 text-base font-bold min-w-cell"
                  >
                    {p.name}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ps.map((row) => (
                <tr key={row.id}>
                  <th
                    scope="row"
                    className="sticky left-0 bg-white z-10 border-2 border-line p-2 text-base font-bold text-left whitespace-nowrap"
                  >
                    {row.name}
                  </th>
                  {ps.map((col) => {
                    if (row.id === col.id) {
                      return (
                        <td
                          key={col.id}
                          className="border-2 border-line bg-bg min-h-cell min-w-cell"
                          aria-label="自分"
                        >
                          <div className="w-full h-16 bg-[repeating-linear-gradient(45deg,#cbd5e1_0_8px,#94a3b8_8px_16px)]" />
                        </td>
                      );
                    }
                    const key = [row.id, col.id].sort().join('|');
                    const m = singlesCellMatch.get(key);
                    if (!m) {
                      return (
                        <td
                          key={col.id}
                          className="border-2 border-dashed border-line text-center text-sub min-h-cell min-w-cell p-1"
                        >
                          <button
                            className="w-full h-full min-h-cell text-base flex flex-col items-center justify-center gap-0.5 cursor-pointer hover:bg-bg active:scale-95 transition"
                            aria-label={`${row.name} 対 ${col.name} 対戦追加`}
                            onClick={() => {
                              const id = useAppStore.getState().addManualMatch(
                                tournamentId,
                                { kind: 'single', participantId: row.id },
                                { kind: 'single', participantId: col.id },
                              );
                              setOpenMatchId(id);
                            }}
                          >
                            <span className="text-2xl leading-none">＋</span>
                            <span className="text-xs leading-none">対戦</span>
                          </button>
                        </td>
                      );
                    }
                    const sm = matchSummary(m.games, wins);
                    const rowIsLeft = involvesSingle(m, row.id) && m.leftSide.kind === 'single' && m.leftSide.participantId === row.id;
                    const rowWins = rowIsLeft ? sm.leftWins : sm.rightWins;
                    const colWins = rowIsLeft ? sm.rightWins : sm.leftWins;
                    const finished = sm.finished;
                    const rowWon = finished && (rowIsLeft ? sm.winner === 'L' : sm.winner === 'R');
                    const rowLost = finished && !rowWon;
                    const hasScore = finished || m.games.length > 0;
                    return (
                      <td
                        key={col.id}
                        className={`border-2 ${hasScore ? 'border-line' : 'border-dashed border-line'} text-center min-h-cell min-w-cell p-0 ${
                          rowWon ? 'bg-winBg' : rowLost ? 'bg-loseBg' : ''
                        }`}
                      >
                        <button
                          onClick={() => setOpenMatchId(m.id)}
                          className="relative w-full h-full min-h-cell text-lg font-extrabold p-2 cursor-pointer hover:bg-bg active:scale-95 transition"
                          aria-label={`${row.name} 対 ${col.name} ${rowWins}-${colWins} 編集`}
                        >
                          {hasScore ? (
                            <span>
                              {rowWins}-{colWins}
                              {finished && (
                                <span className="block text-sm">
                                  {rowWon ? '勝' : '負'}
                                </span>
                              )}
                            </span>
                          ) : (
                            <span className="flex flex-col items-center justify-center gap-0.5 text-sub">
                              <span className="text-2xl leading-none">＋</span>
                              <span className="text-xs leading-none">点数入力</span>
                            </span>
                          )}
                        </button>
                      </td>
                    );
                  })}
                </tr>
              ))}
            </tbody>
          </table>
          </div>
          </div>
          <BigButton onClick={save} disabled={saving}>
            {saving ? '保存中…' : '対戦表の画像を保存'}
          </BigButton>
        </>
      )}

      {openMatchId && (
        <MatchModal
          matchId={openMatchId}
          participants={participants}
          onClose={() => setOpenMatchId(null)}
        />
      )}
    </div>
  );
};
