import { winsNeededForBestOf } from "@/domain/match";
import {
  doublesPairSchema,
  type DoublesPairForm,
  doublesPairDefaults,
} from "@/features/tournament/matrix/doubles/schema";
import { useMatrix, useMatchModal } from "@/features/tournament/matrix/hooks";
import { SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { useImageCapture } from "@/utils/imageCapture/useImageCapture";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";

/** 対戦表を成立させる最小参加人数（ダブルス）。 */
export const MIN_PLAYERS_DOUBLES = 4;

export const useDoublesMatrix = (tournamentId: string) => {
  const { tournament, participants, matchList, players } = useMatrix(tournamentId);
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
      { kind: SIDE_KIND.PAIR, memberIds: [data.l1, data.l2] },
      { kind: SIDE_KIND.PAIR, memberIds: [data.r1, data.r2] },
    );
    pairForm.reset();
    openMatch(id);
  });

  const wins = tournament ? winsNeededForBestOf(tournament.bestOf) : 0;

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
