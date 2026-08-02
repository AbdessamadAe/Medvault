import { z } from "zod";
import { optionalDateString, optionalText, requiredText } from "./shared";

export const medicationSchema = z.object({
  name: requiredText(200),
  dosage: optionalText(100),
  frequency: optionalText(100),
  startDate: optionalDateString,
  endDate: optionalDateString,
  notes: optionalText(2000),
});

export type MedicationInput = z.infer<typeof medicationSchema>;
