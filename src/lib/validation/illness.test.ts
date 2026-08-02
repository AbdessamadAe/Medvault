import { describe, expect, it } from "vitest";
import { illnessSchema } from "./illness";

describe("illnessSchema", () => {
  it("requires a title", () => {
    const result = illnessSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("defaults status to active", () => {
    const result = illnessSchema.safeParse({ title: "Seasonal flu" });
    expect(result.success && result.data.status).toBe("active");
  });

  it("rejects an invalid status", () => {
    const result = illnessSchema.safeParse({ title: "Flu", status: "cured" });
    expect(result.success).toBe(false);
  });

  it("accepts a fully populated illness", () => {
    const result = illnessSchema.safeParse({
      title: "Chronic migraine",
      status: "chronic",
      startDate: "2024-01-01",
      endDate: "",
      notes: "Triggered by stress",
    });
    expect(result.success).toBe(true);
  });
});
