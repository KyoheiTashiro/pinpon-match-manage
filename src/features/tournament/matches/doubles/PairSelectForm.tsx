import { Button, Select } from "@/components/ui";
import type { DoublesPairForm } from "@/features/tournament/matches/doubles/schema";
import type { Participant } from "@/store/types";
import { Controller, type UseFormReturn } from "react-hook-form";

type FieldName = keyof DoublesPairForm;

/** 画面には出さず、スクリーンリーダー向けに各 Select を識別するためのラベル */
const FIELD_ARIA_LABELS: Record<FieldName, string> = {
  left1: "ペア1 選手1",
  left2: "ペア1 選手2",
  right1: "ペア2 選手1",
  right2: "ペア2 選手2",
};
const PAIR1_FIELDS: FieldName[] = ["left1", "left2"];
const PAIR2_FIELDS: FieldName[] = ["right1", "right2"];

/** ダブルスの試合追加フォーム（2人ずつ2組のペア選択） */
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
      ([...PAIR1_FIELDS, ...PAIR2_FIELDS] satisfies FieldName[])
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
            ariaLabel={FIELD_ARIA_LABELS[name]}
            placeholder="選んでください"
          />
        )}
      />
    );
  };

  return (
    <div className="border-primary space-y-3 rounded-2xl border-4 p-4">
      <h3 className="text-lg font-extrabold">試合を追加</h3>
      <div className="grid grid-cols-1 items-center gap-3 sm:grid-cols-[1fr_auto_1fr]">
        <div className="space-y-2">
          <span className="block font-bold">ペア1</span>
          {PAIR1_FIELDS.map((name) => renderField(name))}
        </div>
        <span className="text-sub text-center font-bold">対</span>
        <div className="space-y-2">
          <span className="block font-bold">ペア2</span>
          {PAIR2_FIELDS.map((name) => renderField(name))}
        </div>
      </div>
      <Button disabled={!pairForm.formState.isValid} onClick={onSubmit}>
        試合を追加して入力へ
      </Button>
    </div>
  );
};
