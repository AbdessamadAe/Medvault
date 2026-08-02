import { z } from "zod";
import { optionalDateString, optionalText, requiredText } from "./shared";

export const illnessStatusValues = ["active", "resolved", "chronic"] as const;

export const illnessSchema = z.object({
  title: requiredText(200),
  status: z.enum(illnessStatusValues).default("active"),
  startDate: optionalDateString,
  endDate: optionalDateString,
  notes: optionalText(5000),
});

export type IllnessInput = z.infer<typeof illnessSchema>;
