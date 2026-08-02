import { z } from "zod";
import { optionalDateString, optionalText, requiredText } from "./shared";

export const caseStatusValues = ["active", "resolved", "chronic"] as const;

export const caseSchema = z.object({
  title: requiredText(200),
  status: z.enum(caseStatusValues).default("active"),
  startDate: optionalDateString,
  endDate: optionalDateString,
  notes: optionalText(5000),
});

export type CaseInput = z.infer<typeof caseSchema>;
