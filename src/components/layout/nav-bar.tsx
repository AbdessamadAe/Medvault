"use client";

import Link from "next/link";
import Image from "next/image";
import { signOut } from "@/lib/actions/auth";
import { Button } from "@/components/ui/button";
import { LogOutIcon } from "lucide-react";

/** Slim top bar — brand + sign out only. Primary navigation lives in BottomTabBar. */
export function NavBar() {
  return (
    <header className="sticky top-0 z-30 border-b bg-card pt-[env(safe-area-inset-top)]">
      <div className="mx-auto flex max-w-4xl items-center justify-between px-4 py-2.5">
        <Link href="/cases" className="flex items-center gap-2 font-semibold text-primary">
          <Image src="/logo.png" alt="" width={24} height={24} className="rounded-md" priority />
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
