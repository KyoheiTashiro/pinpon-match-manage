import {
  doublesPairSchema,
  type DoublesPairForm,
  doublesPairDefaults,
} from "@/features/tournament/matches/doubles/schema";
import { useMatches, useMatchModal } from "@/features/tournament/matches/hooks";
import { SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useImageCapture } from "@/utils/imageCapture/useImageCapture";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

export const MIN_PLAYERS_DOUBLES = 4;

export const useDoubles = (tournamentId: string) => {
  const { tournament, participants, matchList, players, wins } = useMatches(tournamentId);
  const { openMatchId, openMatch, closeMatch } = useMatchModal();
  const { ref, saving, save } = useImageCapture();
  const addManualMatch = useAppStore((state) => state.addManualMatch);

  const pairForm = useForm<DoublesPairForm>({
    resolver: zodResolver(doublesPairSchema),
    mode: "onChange",
    defaultValues: doublesPairDefaults,
  });

  const submit = pairForm.handleSubmit((data) => {
    const id = addManualMatch(
      tournamentId,
      { kind: SIDE_KIND.PAIR, memberIds: [data.left1, data.left2] },
      { kind: SIDE_KIND.PAIR, memberIds: [data.right1, data.right2] },
    );
    pairForm.reset();
    openMatch(id);
  });

  return {
    tournament,
    participants,
    matchList,
    players,
    wins,
    openMatchId,
    openMatch,
    closeMatch,
    pairForm,
    submit,
    ref,
    saving,
    save,
  };
};
