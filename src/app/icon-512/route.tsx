import { ImageResponse } from "next/og";

/** 512x512 PNG referenced from manifest.ts — Chrome/Android's recommended install icon size. */
export async function GET() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          alignItems: "center",
          justifyContent: "center",
          background: "#16803c",
          color: "white",
          fontSize: 288,
          fontWeight: 700,
          fontFamily: "sans-serif",
        }}
      >
        M
      </div>
    ),
    { width: 512, height: 512 },
  );
}
