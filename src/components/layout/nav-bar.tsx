"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { LogOutIcon } from "lucide-react";

const NAV_LINKS = [
  { href: "/cases", label: "Cases" },
  { href: "/doctors", label: "Doctors" },
  { href: "/search", label: "Search" },
  { href: "/export", label: "Export" },
];

export function NavBar() {
  const pathname = usePathname();

  return (
    <header className="border-b bg-card">
      <div className="mx-auto flex max-w-4xl items-center gap-6 px-4 py-3">
        <Link href="/cases" className="font-semibold text-primary">
          MedVault
        </Link>
        <nav className="flex flex-1 items-center gap-1">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className={cn(
                "rounded-md px-3 py-1.5 text-sm font-medium transition-colors",
                pathname.startsWith(link.href)
                  ? "bg-accent text-accent-foreground"
                  : "text-muted-foreground hover:bg-accent hover:text-accent-foreground",
              )}
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="sm">
            <LogOutIcon className="size-4" />
            Sign out
          </Button>
        </form>
      </div>
    </header>
  );
}
