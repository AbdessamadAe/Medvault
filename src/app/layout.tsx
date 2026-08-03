import type { Metadata, Viewport } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import { Toaster } from "@/components/ui/sonner";
import { ThemeProvider } from "@/components/theme-provider";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MedVault",
  description: "Personal medical records organizer.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "default",
    title: "MedVault",
  },
};

// Runs functions in Frankfurt, next to the Supabase database
// (aws-0-eu-central-1) instead of Vercel's US default — every DB round
// trip otherwise crosses the Atlantic twice.
export const preferredRegion = "fra1";

export const viewport: Viewport = {
  themeColor: "#16803c",
  // Lets the page extend under the iPhone notch/home indicator so
  // env(safe-area-inset-*) resolves to real values instead of 0 — used by
  // the bottom tab bar and top bar to avoid sitting under those areas.
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      suppressHydrationWarning
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col bg-background text-foreground">
        <ThemeProvider attribute="class" defaultTheme="system" enableSystem disableTransitionOnChange>
          {children}
          <Toaster />
        </ThemeProvider>
      </body>
    </html>
  );
}
