import { useMemo, useState } from 'react';
import { useParams } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { BigButton } from '../components/BigButton';
import { MatchModal } from '../components/MatchModal';
import { matchSummary } from '../domain/match';
import type { Match, MatchSide } from '../store/types';

const sideMembers = (s: MatchSide) =>
  s.kind === 'single' ? [s.participantId] : [...s.memberIds];

const involvesSingle = (m: Match, id: string) =>
  (m.leftSide.kind === 'single' && m.leftSide.participantId === id) ||
  (m.rightSide.kind === 'single' && m.rightSide.participantId === id);

export const MatrixTab = () => {
  const { tournamentId } = useParams<{ tournamentId: string }>();
  const tournament = useAppStore((s) =>
    tournamentId ? s.tournaments[tournamentId] : undefined,
  );
  const participants = useAppStore((s) => s.participants);
  const matches = useAppStore((s) => s.matches);
  const addManualMatch = useAppStore((s) => s.addManualMatch);

  const [openMatchId, setOpenMatchId] = useState<string | null>(null);
  const [doublesForm, setDoublesForm] = useState({
    l1: '',
    l2: '',
    r1: '',
    r2: '',
  });

  const list = tournament?.matchIds.map((id) => matches[id]).filter(Boolean) ?? [];
  const ps = tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  const singlesCellMatch = useMemo(() => {
    const map = new Map<string, Match>();
    for (const m of list) {
      if (m.leftSide.kind !== 'single' || m.rightSide.kind !== 'single') continue;
      const a = m.leftSide.participantId;
      const b = m.rightSide.participantId;
      const key = [a, b].sort().join('|');
      map.set(key, m);
    }
    return map;
  }, [list]);

  if (!tournament || !tournamentId) return null;

  if (tournament.format === 'singles') {
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
            <table className="matrix border-collapse w-full">
              <thead>
                <tr>
                  <th className="sticky left-0 bg-white z-10 border-2 border-line p-2 min-w-cell"></th>
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
                      const sm = matchSummary(m.games);
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
                              <>
                                <span className="absolute top-1 right-1 text-xs text-sub" aria-hidden>✎</span>
                                <span>
                                  {rowWins}-{colWins}
                                  {finished && (
                                    <span className="block text-sm">
                                      {rowWon ? '勝' : '負'}
                                    </span>
                                  )}
                                </span>
                              </>
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
  }

  // ダブルス: 手動追加方式
  const canAdd =
    doublesForm.l1 &&
    doublesForm.l2 &&
    doublesForm.r1 &&
    doublesForm.r2 &&
    new Set(Object.values(doublesForm)).size === 4;

  return (
    <div className="space-y-4">
      <h2 className="text-xl font-extrabold">対戦表（ダブルス）</h2>

      {ps.length < 4 ? (
        <p className="text-sub">参加者を4人以上 登録してください。</p>
      ) : (
        <div className="border-4 border-primary rounded-2xl p-4 space-y-3">
          <h3 className="text-lg font-extrabold">試合を追加</h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div className="space-y-2">
              <span className="font-bold">左ペア</span>
              <PairSelect
                value={doublesForm.l1}
                onChange={(v) => setDoublesForm((f) => ({ ...f, l1: v }))}
                options={ps}
                exclude={[doublesForm.l2, doublesForm.r1, doublesForm.r2]}
                label="左1"
              />
              <PairSelect
                value={doublesForm.l2}
                onChange={(v) => setDoublesForm((f) => ({ ...f, l2: v }))}
                options={ps}
                exclude={[doublesForm.l1, doublesForm.r1, doublesForm.r2]}
                label="左2"
              />
            </div>
            <div className="space-y-2">
              <span className="font-bold">右ペア</span>
              <PairSelect
                value={doublesForm.r1}
                onChange={(v) => setDoublesForm((f) => ({ ...f, r1: v }))}
                options={ps}
                exclude={[doublesForm.l1, doublesForm.l2, doublesForm.r2]}
                label="右1"
              />
              <PairSelect
                value={doublesForm.r2}
                onChange={(v) => setDoublesForm((f) => ({ ...f, r2: v }))}
                options={ps}
                exclude={[doublesForm.l1, doublesForm.l2, doublesForm.r1]}
                label="右2"
              />
            </div>
          </div>
          <BigButton
            disabled={!canAdd}
            onClick={() => {
              const id = addManualMatch(
                tournamentId,
                { kind: 'pair', memberIds: [doublesForm.l1, doublesForm.l2] },
                { kind: 'pair', memberIds: [doublesForm.r1, doublesForm.r2] },
              );
              setDoublesForm({ l1: '', l2: '', r1: '', r2: '' });
              setOpenMatchId(id);
            }}
          >
            試合を追加して入力へ
          </BigButton>
        </div>
      )}

      <ul className="divide-y-2 divide-line border-2 border-line rounded-2xl overflow-hidden">
        {list.length === 0 ? (
          <li className="p-4 text-sub text-base">まだ試合がありません。</li>
        ) : (
          list.map((m) => {
            const sm = matchSummary(m.games);
            const lname = sideMembers(m.leftSide).map((id) => participants[id]?.name ?? '?').join(' / ');
            const rname = sideMembers(m.rightSide).map((id) => participants[id]?.name ?? '?').join(' / ');
            return (
              <li key={m.id}>
                <button
                  onClick={() => setOpenMatchId(m.id)}
                  className="w-full text-left p-3 min-h-[64px] hover:bg-bg flex items-center justify-between gap-3"
                >
                  <span className="text-lg font-bold flex-1">
                    {lname} <span className="text-sub">対</span> {rname}
                  </span>
                  <span className="text-xl font-extrabold flex flex-col items-end">
                    <span>{sm.leftWins}-{sm.rightWins}</span>
                    {sm.finished && (
                      <span className="text-sm text-success">
                        {sm.winner === 'L' ? lname : rname} の勝ち
                      </span>
                    )}
                  </span>
                </button>
              </li>
            );
          })
        )}
      </ul>

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

const PairSelect = ({
  value,
  onChange,
  options,
  exclude,
  label,
}: {
  value: string;
  onChange: (v: string) => void;
  options: { id: string; name: string }[];
  exclude: string[];
  label: string;
}) => (
  <label className="flex flex-col gap-1">
    <span className="font-bold text-base">{label}</span>
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="min-h-input border-2 border-line rounded-xl px-3 text-lg bg-white"
    >
      <option value="">— 選んでください —</option>
      {options
        .filter((p) => !exclude.includes(p.id))
        .map((p) => (
          <option key={p.id} value={p.id}>{p.name}</option>
        ))}
    </select>
  </label>
);
