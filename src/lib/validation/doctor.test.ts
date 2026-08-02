import { describe, expect, it } from "vitest";
import { doctorSchema } from "./doctor";

describe("doctorSchema", () => {
  it("requires a name", () => {
    expect(doctorSchema.safeParse({ name: "" }).success).toBe(false);
  });

  it("accepts a doctor with only a name", () => {
    const result = doctorSchema.safeParse({ name: "Dr. Alami" });
    expect(result.success).toBe(true);
  });

  it("treats an empty mapsUrl as absent", () => {
    const result = doctorSchema.safeParse({ name: "Dr. Alami", mapsUrl: "" });
    expect(result.success && result.data.mapsUrl).toBeUndefined();
  });

  it("accepts a valid http(s) maps URL", () => {
    const result = doctorSchema.safeParse({
      name: "Dr. Alami",
      mapsUrl: "https://maps.app.goo.gl/abc123",
    });
    expect(result.success && result.data.mapsUrl).toBe("https://maps.app.goo.gl/abc123");
  });

  it("rejects a mapsUrl that isn't a URL", () => {
    const result = doctorSchema.safeParse({ name: "Dr. Alami", mapsUrl: "not a link" });
    expect(result.success).toBe(false);
  });
});
