import { supabaseAdmin } from "@/lib/supabase-admin";
import { createServerSupabase } from "@/lib/supabase-server";

export type AuthenticatedProUser =
  | { user: { id: string }; source: "bearer" | "cookie" }
  | { user: null; source: null };

function getBearerToken(request: Request) {
  const authHeader =
    request.headers.get("authorization") ||
    request.headers.get("Authorization");

  if (!authHeader) return null;

  const [type, token] = authHeader.split(" ");
  if (type !== "Bearer" || !token) return null;

  return token.trim();
}

export async function getAuthenticatedProUser(
  request: Request
): Promise<AuthenticatedProUser> {
  const bearerToken = getBearerToken(request);

  if (bearerToken) {
    const {
      data: { user },
      error,
    } = await supabaseAdmin.auth.getUser(bearerToken);

    if (!error && user?.id) {
      return {
        user: { id: user.id },
        source: "bearer",
      };
    }
  }

  const supabase = await createServerSupabase();
  const {
    data: { user },
    error,
  } = await supabase.auth.getUser();

  if (!error && user?.id) {
    return {
      user: { id: user.id },
      source: "cookie",
    };
  }

  return { user: null, source: null };
}