"use client";

import Link from "next/link";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

/** Slim top bar — brand + sign out only. Primary navigation lives in BottomTabBar. */
export function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b bg-card pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2.5">
        <Link href="/cases" className="font-semibold text-primary">
          MedVault
        </Link>
        <form action={signOut}>
          <Button type="submit" variant="ghost" size="icon" aria-label="Sign out">
            <LogOutIcon className="size-4" />
          </Button>
        </form>
      </div>
    </header>
  );
}
