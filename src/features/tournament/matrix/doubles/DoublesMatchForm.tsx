import { Button } from "@/components/ui/Button";
import { Select } from "@/components/ui/Select";
import {
  doublesPairSchema,
  type DoublesPairForm,
  doublesPairDefaults,
} from "@/features/tournament/matrix/doubles/schema";
import type { Participant } from "@/store/types";
import { SIDE_KIND } from "@/store/types";
import { useAppStore } from "@/store/useAppStore";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm, Controller } from "react-hook-form";

type Props = {
  tournamentId: string;
  players: Participant[];
  onAdded: (matchId: string) => void;
};

type FieldName = keyof DoublesPairForm;

const FIELD_LABELS: Record<FieldName, string> = { l1: "左1", l2: "左2", r1: "右1", r2: "右2" };
const LEFT_FIELDS: FieldName[] = ["l1", "l2"];
const RIGHT_FIELDS: FieldName[] = ["r1", "r2"];

export const DoublesMatchForm = ({ tournamentId, players, onAdded }: Props) => {
  const addManualMatch = useAppStore((state) => state.addManualMatch);

  const pairForm = useForm<DoublesPairForm>({
    resolver: zodResolver(doublesPairSchema),
    mode: "onChange",
    defaultValues: doublesPairDefaults,
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

  const renderField = (name: FieldName) => {
    const excluded = new Set(
      (Object.keys(FIELD_LABELS) as FieldName[])
        .filter((key) => key !== name)
        .map((key) => values[key])
        .filter(Boolean),
    );
    const options = players
      .filter((p) => !excluded.has(p.id))
      .map((p) => ({ value: p.id, label: p.name }));
    return (
      <Controller
        key={name}
        name={name}
        control={pairForm.control}
        render={({ field }) => (
          <Select
            value={field.value}
            onChange={field.onChange}
            options={options}
            label={FIELD_LABELS[name]}
            placeholder="選んでください"
          />
        )}
      />
    );
  };

  return (
    <div className="space-y-3 rounded-2xl border-4 border-primary p-4">
      <h3 className="text-lg font-extrabold">試合を追加</h3>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <div className="space-y-2">
          <span className="font-bold">左ペア</span>
          {LEFT_FIELDS.map((name) => renderField(name))}
        </div>
        <div className="space-y-2">
          <span className="font-bold">右ペア</span>
          {RIGHT_FIELDS.map((name) => renderField(name))}
        </div>
      </div>
      <Button
        disabled={!pairForm.formState.isValid}
        onClick={() => {
          void submit();
        }}
      >
        試合を追加して入力へ
      </Button>
    </div>
  );
};
