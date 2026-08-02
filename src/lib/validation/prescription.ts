import { z } from "zod";
import { dateString, optionalText, uuid } from "./shared";
import { medicationSchema } from "./medication";

export const prescriptionSchema = z.object({
  consultationId: uuid,
  date: dateString,
  notes: optionalText(5000),
  medications: z
    .array(medicationSchema)
    .min(1, "Add at least one medication"),
});

export type PrescriptionInput = z.infer<typeof prescriptionSchema>;
