import { useMemo } from "react";
import { useAppStore } from "@/store/useAppStore";
import type { Match, MatchSide } from "@/store/types";

export const sideMembers = (side: MatchSide) =>
  side.kind === "single" ? [side.participantId] : [...side.memberIds];

export const involvesSingle = (match: Match, id: string) =>
  (match.leftSide.kind === "single" && match.leftSide.participantId === id) ||
  (match.rightSide.kind === "single" && match.rightSide.participantId === id);

export const useMatrix = (tournamentId: string) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const participants = useAppStore((state) => state.participants);
  const matches = useAppStore((state) => state.matches);

  const matchList = useMemo(
    () => tournament?.matchIds.map((id) => matches[id]).filter(Boolean) ?? [],
    [tournament?.matchIds, matches],
  );
  const players = tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  const singlesCellMatch = useMemo(() => {
    const map = new Map<string, Match>();
    for (const match of matchList) {
      if (match.leftSide.kind !== "single" || match.rightSide.kind !== "single") continue;
      const leftId = match.leftSide.participantId;
      const rightId = match.rightSide.participantId;
      const key = [leftId, rightId].sort().join("|");
      map.set(key, match);
    }
    return map;
  }, [matchList]);

  return {
    tournament,
    participants,
    matchList,
    players,
    singlesCellMatch,
  };
};
