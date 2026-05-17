import { NextRequest, NextResponse } from "next/server";

// Verificar si un usuario ya existe por email usando Admin API
async function checkUserExists(email: string): Promise<boolean> {
  try {
    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`;
    const res = await fetch(url, {
      method: "GET",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
    });

    if (!res.ok) {
      console.error("[checkUserExists] Failed to list users:", res.status);
      return false; // Asumir que no existe para no bloquear
    }

    const data = await res.json();
    const users = data.users || [];
    const exists = users.some((u: { email?: string }) => 
      u.email?.toLowerCase() === email.toLowerCase()
    );
    return exists;
  } catch (e) {
    console.error("[checkUserExists] Error:", e);
    return false;
  }
}

// Endpoint de registro que usa service_role para crear usuarios
// sin necesidad de confirmación por email
export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { email, password, username, full_name, phone } = body;

    if (!email || !password) {
      return NextResponse.json(
        { error: "Email y contraseña son requeridos" },
        { status: 400 }
      );
    }

    if (password.length < 8) {
      return NextResponse.json(
        { error: "La contraseña debe tener al menos 8 caracteres" },
        { status: 400 }
      );
    }

    // Verificar si el usuario ya existe
    const emailTrimmed = email.trim().toLowerCase();
    const userExists = await checkUserExists(emailTrimmed);
    
    if (userExists) {
      return NextResponse.json(
        { error: "Este correo ya está registrado. Intenta iniciar sesión." },
        { status: 409 }
      );
    }

    const url = `${process.env.NEXT_PUBLIC_SUPABASE_URL}/auth/v1/admin/users`;

    const res = await fetch(url, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${process.env.SUPABASE_SERVICE_ROLE_KEY}`,
        "Content-Type": "application/json",
        apikey: process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      },
      body: JSON.stringify({
        email: emailTrimmed,
        password,
        email_confirm: true,
        user_metadata: {
          username: username || undefined,
          full_name: full_name || undefined,
          phone: phone || undefined,
        },
      }),
    });

    const data = await res.json();

    console.log("Supabase register response:", res.status, JSON.stringify(data, null, 2));

    if (!res.ok) {
      const msg = data.message || data.error_description || data.msg || "Error al crear usuario";
      return NextResponse.json({ error: msg }, { status: res.status });
    }

    return NextResponse.json({
      success: true,
      user: {
        id: data.id,
        email: data.email,
      },
    });
  } catch (err) {
    console.error("POST /api/auth/register error:", err);
    return NextResponse.json(
      { error: err instanceof Error ? err.message : "Error interno" },
      { status: 500 }
    );
  }
}
