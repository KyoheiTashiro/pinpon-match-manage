import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAppStore } from "@/store/useAppStore";
import { BigButton } from "@/components/ui/BigButton";
import { PairSelect } from "@/features/tournament/matrix/components/PairSelect";
import { Schema, type FormType, defaultValues } from "@/features/tournament/matrix/schema";
import type { Participant } from "@/store/types";
import { SIDE_KIND } from "@/store/types";

type Props = {
  tournamentId: string;
  players: Participant[];
  onAdded: (matchId: string) => void;
};

export const DoublesMatchForm = ({ tournamentId, players, onAdded }: Props) => {
  const addManualMatch = useAppStore((state) => state.addManualMatch);

  const pairForm = useForm<FormType>({
    resolver: zodResolver(Schema),
    mode: "onChange",
    defaultValues,
  });
  const values = pairForm.watch();

  const submit = pairForm.handleSubmit((data) => {
    const id = addManualMatch(
      tournamentId,
      { kind: SIDE_KIND.PAIR, memberIds: [data.l1, data.l2] },
      { kind: SIDE_KIND.PAIR, memberIds: [data.r1, data.r2] },
    );
    pairForm.reset();
    onAdded(id);
  });

  return (
    <div className="border-4 border-primary rounded-2xl p-4 space-y-3">
      <h3 className="text-lg font-extrabold">試合を追加</h3>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="space-y-2">
          <span className="font-bold">左ペア</span>
          <Controller
            name="l1"
            control={pairForm.control}
            render={({ field }) => (
              <PairSelect
                value={field.value}
                onChange={field.onChange}
                options={players}
                exclude={[values.l2, values.r1, values.r2]}
                label="左1"
              />
            )}
          />
          <Controller
            name="l2"
            control={pairForm.control}
            render={({ field }) => (
              <PairSelect
                value={field.value}
                onChange={field.onChange}
                options={players}
                exclude={[values.l1, values.r1, values.r2]}
                label="左2"
              />
            )}
          />
        </div>
        <div className="space-y-2">
          <span className="font-bold">右ペア</span>
          <Controller
            name="r1"
            control={pairForm.control}
            render={({ field }) => (
              <PairSelect
                value={field.value}
                onChange={field.onChange}
                options={players}
                exclude={[values.l1, values.l2, values.r2]}
                label="右1"
              />
            )}
          />
          <Controller
            name="r2"
            control={pairForm.control}
            render={({ field }) => (
              <PairSelect
                value={field.value}
                onChange={field.onChange}
                options={players}
                exclude={[values.l1, values.l2, values.r1]}
                label="右2"
              />
            )}
          />
        </div>
      </div>
      <BigButton disabled={!pairForm.formState.isValid} onClick={submit}>
        試合を追加して入力へ
      </BigButton>
    </div>
  );
};
