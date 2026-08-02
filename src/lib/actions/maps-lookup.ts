"use server";

import { isGoogleMapsUrl, isShortMapsLink, parseMapsUrl } from "@/lib/maps-link";

export type MapsLookupResult =
  | { success: true; name?: string; city?: string }
  | { success: false; error: string };

const FETCH_TIMEOUT_MS = 8000;

async function fetchWithTimeout(url: string, init?: RequestInit): Promise<Response> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS);
  try {
    return await fetch(url, { ...init, signal: controller.signal });
  } finally {
    clearTimeout(timeout);
  }
}

async function resolveShortLink(url: string): Promise<string> {
  // Short links (maps.app.goo.gl) redirect to the full maps.google.com
  // URL that actually encodes the place name/coordinates. fetch follows
  // redirects by default; response.url is the final resolved address.
  const response = await fetchWithTimeout(url, { redirect: "follow" });
  return response.url || url;
}

async function reverseGeocodeCity(lat: number, lng: number): Promise<string | undefined> {
  // accept-language=en avoids OSM's multi-script concatenated names for
  // places with several official languages (e.g. Moroccan cities are
  // often tagged with Latin+Tifinagh+Arabic names all in one field).
  const url = `https://nominatim.openstreetmap.org/reverse?format=jsonv2&lat=${lat}&lon=${lng}&zoom=10&addressdetails=1&accept-language=en`;

  const response = await fetchWithTimeout(url, {
    headers: {
      // Nominatim's usage policy requires an identifying User-Agent.
      "User-Agent": "MedVault-Personal-App (personal single-user medical records app)",
    },
  });

  if (!response.ok) return undefined;

  const data = (await response.json()) as {
    address?: Record<string, string>;
  };

  const address = data.address ?? {};
  return address.city ?? address.town ?? address.village ?? address.municipality ?? undefined;
}

export async function lookupGoogleMapsLink(rawUrl: string): Promise<MapsLookupResult> {
  const url = rawUrl.trim();

  if (!isGoogleMapsUrl(url)) {
    return { success: false, error: "That doesn't look like a Google Maps link" };
  }

  let resolvedUrl: string;
  try {
    resolvedUrl = isShortMapsLink(url) ? await resolveShortLink(url) : url;
  } catch {
    return { success: false, error: "Couldn't reach that link — check it and try again" };
  }

  const parsed = parseMapsUrl(resolvedUrl);

  if (!parsed.name && parsed.lat === undefined) {
    return {
      success: false,
      error: "Couldn't find a place name or location in that link",
    };
  }

  let city: string | undefined;
  if (parsed.lat !== undefined && parsed.lng !== undefined) {
    try {
      city = await reverseGeocodeCity(parsed.lat, parsed.lng);
    } catch {
      // Reverse geocoding is a nice-to-have — fall through without a city
      // rather than failing the whole lookup over it.
    }
  }

  return { success: true, name: parsed.name, city };
}
