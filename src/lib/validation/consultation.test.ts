import { describe, expect, it } from "vitest";
import { consultationSchema } from "./consultation";

const validInput = {
  illnessId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
  doctorId: "d290f1ee-6c54-4b01-90e6-d701748f0852",
  date: "2026-01-15",
  reason: "Follow-up checkup",
  notes: "",
};

describe("consultationSchema", () => {
  it("accepts a valid consultation", () => {
    expect(consultationSchema.safeParse(validInput).success).toBe(true);
  });

  it("requires illnessId and doctorId to be valid uuids", () => {
    expect(
      consultationSchema.safeParse({ ...validInput, illnessId: "not-a-uuid" }).success,
    ).toBe(false);
    expect(
      consultationSchema.safeParse({ ...validInput, doctorId: "not-a-uuid" }).success,
    ).toBe(false);
  });

  it("requires a reason", () => {
    expect(consultationSchema.safeParse({ ...validInput, reason: "" }).success).toBe(false);
  });

  it("requires a valid date", () => {
    expect(consultationSchema.safeParse({ ...validInput, date: "" }).success).toBe(false);
  });
});
