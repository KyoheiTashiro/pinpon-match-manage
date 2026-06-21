import { z } from "zod";

export const doublesPairSchema = z
  .object({
    l1: z.string().min(1),
    l2: z.string().min(1),
    r1: z.string().min(1),
    r2: z.string().min(1),
  })
  .refine((v) => new Set([v.l1, v.l2, v.r1, v.r2]).size === 4, {
    message: "4人とも異なる選手を選んでください",
  });

export type DoublesPairForm = z.infer<typeof doublesPairSchema>;

export const doublesPairDefaults: DoublesPairForm = { l1: "", l2: "", r1: "", r2: "" };
