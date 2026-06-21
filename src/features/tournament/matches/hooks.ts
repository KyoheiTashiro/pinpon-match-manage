import { matchesOf } from "@/store/selectors";
import { useAppStore } from "@/store/useAppStore";
import { useMemo, useState } from "react";

export { sideMembers, sideName } from "@/domain/side";

export const useMatches = (tournamentId: string) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const participants = useAppStore((state) => state.participants);
  const matches = useAppStore((state) => state.matches);

  const matchList = useMemo(() => matchesOf(matches, tournamentId), [matches, tournamentId]);
  const players = useMemo(
    () => tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [],
    [tournament?.participantIds, participants],
  );

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
