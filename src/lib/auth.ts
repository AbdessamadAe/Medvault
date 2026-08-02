import { createSupabaseServerClient } from "@/lib/supabase/server";

/**
 * Every Server Action and page calls this. Middleware (src/proxy.ts) has
 * already called getUser() once for this request — which verifies the
 * session against Supabase's Auth server over the network and refreshes
 * it if needed — so we don't need to pay that round-trip a second time
 * here. getClaims() verifies the JWT locally (cached JWKS), just to read
 * the user id cheaply.
 *
 * There is no public sign-up route — reaching this without a valid
 * session means the session expired between page load and now.
 */
export async function requireUserId(): Promise<string> {
  const supabase = await createSupabaseServerClient();
  const { data, error } = await supabase.auth.getClaims();

  if (error || !data) {
    throw new Error("Not authenticated");
  }

  return data.claims.sub;
}
