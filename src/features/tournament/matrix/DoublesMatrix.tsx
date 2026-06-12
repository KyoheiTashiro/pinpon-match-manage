import { useState } from 'react';
import { useAppStore } from '../../../store/useAppStore';
import { BigButton } from '../../../components/ui/BigButton';
import { useImageCapture } from '../../../lib/useImageCapture';
import { matchSummary, winsNeededForBestOf } from '../../../domain/match';
import { MatchModal } from './components/MatchModal';
import { PairSelect } from './components/PairSelect';
import { sideMembers, useDoublesForm, useMatrixData } from './hooks';

export const DoublesMatrix = ({ tournamentId }: { tournamentId: string }) => {
  const { tournament, participants, list, ps } = useMatrixData(tournamentId);
  const addManualMatch = useAppStore((s) => s.addManualMatch);
  const { ref, saving, save } = useImageCapture('対戦表', tournament?.name);
  const { form, setForm, canAdd, reset } = useDoublesForm();
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);

  if (!tournament) return null;

  const wins = winsNeededForBestOf(tournament.bestOf);

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
                value={form.l1}
                onChange={(v) => setForm((f) => ({ ...f, l1: v }))}
                options={ps}
                exclude={[form.l2, form.r1, form.r2]}
                label="左1"
              />
              <PairSelect
                value={form.l2}
                onChange={(v) => setForm((f) => ({ ...f, l2: v }))}
                options={ps}
                exclude={[form.l1, form.r1, form.r2]}
                label="左2"
              />
            </div>
            <div className="space-y-2">
              <span className="font-bold">右ペア</span>
              <PairSelect
                value={form.r1}
                onChange={(v) => setForm((f) => ({ ...f, r1: v }))}
                options={ps}
                exclude={[form.l1, form.l2, form.r2]}
                label="右1"
              />
              <PairSelect
                value={form.r2}
                onChange={(v) => setForm((f) => ({ ...f, r2: v }))}
                options={ps}
                exclude={[form.l1, form.l2, form.r1]}
                label="右2"
              />
            </div>
          </div>
          <BigButton
            disabled={!canAdd}
            onClick={() => {
              const id = addManualMatch(
                tournamentId,
                { kind: 'pair', memberIds: [form.l1, form.l2] },
                { kind: 'pair', memberIds: [form.r1, form.r2] },
              );
              reset();
              setOpenMatchId(id);
            }}
          >
            試合を追加して入力へ
          </BigButton>
        </div>
      )}

      <div ref={ref} className="bg-white p-3 space-y-2">
      <div className="border-b-2 border-line pb-2">
        <div className="text-xl font-extrabold">{tournament.name}</div>
        <div className="text-sm text-sub">{tournament.date}</div>
      </div>
      <ul className="divide-y-2 divide-line border-2 border-line rounded-2xl overflow-hidden">
        {list.length === 0 ? (
          <li className="p-4 text-sub text-base">まだ試合がありません。</li>
        ) : (
          list.map((m) => {
            const sm = matchSummary(m.games, wins);
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
      </div>

      {ps.length >= 4 && list.length > 0 && (
        <BigButton onClick={save} disabled={saving}>
          {saving ? '保存中…' : '対戦表の画像を保存'}
        </BigButton>
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
