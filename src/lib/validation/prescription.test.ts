import { describe, expect, it } from "vitest";
import { prescriptionSchema } from "./prescription";

const baseInput = {
  consultationId: "d290f1ee-6c54-4b01-90e6-d701748f0851",
  date: "2026-01-15",
  notes: "",
};

describe("prescriptionSchema", () => {
  it("requires at least one medication", () => {
    const result = prescriptionSchema.safeParse({ ...baseInput, medications: [] });
    expect(result.success).toBe(false);
  });

  it("accepts a prescription with one medication", () => {
    const result = prescriptionSchema.safeParse({
      ...baseInput,
      medications: [{ name: "Amoxicillin", dosage: "500mg", frequency: "3x/day" }],
    });
    expect(result.success).toBe(true);
  });

  it("rejects a medication with no name", () => {
    const result = prescriptionSchema.safeParse({
      ...baseInput,
      medications: [{ name: "" }],
    });
    expect(result.success).toBe(false);
  });

  it("accepts multiple medications", () => {
    const result = prescriptionSchema.safeParse({
      ...baseInput,
      medications: [{ name: "Amoxicillin" }, { name: "Ibuprofen", dosage: "200mg" }],
    });
    expect(result.success).toBe(true);
  });
});
