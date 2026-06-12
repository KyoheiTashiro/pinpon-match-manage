import { useState } from 'react';
import { useAppStore } from '../../store/useAppStore';
import type { BestOf, Format } from '../../store/types';

export const useCreateTournamentForm = (onCreated: (id: string) => void) => {
  const createTournament = useAppStore((s) => s.createTournament);
  const [creating, setCreating] = useState(false);
  const [name, setName] = useState('');
  const [format, setFormat] = useState<Format>('singles');
  const [bestOf, setBestOf] = useState<BestOf>(3);
  const [date, setDate] = useState(() => new Date().toISOString().slice(0, 10));

  const submit = () => {
    if (!name.trim()) return;
    const id = createTournament(name.trim(), format, date, bestOf);
    onCreated(id);
  };

  return {
    creating,
    setCreating,
    name,
    setName,
    format,
    setFormat,
    bestOf,
    setBestOf,
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
