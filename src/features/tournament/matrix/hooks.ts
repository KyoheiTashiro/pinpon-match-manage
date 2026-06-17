import { SIDE_KIND, type MatchSide, type Participant } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useMemo, useState } from "react";

export const sideMembers = (side: MatchSide) =>
  side.kind === SIDE_KIND.SINGLE ? [side.participantId] : [...side.memberIds];

export const sideName = (side: MatchSide, participants: Record<string, Participant>) =>
  sideMembers(side)
    .map((id) => participants[id]?.name ?? "?")
    .join(" / ");

export const useMatrix = (tournamentId: string) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const participants = useAppStore((state) => state.participants);
  const matches = useAppStore((state) => state.matches);

  const matchList = useMemo(
    () => tournament?.matchIds.map((id) => matches[id]).filter(Boolean) ?? [],
    [tournament?.matchIds, matches],
  );
  const players = tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  return {
    tournament,
    participants,
    matchList,
    players,
  };
};

export const useTournamentFormat = (tournamentId: string) =>
  useAppStore((state) => state.tournaments[tournamentId]?.format);

export const useMatchModal = () => {
  const [openMatchId, setOpenMatchId] = useState<string | null>(null);
  return {
    openMatchId,
    openMatch: (id: string) => setOpenMatchId(id),
    closeMatch: () => setOpenMatchId(null),
  };
};
