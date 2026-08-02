import type { MetadataRoute } from "next";

/**
 * Installability only — this app intentionally has no service worker and
 * caches no medical data offline (see docs/SPEC.md, "Explicitly excluded").
 * This manifest just lets iOS/Android add MedVault to the home screen as
 * an app-like window.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "MedVault",
    short_name: "MedVault",
    description: "Personal medical records organizer.",
    start_url: "/cases",
    display: "standalone",
    background_color: "#ffffff",
    theme_color: "#16803c",
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png" },
    ],
  };
}
