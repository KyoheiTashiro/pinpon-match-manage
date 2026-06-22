import { z } from "zod";

export const doublesPairSchema = z
  .object({
    left1: z.string().min(1),
    left2: z.string().min(1),
    right1: z.string().min(1),
    right2: z.string().min(1),
  })
  .refine((value) => new Set([value.left1, value.left2, value.right1, value.right2]).size === 4, {
    message: "4人とも異なる選手を選んでください",
  });

export type DoublesPairForm = z.infer<typeof doublesPairSchema>;

export const doublesPairDefaults: DoublesPairForm = {
  left1: "",
  left2: "",
  right1: "",
  right2: "",
};
