import { describe, expect, it } from "vitest";
import { sanitizePathSegment } from "./sanitize-path";

describe("sanitizePathSegment", () => {
  it("keeps ordinary text unchanged", () => {
    expect(sanitizePathSegment("Chest X-Ray", "fallback")).toBe("Chest X-Ray");
  });

  it("strips filesystem-unsafe characters", () => {
    expect(sanitizePathSegment('a/b\\c:d*e?f"g<h>i|j', "fallback")).toBe("abcdefghij");
  });

  it("falls back when the result would be empty", () => {
    expect(sanitizePathSegment("///", "fallback-id")).toBe("fallback-id");
    expect(sanitizePathSegment("   ", "fallback-id")).toBe("fallback-id");
  });

  it("truncates very long input", () => {
    const result = sanitizePathSegment("a".repeat(200), "fallback");
    expect(result.length).toBe(80);
  });
});
