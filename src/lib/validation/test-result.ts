import { z } from "zod";
import { dateString, optionalText, requiredText, uuid } from "./shared";

export const testResultTypeValues = ["lab", "imaging"] as const;

export const testResultSchema = z.object({
  consultationId: uuid,
  date: dateString,
  type: z.enum(testResultTypeValues),
  testName: requiredText(200),
  resultNotes: optionalText(5000),
});

export type TestResultInput = z.infer<typeof testResultSchema>;
