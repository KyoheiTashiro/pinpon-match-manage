import { z } from "zod";

export const Schema = z.object({
  name: z.string().trim().min(1, "名前を入力してください"),
});

export type FormType = z.infer<typeof Schema>;

export const defaultValues: FormType = { name: "" };
