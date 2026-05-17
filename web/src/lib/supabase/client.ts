import { createBrowserClient } from "@supabase/ssr";

function parseDocumentCookie(): { name: string; value: string }[] {
  if (typeof document === "undefined") return [];
  const cookies = document.cookie.split(";").map((cookie) => {
    const [name, ...rest] = cookie.trim().split("=");
    return { name, value: rest.join("=") || "" };
  });
  console.log("[supabase client] getAll cookies:", cookies.map((c) => c.name));
  return cookies;
}

function writeDocumentCookie(name: string, value: string, options?: Record<string, unknown>) {
  if (typeof document === "undefined") return;
  let cookieString = `${name}=${value}`;
  if (options) {
    if (options.path) cookieString += `; Path=${options.path}`;
    if (options.maxAge !== undefined) cookieString += `; Max-Age=${options.maxAge}`;
    if (options.domain) cookieString += `; Domain=${options.domain}`;
    if (options.sameSite) cookieString += `; SameSite=${options.sameSite}`;
    if (options.secure) cookieString += `; Secure`;
    if (options.expires) cookieString += `; Expires=${options.expires}`;
  }
  console.log("[supabase client] setAll cookie:", name, "length:", value.length, "options:", Object.keys(options || {}));
  document.cookie = cookieString;
}

export function createClient() {
  return createBrowserClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return parseDocumentCookie();
        },
        setAll(cookiesList) {
          cookiesList.forEach(({ name, value, options }) => {
            writeDocumentCookie(name, value, options);
          });
        },
      },
    }
  );
}
