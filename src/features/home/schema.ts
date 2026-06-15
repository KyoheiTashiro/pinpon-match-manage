import { FORMAT } from "@/store/types";
import { z } from "zod";

export const Schema = z.object({
  name: z
    .string()
    .trim()
    .min(1, "大会名を入力してください")
    .max(20, "大会名は20文字以内で入力してください"),
  format: z.enum([FORMAT.SINGLES, FORMAT.DOUBLES]),
  bestOf: z.union([z.literal(3), z.literal(5), z.literal(7)]),
  date: z.string().min(1, "開催日を選択してください"),
});

export type FormType = z.infer<typeof Schema>;

export const defaultValues: FormType = {
  name: "",
  format: FORMAT.SINGLES,
  bestOf: 3,
  date: new Date().toISOString().slice(0, 10),
};
