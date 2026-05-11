import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { Format } from '../../store/types';

export const useShareApp = () => {
  const [shareMsg, setShareMsg] = useState<string | null>(null);

  const share = async () => {
    const url = window.location.origin + window.location.pathname;
    const data = {
      title: '卓ログ',
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

  return { share, shareMsg };
};

export const useCreateTournamentForm = (onCreated: (id: string) => void) => {
  const createTournament = useAppStore((s) => s.createTournament);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<Format>('singles');
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const submit = () => {
    if (!name.trim()) return;
    const id = createTournament(name.trim(), format, date);
    onCreated(id);
  };

  return {
    creating,
    setCreating,
    name,
    setName,
    format,
    setFormat,
    date,
    setDate,
    submit,
  };
};

export const useSortedTournaments = () => {
  const tournaments = useAppStore((s) => s.tournaments);
  return Object.values(tournaments).sort(
    (a, b) =>
      (b.date ?? '').localeCompare(a.date ?? '') ||
      b.createdAt.localeCompare(a.createdAt),
  );
};
