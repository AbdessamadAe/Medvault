import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Every Server Action calls this first. There is no public sign-up route —
 * middleware already redirects unauthenticated requests to /login — so
 * reaching this point without a session means the session expired between
 * page load and the action running.
 */
export async function requireUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Not authenticated");
  }

  return user.id;
}
