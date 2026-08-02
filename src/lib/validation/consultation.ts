import { z } from "zod";
import { dateString, optionalText, requiredText, uuid } from "./shared";

export const consultationSchema = z.object({
  illnessId: uuid,
  doctorId: uuid,
  date: dateString,
  reason: requiredText(300),
  notes: optionalText(5000),
});

export type ConsultationInput = z.infer<typeof consultationSchema>;
