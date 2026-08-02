import { describe, expect, it } from "vitest";
import { isGoogleMapsUrl, isShortMapsLink, parseMapsUrl } from "./maps-link";

describe("isGoogleMapsUrl", () => {
  it("accepts google.com maps links", () => {
    expect(isGoogleMapsUrl("https://www.google.com/maps/place/Foo/@1,2,17z")).toBe(true);
  });

  it("accepts short goo.gl links", () => {
    expect(isGoogleMapsUrl("https://maps.app.goo.gl/abc123")).toBe(true);
  });

  it("rejects unrelated links", () => {
    expect(isGoogleMapsUrl("https://example.com/place/Foo")).toBe(false);
  });

  it("rejects malformed input", () => {
    expect(isGoogleMapsUrl("not a url")).toBe(false);
  });
});

describe("isShortMapsLink", () => {
  it("identifies maps.app.goo.gl as short", () => {
    expect(isShortMapsLink("https://maps.app.goo.gl/abc123")).toBe(true);
  });

  it("does not treat a full maps URL as short", () => {
    expect(isShortMapsLink("https://www.google.com/maps/place/Foo/@1,2,17z")).toBe(false);
  });
});

describe("parseMapsUrl", () => {
  it("extracts a place name and coordinates", () => {
    const result = parseMapsUrl(
      "https://www.google.com/maps/place/Clinique+Al+Andalous/@33.5892762,-7.6032539,17z/data=xyz",
    );
    expect(result.name).toBe("Clinique Al Andalous");
    expect(result.lat).toBeCloseTo(33.5892762);
    expect(result.lng).toBeCloseTo(-7.6032539);
  });

  it("decodes URI-encoded characters in the place name", () => {
    const result = parseMapsUrl(
      "https://www.google.com/maps/place/Cabinet%20Dr.%20Alami/@34.02,-6.83,15z",
    );
    expect(result.name).toBe("Cabinet Dr. Alami");
  });

  it("returns coordinates only when there is no place segment", () => {
    const result = parseMapsUrl("https://www.google.com/maps/@33.589,-7.603,15z");
    expect(result.name).toBeUndefined();
    expect(result.lat).toBeCloseTo(33.589);
    expect(result.lng).toBeCloseTo(-7.603);
  });

  it("returns an empty result for an unrecognized URL shape", () => {
    const result = parseMapsUrl("https://www.google.com/maps");
    expect(result.name).toBeUndefined();
    expect(result.lat).toBeUndefined();
  });
});
