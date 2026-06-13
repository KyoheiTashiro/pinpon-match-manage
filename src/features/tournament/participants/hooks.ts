import { useAppStore } from "@/store/useAppStore";

export const useParticipants = (tournamentId: string) => {
  const tournament = useAppStore((state) => state.tournaments[tournamentId]);
  const participants = useAppStore((state) => state.participants);
  const addParticipant = useAppStore((state) => state.addParticipant);
  const updateParticipant = useAppStore((state) => state.updateParticipant);
  const removeParticipant = useAppStore((state) => state.removeParticipant);

  const participantList =
    tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  return {
    list: participantList,
    add: (name: string) => addParticipant(tournamentId, name),
    rename: (id: string, name: string) => updateParticipant(id, { name }),
    remove: (id: string) => removeParticipant(tournamentId, id),
  };
};
