import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAppStore } from '../store/useAppStore';
import { BigButton } from '../components/BigButton';
import { ConfirmDialog } from '../components/ConfirmDialog';
import { FontSizeToggle } from '../components/FontSizeToggle';
import { formatDate } from '../lib/time';
import type { Format } from '../store/types';

export const TournamentList = () => {
  const navigate = useNavigate();
  const tournaments = useAppStore((s) => s.tournaments);
  const createTournament = useAppStore((s) => s.createTournament);
  const resetAll = useAppStore((s) => s.resetAll);

  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<Format>('singles');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));
  const [confirmReset, setConfirmReset] = useState(false);
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const share = async () => {
    const url = window.location.origin + window.location.pathname;
    const data = {
      title: 'ピンポン 対戦管理',
      text: '卓球の対戦管理アプリ',
      url,
    };
    const canNativeShare =
      typeof navigator !== 'undefined' &&
      typeof navigator.share === 'function' &&
      (typeof navigator.canShare !== 'function' || navigator.canShare(data));
    if (canNativeShare) {
      try {
        await navigator.share(data);
        return;
      } catch (e) {
        if ((e as Error)?.name === 'AbortError') return;
      }
    }
    try {
      await navigator.clipboard.writeText(url);
      setShareMsg('URLをコピーしました');
    } catch {
      setShareMsg('コピー失敗。手動でコピー: ' + url);
    }
    window.setTimeout(() => setShareMsg(null), 2500);
  };

  const list = Object.values(tournaments).sort(
    (a, b) => (b.date ?? '').localeCompare(a.date ?? '') ||
      b.createdAt.localeCompare(a.createdAt),
  );

  const submit = () => {
    if (!name.trim()) return;
    const id = createTournament(name.trim(), format, date);
    navigate(`/t/${id}/participants`);
  };

  return (
    <div className="min-h-screen bg-white text-ink">
      <header className="bg-primary text-white p-4 flex items-center justify-between flex-wrap gap-3">
        <h1 className="text-2xl font-extrabold">ピンポン 対戦管理</h1>
        <FontSizeToggle />
      </header>

      <main className="max-w-3xl mx-auto p-4 space-y-6">
        {!creating ? (
          <BigButton variant="primary" className="w-full !min-h-[72px] text-xl" onClick={() => setCreating(true)}>
            ＋ あたらしい大会をつくる
          </BigButton>
        ) : (
          <div className="border-4 border-primary rounded-2xl p-4 space-y-4">
            <h2 className="text-xl font-extrabold">新しい大会</h2>
            <label className="flex flex-col gap-1">
              <span className="font-bold">大会名</span>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="例: 春の大会"
                className="min-h-input border-2 border-line rounded-xl px-3 text-lg"
              />
            </label>
            <fieldset className="flex flex-col gap-2">
              <legend className="font-bold mb-1">形式</legend>
              <div className="flex gap-3 flex-wrap">
                {(['singles', 'doubles'] as Format[]).map((f) => (
                  <label
                    key={f}
                    className={`flex items-center gap-2 px-4 min-h-btn rounded-xl border-2 cursor-pointer ${
                      format === f
                        ? 'bg-primary text-white border-primary'
                        : 'bg-white text-ink border-line'
                    }`}
                  >
                    <input
                      type="radio"
                      name="format"
                      checked={format === f}
                      onChange={() => setFormat(f)}
                      className="w-5 h-5"
                    />
                    <span className="text-lg font-bold">
                      {f === 'singles' ? 'シングルス' : 'ダブルス'}
                    </span>
                  </label>
                ))}
              </div>
            </fieldset>
            <label className="flex flex-col gap-1">
              <span className="font-bold">開催日</span>
              <input
                type="date"
                value={date}
                onChange={(e) => setDate(e.target.value)}
                className="min-h-input border-2 border-line rounded-xl px-3 text-lg"
              />
            </label>
            <div className="flex gap-3 justify-end flex-wrap">
              <BigButton variant="secondary" onClick={() => setCreating(false)}>キャンセル</BigButton>
              <BigButton variant="primary" onClick={submit} disabled={!name.trim()}>つくる</BigButton>
            </div>
          </div>
        )}

        <section aria-label="大会一覧">
          {list.length === 0 ? (
            <p className="text-base text-sub text-center py-8">
              まだ大会がありません。上のボタンから作成してください。
            </p>
          ) : (
            <ul className="divide-y-2 divide-line border-2 border-line rounded-2xl overflow-hidden">
              {list.map((t) => (
                <li key={t.id}>
                  <button
                    onClick={() => navigate(`/t/${t.id}/participants`)}
                    className="w-full text-left p-4 min-h-[72px] hover:bg-bg flex items-center justify-between gap-3"
                  >
                    <div>
                      <div className="text-xl font-extrabold">{t.name}</div>
                      <div className="text-base text-sub">
                        {formatDate(t.date)} ・ {t.format === 'singles' ? 'シングルス' : 'ダブルス'} ・ {t.participantIds.length}人
                      </div>
                    </div>
                    <span className="text-2xl" aria-hidden>▶</span>
                  </button>
                </li>
              ))}
            </ul>
          )}
        </section>

        <div className="pt-6 border-t-2 border-line space-y-3">
          <BigButton variant="secondary" className="w-full" onClick={share}>
            📤 このアプリを共有
          </BigButton>
          {shareMsg && (
            <p
              role="status"
              aria-live="polite"
              className="text-base text-success font-bold text-center"
            >
              {shareMsg}
            </p>
          )}
        </div>

        <div className="pt-6 border-t-2 border-line">
          <BigButton variant="danger" onClick={() => setConfirmReset(true)}>
            すべてのデータを消す
          </BigButton>
        </div>
      </main>

      <ConfirmDialog
        open={confirmReset}
        title="全データ削除"
        message="すべての大会・参加者・対戦結果を削除します。取り消せません。本当に削除しますか?"
        confirmLabel="すべて消す"
        cancelLabel="やめる"
        destructive
        onConfirm={() => {
          resetAll();
          setConfirmReset(false);
        }}
        onCancel={() => setConfirmReset(false)}
      />
    </div>
  );
};
