import { Controller, type UseFormReturn } from "react-hook-form";
import { CalendarIcon } from "@/components/icons";
import { BigButton } from "@/components/ui/BigButton";
import { RadioCardGroup } from "@/components/ui/RadioCardGroup";
import type { FormType } from "@/features/home/schema";

type Props = {
  form: UseFormReturn<FormType>;
  submit: () => void;
  onCancel: () => void;
};

export const CreateTournamentForm = ({ form, submit, onCancel }: Props) => (
  <form onSubmit={submit} className="border-4 border-primary rounded-2xl p-4 space-y-4">
    <h2 className="text-xl font-extrabold">新しい大会</h2>
    <label className="flex flex-col gap-1">
      <span className="font-bold">大会名</span>
      <input
        {...form.register("name")}
        placeholder="例: 春の大会"
        aria-label="大会名"
        className="min-h-input border-2 border-line rounded-xl px-3 text-lg"
      />
      {form.formState.errors.name && (
        <span className="text-sm text-danger">{form.formState.errors.name.message}</span>
      )}
    </label>
    <Controller
      name="format"
      control={form.control}
      render={({ field }) => (
        <RadioCardGroup
          legend="形式"
          name="format"
          value={field.value}
          options={[
            { value: "singles", label: "シングルス" },
            { value: "doubles", label: "ダブルス" },
          ]}
          onChange={field.onChange}
        />
      )}
    />
    <Controller
      name="bestOf"
      control={form.control}
      render={({ field }) => (
        <RadioCardGroup
          legend="ゲーム数"
          name="bestOf"
          value={field.value}
          options={[
            { value: 3, label: "3" },
            { value: 5, label: "5" },
            { value: 7, label: "7" },
          ]}
          onChange={field.onChange}
        />
      )}
    />
    <label className="flex flex-col gap-1">
      <span className="font-bold">開催日</span>
      <div className="relative">
        <input
          {...form.register("date")}
          type="date"
          aria-label="開催日"
          onClick={(e) => e.currentTarget.showPicker?.()}
          className="w-full min-h-input appearance-none bg-white border-2 border-line rounded-xl pl-3 pr-12 text-lg [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-line" />
      </div>
      {form.formState.errors.date && (
        <span className="text-sm text-danger">{form.formState.errors.date.message}</span>
      )}
    </label>
    <div className="flex gap-3 justify-end flex-wrap">
      <BigButton variant="secondary" type="button" onClick={onCancel}>
        キャンセル
      </BigButton>
      <BigButton variant="primary" type="submit" disabled={!form.formState.isValid}>
        作る
      </BigButton>
    </div>
  </form>
);
