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
      bodySystems: ["nervous"],
    });
    expect(result.success).toBe(true);
  });

  it("defaults bodySystems to an empty array", () => {
    const result = caseSchema.safeParse({ title: "Flu" });
    expect(result.success && result.data.bodySystems).toEqual([]);
  });

  it("rejects an unknown body system", () => {
    const result = caseSchema.safeParse({ title: "Flu", bodySystems: ["spleen"] });
    expect(result.success).toBe(false);
  });

  it("accepts multiple body systems", () => {
    const result = caseSchema.safeParse({
      title: "Autoimmune flare",
      bodySystems: ["immune", "skin", "musculoskeletal"],
    });
    expect(result.success && result.data.bodySystems).toEqual([
      "immune",
      "skin",
      "musculoskeletal",
    ]);
  });
});
