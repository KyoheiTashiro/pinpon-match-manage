import { useMemo, useState } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Match, MatchSide } from "@/store/types";

export const sideMembers = (s: MatchSide) =>
  s.kind === "single" ? [s.participantId] : [...s.memberIds];

export const involvesSingle = (m: Match, id: string) =>
  (m.leftSide.kind === "single" && m.leftSide.participantId === id) ||
  (m.rightSide.kind === "single" && m.rightSide.participantId === id);

const emptyDoublesForm = { l1: "", l2: "", r1: "", r2: "" };

export const useMatrix = (tournamentId: string) => {
  const tournament = useAppStore((s) => s.tournaments[tournamentId]);
  const participants = useAppStore((s) => s.participants);
  const matches = useAppStore((s) => s.matches);

  const list = useMemo(
    () => tournament?.matchIds.map((id) => matches[id]).filter(Boolean) ?? [],
    [tournament?.matchIds, matches],
  );
  const ps = tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  const singlesCellMatch = useMemo(() => {
    const map = new Map<string, Match>();
    for (const m of list) {
      if (m.leftSide.kind !== "single" || m.rightSide.kind !== "single") continue;
      const a = m.leftSide.participantId;
      const b = m.rightSide.participantId;
      const key = [a, b].sort().join("|");
      map.set(key, m);
    }
    return map;
  }, [list]);

  const [form, setForm] = useState(emptyDoublesForm);
  const canAdd =
    !!form.l1 && !!form.l2 && !!form.r1 && !!form.r2 && new Set(Object.values(form)).size === 4;

  return {
    tournament,
    participants,
    list,
    ps,
    singlesCellMatch,
    form,
    setForm,
    canAdd,
    reset: () => setForm(emptyDoublesForm),
  };
};
