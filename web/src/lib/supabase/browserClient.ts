import { createClient as createSupabaseClient } from "@supabase/supabase-js";

let singletonClient: ReturnType<typeof createSupabaseClient> | null = null;

export function createClient() {
  if (!singletonClient) {
    singletonClient = createSupabaseClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!
    );
  }
  return singletonClient;
}
