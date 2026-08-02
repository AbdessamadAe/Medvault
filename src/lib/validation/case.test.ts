import { describe, expect, it } from "vitest";
import { caseSchema } from "./case";

describe("caseSchema", () => {
  it("requires a title", () => {
    const result = caseSchema.safeParse({ title: "" });
    expect(result.success).toBe(false);
  });

  it("defaults status to active", () => {
    const result = caseSchema.safeParse({ title: "Seasonal flu" });
    expect(result.success && result.data.status).toBe("active");
  });

  it("rejects an invalid status", () => {
    const result = caseSchema.safeParse({ title: "Flu", status: "cured" });
    expect(result.success).toBe(false);
  });

  it("accepts a fully populated case", () => {
    const result = caseSchema.safeParse({
      title: "Chronic migraine",
      status: "chronic",
      startDate: "2024-01-01",
      endDate: "",
      notes: "Triggered by stress",
    });
    expect(result.success).toBe(true);
  });
});
