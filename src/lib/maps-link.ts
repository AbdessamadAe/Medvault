/**
 * Best-effort parsing of a Google Maps URL — no API key, no account, no
 * cost. Pulls whatever a "share" link happens to encode: a place name
 * (usually the clinic/practice name, not necessarily the doctor's
 * personal name) and/or coordinates. Short links (maps.app.goo.gl) need
 * to be resolved to their final URL first — see resolveMapsShareLink in
 * src/lib/actions/maps-lookup.ts, since that requires a network request
 * and can't happen in this pure function.
 */

const GOOGLE_MAPS_HOST_PATTERN = /(^|\.)google\.[a-z.]+$|(^|\.)goo\.gl$/i;

export function isGoogleMapsUrl(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return GOOGLE_MAPS_HOST_PATTERN.test(hostname);
  } catch {
    return false;
  }
}

export function isShortMapsLink(url: string): boolean {
  try {
    const { hostname } = new URL(url);
    return hostname === "maps.app.goo.gl" || hostname === "goo.gl";
  } catch {
    return false;
  }
}

export type ParsedMapsLink = {
  name?: string;
  lat?: number;
  lng?: number;
};

export function parseMapsUrl(url: string): ParsedMapsLink {
  const result: ParsedMapsLink = {};

  const placeMatch = url.match(/\/maps\/place\/([^/@]+)/);
  if (placeMatch) {
    const decoded = decodeURIComponent(placeMatch[1].replace(/\+/g, " ")).trim();
    if (decoded.length > 0) {
      result.name = decoded;
    }
  }

  const coordsMatch = url.match(/@(-?\d+\.\d+),(-?\d+\.\d+)/);
  if (coordsMatch) {
    result.lat = Number(coordsMatch[1]);
    result.lng = Number(coordsMatch[2]);
  }

  return result;
}
