import { createClient } from "@/lib/supabase/server";
import type { NextRequest } from "next/server";
import type { User } from "@supabase/supabase-js";

export async function getUserFromRequest(req: NextRequest): Promise<User | null> {
  const supabase = await createClient();

  // 1. Try Authorization header FIRST (our browser client uses localStorage + header)
  const authHeader = req.headers.get("authorization");
  console.log("[auth-helpers] Authorization header present:", !!authHeader);
  if (authHeader?.startsWith("Bearer ")) {
    const token = authHeader.slice(7);
    console.log("[auth-helpers] Token prefix:", token.slice(0, 20) + "...");
    const { data, error: tokenError } = await supabase.auth.getUser(token);
    console.log("[auth-helpers] Token auth:", !!data.user, "error:", tokenError?.message || "none");
    if (data.user) {
      console.log("[auth-helpers] User from token:", data.user.email);
      return data.user;
    }
  }

  // 2. Fallback to cookie-based session
  const { data: { user }, error: cookieError } = await supabase.auth.getUser();
  console.log("[auth-helpers] Cookie auth:", !!user, "error:", cookieError?.message || "none");
  if (user) {
    console.log("[auth-helpers] User from cookie:", user.email);
    return user;
  }

  console.log("[auth-helpers] No user found");
  return null;
}
