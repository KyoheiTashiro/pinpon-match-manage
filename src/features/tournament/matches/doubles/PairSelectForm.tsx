import { Button, Select } from "@/components/ui";
import type { DoublesPairForm } from "@/features/tournament/matches/doubles/schema";
import type { Participant } from "@/store/types";
import { Controller, type UseFormReturn } from "react-hook-form";

type FieldName = keyof DoublesPairForm;

const FIELD_LABELS: Record<FieldName, string> = {
  left1: "左1",
  left2: "左2",
  right1: "右1",
  right2: "右2",
};
const LEFT_FIELDS: FieldName[] = ["left1", "left2"];
const RIGHT_FIELDS: FieldName[] = ["right1", "right2"];

/** ダブルスの試合追加フォーム（左右2人ずつのペア選択） */
export const PairSelectForm = ({
  pairForm,
  players,
  onSubmit,
}: {
  pairForm: UseFormReturn<DoublesPairForm>;
  players: Participant[];
  onSubmit: () => void;
}) => {
  const values = pairForm.watch();

  // 他フィールドで選択済みの参加者は選択肢から除外する
  const renderField = (name: FieldName) => {
    const excluded = new Set(
      ([...LEFT_FIELDS, ...RIGHT_FIELDS] satisfies FieldName[])
        .filter((key) => key !== name)
        .map((key) => values[key])
        .filter(Boolean),
    );
    const options = players
      .filter((participant) => !excluded.has(participant.id))
      .map((participant) => ({ value: participant.id, label: participant.name }));
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
    <div className="border-primary space-y-3 rounded-2xl border-4 p-4">
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
      <Button disabled={!pairForm.formState.isValid} onClick={onSubmit}>
        試合を追加して入力へ
      </Button>
    </div>
  );
};
