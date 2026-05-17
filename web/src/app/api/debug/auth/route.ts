import { createClient } from "@/lib/supabase/server";
import { NextResponse } from "next/server";

// GET /api/debug/auth — Diagnóstico de sesión y conexión con Supabase
export async function GET() {
  try {
    const supabase = await createClient();

    // Intentar leer usuario autenticado
    const { data: userData, error: userError } = await supabase.auth.getUser();

    // Intentar leer session
    const { data: sessionData, error: sessionError } = await supabase.auth.getSession();

    // Verificar variables de entorno (sin exponer secrets completos)
    const url = process.env.NEXT_PUBLIC_SUPABASE_URL || "missing";
    const anonKeyPrefix = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY
      ? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY.slice(0, 20) + "..."
      : "missing";
    const serviceKeyPrefix = process.env.SUPABASE_SERVICE_ROLE_KEY
      ? process.env.SUPABASE_SERVICE_ROLE_KEY.slice(0, 20) + "..."
      : "missing";

    return NextResponse.json({
      timestamp: new Date().toISOString(),
      env: {
        url,
        anonKeyPrefix,
        serviceKeyPrefix,
      },
      user: {
        exists: !!userData.user,
        email: userData.user?.email || null,
        id: userData.user?.id || null,
        error: userError ? userError.message : null,
      },
      session: {
        exists: !!sessionData.session,
        expiresAt: sessionData.session?.expires_at || null,
        error: sessionError ? sessionError.message : null,
      },
    });
  } catch (err) {
    return NextResponse.json(
      {
        error: err instanceof Error ? err.message : "Unknown error",
        stack: err instanceof Error ? err.stack : null,
      },
      { status: 500 }
    );
  }
}
