# Auth — Opciones de configuración en Supabase

## Opción recomendada para demo: Auto-confirm (sin email)

Para que el registro sea instantáneo y evitar rate limits de Supabase free tier:

### Pasos en Supabase Dashboard

1. Andá a: https://supabase.com/dashboard/project/rgzfcsyszhuoxnjwulqc
2. Menú lateral → **Authentication** → **Providers** → **Email**
3. Desactivá el toggle **"Confirm email"** (o "Enable email confirmations")
4. Guardá cambios

Con eso, cuando un usuario se registra, Supabase crea la cuenta inmediatamente y el código lo redirige al chat al toque.

---

## Alternativa: Mantener confirmación por email con servicio externo

Si querés enviar correos reales sin depender del limitado sistema de Supabase free tier, podés usar **Resend** (gratis hasta 3,000 emails/mes):

1. Crear cuenta en https://resend.com
2. Obtener API key
3. Configurar en Supabase: Authentication → SMTP Settings → Enable Custom SMTP
4. Poner los datos de Resend (host, port, user, password/API key)

Esto requiere setup extra pero permite confirmaciones reales sin rate limits de Supabase.

---

## Nota de seguridad

Para producción real se recomienda mantener confirmación por email. El auto-confirm es solo para demos o MVP iniciales donde la fricción de registro debe ser mínima.
