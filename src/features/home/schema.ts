import { z } from "zod";

export const Schema = z.object({
  name: z.string().trim().min(1, "大会名を入力してください"),
  format: z.enum(["singles", "doubles"]),
  bestOf: z.union([z.literal(3), z.literal(5), z.literal(7)]),
  date: z.string().min(1, "開催日を選択してください"),
});

export type FormType = z.infer<typeof Schema>;

export const defaultValues: FormType = {
  name: "",
  format: "singles",
  bestOf: 3,
  date: new Date().toISOString().slice(0, 10),
};
