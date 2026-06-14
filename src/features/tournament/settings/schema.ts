import { z } from "zod";

export const Schema = z.object({
  name: z.string().trim().min(1, "大会名を入力してください"),
  date: z.string().min(1, "開催日を選択してください"),
});

export type FormType = z.infer<typeof Schema>;

export const defaultValues: FormType = { name: "", date: "" };
