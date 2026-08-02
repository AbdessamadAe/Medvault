import { createBrowserClient } from "@supabase/ssr";

/**
 * Supabase client for Client Components. Only used where a client-side
 * subscription or interaction genuinely needs it — most of the app reads
 * and writes data through Server Actions instead.
 */
export function createSupabaseBrowserClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
  );
}
