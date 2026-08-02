import { z } from "zod";
import { optionalText, optionalUrl, requiredText } from "./shared";

export const doctorSchema = z.object({
  name: requiredText(200),
  specialty: optionalText(200),
  clinic: optionalText(200),
  city: optionalText(120),
  phone: optionalText(40),
  mapsUrl: optionalUrl(2000),
  notes: optionalText(5000),
});

export type DoctorInput = z.infer<typeof doctorSchema>;
