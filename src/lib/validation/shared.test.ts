import { describe, expect, it } from "vitest";
import { dateString, optionalDateString, optionalText, requiredText } from "./shared";

describe("dateString", () => {
  it("accepts a YYYY-MM-DD date", () => {
    expect(dateString.safeParse("2026-01-15").success).toBe(true);
  });

  it("rejects other formats", () => {
    expect(dateString.safeParse("01/15/2026").success).toBe(false);
    expect(dateString.safeParse("2026-1-15").success).toBe(false);
    expect(dateString.safeParse("").success).toBe(false);
  });
});

describe("optionalDateString", () => {
  it("treats an empty string as absent", () => {
    const result = optionalDateString.safeParse("");
    expect(result.success).toBe(true);
    expect(result.success && result.data).toBeUndefined();
  });

  it("still validates a non-empty value", () => {
    expect(optionalDateString.safeParse("not-a-date").success).toBe(false);
  });
});

describe("requiredText", () => {
  it("rejects empty/whitespace-only input", () => {
    expect(requiredText(50).safeParse("").success).toBe(false);
    expect(requiredText(50).safeParse("   ").success).toBe(false);
  });

  it("trims and accepts valid input", () => {
    const result = requiredText(50).safeParse("  Hello  ");
    expect(result.success && result.data).toBe("Hello");
  });

  it("enforces the max length", () => {
    expect(requiredText(5).safeParse("123456").success).toBe(false);
  });
});

describe("optionalText", () => {
  it("treats an empty string as undefined", () => {
    const result = optionalText(50).safeParse("");
    expect(result.success && result.data).toBeUndefined();
  });

  it("passes through valid non-empty text", () => {
    const result = optionalText(50).safeParse("notes here");
    expect(result.success && result.data).toBe("notes here");
  });
});
