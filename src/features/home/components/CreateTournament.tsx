import { CalendarIcon } from "@/components/icons";
import { Button } from "@/components/ui/Button";
import { RadioGroup } from "@/components/ui/RadioGroup";
import type { FormType } from "@/features/home/schema";
import { FORMAT, BEST_OF_OPTIONS } from "@/store/types";
import { type BaseSyntheticEvent } from "react";
import { Controller, type UseFormReturn } from "react-hook-form";

type Props = {
  form: UseFormReturn<FormType>;
  submit: (e?: BaseSyntheticEvent) => void;
  onCancel: () => void;
};

export const CreateTournament = ({ form, submit, onCancel }: Props) => (
  <form onSubmit={submit} className="space-y-4 rounded-2xl border-4 border-primary p-4">
    <h2 className="text-xl font-extrabold">新しい大会</h2>
    <label className="flex flex-col gap-1">
      <span className="font-bold">大会名</span>
      <input
        {...form.register("name")}
        placeholder="例: 春の大会"
        aria-label="大会名"
        className="min-h-input rounded-xl border-2 border-line px-3 text-lg"
      />
      {form.formState.errors.name && (
        <span className="text-sm text-danger">{form.formState.errors.name.message}</span>
      )}
    </label>
    <Controller
      name="format"
      control={form.control}
      render={({ field }) => (
        <RadioGroup
          legend="形式"
          name="format"
          value={field.value}
          options={[
            { value: FORMAT.SINGLES, label: "シングルス" },
            { value: FORMAT.DOUBLES, label: "ダブルス" },
          ]}
          onChange={field.onChange}
        />
      )}
    />
    <Controller
      name="bestOf"
      control={form.control}
      render={({ field }) => (
        <RadioGroup
          legend="ゲーム数"
          name="bestOf"
          value={field.value}
          options={BEST_OF_OPTIONS.map((value) => ({ value, label: String(value) }))}
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
          className="min-h-input w-full appearance-none rounded-xl border-2 border-line bg-white pl-3 pr-12 text-lg [&::-webkit-calendar-picker-indicator]:opacity-0"
        />
        <CalendarIcon className="pointer-events-none absolute right-3 top-1/2 -translate-y-1/2 text-2xl text-line" />
      </div>
      {form.formState.errors.date && (
        <span className="text-sm text-danger">{form.formState.errors.date.message}</span>
      )}
    </label>
    <div className="flex flex-wrap justify-end gap-3">
      <Button variant="secondary" type="button" onClick={onCancel}>
        キャンセル
      </Button>
      <Button variant="primary" type="submit" disabled={!form.formState.isValid}>
        作る
      </Button>
    </div>
  </form>
);
