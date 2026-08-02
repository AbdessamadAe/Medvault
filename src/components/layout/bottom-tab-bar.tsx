"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { cn } from "@/lib/utils";
import { DownloadIcon, SearchIcon, StethoscopeIcon, FolderIcon } from "lucide-react";

const TABS = [
  { href: "/cases", label: "Cases", icon: FolderIcon },
  { href: "/doctors", label: "Doctors", icon: StethoscopeIcon },
  { href: "/search", label: "Search", icon: SearchIcon },
  { href: "/export", label: "Export", icon: DownloadIcon },
];

/**
 * Fixed bottom tab bar — the primary navigation on a phone (thumb-reachable,
 * PWA/native-app feel) instead of a desktop-style top nav row. Padded for
 * the iPhone home-indicator safe area; see layout.tsx's viewportFit: "cover".
 */
export function BottomTabBar() {
  const pathname = usePathname();

  return (
    <nav
      className="fixed inset-x-0 bottom-0 z-40 border-t bg-card pb-[env(safe-area-inset-bottom)]"
      aria-label="Primary"
    >
      <div className="mx-auto flex max-w-4xl">
        {TABS.map((tab) => {
          const isActive = pathname.startsWith(tab.href);
          const Icon = tab.icon;
          return (
            <Link
              key={tab.href}
              href={tab.href}
              className={cn(
                "flex flex-1 flex-col items-center justify-center gap-0.5 py-2.5 text-xs font-medium transition-colors",
                isActive ? "text-primary" : "text-muted-foreground",
              )}
            >
              <Icon className="size-5" />
              {tab.label}
            </Link>
          );
        })}
      </div>
    </nav>
  );
}
