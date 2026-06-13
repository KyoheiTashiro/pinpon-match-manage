import { useAppStore } from "../../../store/useAppStore";

export const useParticipants = (tournamentId: string) => {
  const tournament = useAppStore((s) => s.tournaments[tournamentId]);
  const participants = useAppStore((s) => s.participants);
  const addParticipant = useAppStore((s) => s.addParticipant);
  const updateParticipant = useAppStore((s) => s.updateParticipant);
  const removeParticipant = useAppStore((s) => s.removeParticipant);

  const list = tournament?.participantIds.map((id) => participants[id]).filter(Boolean) ?? [];

  return {
    list,
    add: (name: string) => addParticipant(tournamentId, name),
    rename: (id: string, name: string) => updateParticipant(id, { name }),
    remove: (id: string) => removeParticipant(tournamentId, id),
  };
};
