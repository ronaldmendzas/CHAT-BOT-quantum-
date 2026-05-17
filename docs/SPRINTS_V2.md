# Plan de Sprints v2 — Quantum Guide + Supabase Auth

## Contexto
Migración de memoria/anónima a sistema de usuarios con autenticación y persistencia de chats en Supabase.

---

## Sprint 4 — Supabase Setup & Auth Backend
**Objetivo:** Conectar el proyecto a Supabase y preparar el backend de autenticación.

**Tareas**
- [ ] Instalar `@supabase/supabase-js` y `@supabase/ssr`.
- [ ] Configurar `NEXT_PUBLIC_SUPABASE_URL` y `NEXT_PUBLIC_SUPABASE_ANON_KEY` en `.env.local`.
- [ ] Crear `src/lib/supabase/client.ts` (cliente browser).
- [ ] Crear `src/lib/supabase/server.ts` (cliente server con cookie handler).
- [ ] Crear `src/lib/supabase/middleware.ts` (refresh de sesión en rutas).
- [ ] Crear `middleware.ts` en raíz del proyecto para proteger rutas.
- [ ] Ejecutar SQL en Supabase: tabla `profiles`, trigger `on_auth_user_created`, RLS policies.

**Criterios de salida**
- `npm run build` pasa sin errores.
- Cliente de Supabase se inicializa correctamente en browser y server.
- Tabla `profiles` existe con RLS activo.

---

## Sprint 5 — UI Registro / Login
**Objetivo:** Pantallas para que el usuario se registre e inicie sesión.

**Tareas**
- [ ] Crear página `app/auth/page.tsx` con tabs Login / Registro.
- [ ] Crear componente `components/auth/LoginForm.tsx` (email + password).
- [ ] Crear componente `components/auth/RegisterForm.tsx` (email, password, confirmar password, username, full_name, phone opcional).
- [ ] Validaciones: email formato, password mínimo 8 chars, passwords coinciden, username único.
- [ ] Integrar `supabase.auth.signUp` con `options.data` para username/full_name.
- [ ] Integrar `supabase.auth.signInWithPassword`.
- [ ] Manejar errores de Supabase (email ya existe, credenciales inválidas, etc.).
- [ ] Redirigir al chat después de login/registro exitoso.

**Criterios de salida**
- Usuario puede registrarse y aparece en `auth.users` + `profiles`.
- Usuario puede iniciar sesión y recibir JWT.
- Errores se muestran en UI (toast o mensaje rojo).

---

## Sprint 6 — Estado de Sesión en Header
**Objetivo:** Mostrar si el usuario está logueado y permitir logout.

**Tareas**
- [ ] Crear hook `src/hooks/useAuth.ts` para leer sesión desde Supabase.
- [ ] Modificar header/nav para mostrar: avatar/username cuando logueado, botón "Iniciar sesión" cuando no.
- [ ] Menú desplegable con: "Mis chats", "Cerrar sesión".
- [ ] Integrar `supabase.auth.signOut`.
- [ ] Recargar estado de sesión después de logout.

**Criterios de salida**
- Header refleja correctamente el estado de sesión.
- Logout limpia la sesión y recarga la página.
- Build sin errores.

---

## Sprint 7 — Persistencia de Chats (estilo ChatGPT)
**Objetivo:** Guardar conversaciones y mensajes en Supabase; mostrar historial en sidebar.

**Tareas SQL (a ejecutar en Supabase)**
- [ ] Crear tabla `conversations` (id, user_id, title, created_at, updated_at).
- [ ] Crear tabla `messages` (id, conversation_id, role, content, intent, created_at).
- [ ] Activar RLS y policies para que solo el dueño vea sus chats/mensajes.

**Tareas Código**
- [ ] Crear API `/api/conversations` (GET listar, POST crear nueva).
- [ ] Crear API `/api/messages` (GET por conversation_id, POST guardar mensaje).
- [ ] Modificar `ChatPanel.tsx` para cargar/guardar mensajes en Supabase cuando el usuario está logueado.
- [ ] Crear sidebar de conversaciones (`components/chat/ChatSidebar.tsx` o similar).
- [ ] Botón "Nuevo chat" que crea nueva `conversation`.
- [ ] Click en conversación anterior carga sus mensajes.
- [ ] Si usuario NO logueado, chat funciona en memoria (no se guarda nada).

**Criterios de salida**
- Mensajes se guardan en Supabase después de cada interacción (si logueado).
- Sidebar muestra lista de conversaciones ordenadas por fecha.
- Build sin errores.

---

## Sprint 8 — Migración de Datos a Supabase
**Objetivo:** Subir productos, sucursales, stock, media y leads a Supabase. Refactor APIs para leer desde DB.

**Tareas SQL**
- [ ] Crear tabla `categories`.
- [ ] Crear tabla `products` (con campos del DATA_CONTRACT).
- [ ] Crear tabla `product_media`.
- [ ] Crear tabla `sucursales`.
- [ ] Crear tabla `stock`.
- [ ] Crear tabla `leads`.

**Tareas Código**
- [ ] Script `scripts/migrate-to-supabase.ts` que lea todos los JSON locales y los inserte en Supabase.
- [ ] Refactor `/api/products` → query a Supabase.
- [ ] Refactor `/api/products/[id]` → query a Supabase.
- [ ] Refactor `/api/stock` → query a Supabase.
- [ ] Refactor `/api/sucursales` → query a Supabase.
- [ ] Refactor `/api/test-drive` → insert en tabla `leads` de Supabase.
- [ ] Borrar/deprecar lectura de archivos JSON locales en APIs (dejar como backup).

**Criterios de salida**
- Todas las APIs consumen datos desde Supabase.
- Script de migración corre exitosamente sin errores.
- Build sin errores.

---

## Dependencias entre Sprints
- Sprint 4 bloquea a Sprint 5 y 6.
- Sprint 5/6 bloquean a Sprint 7 (necesitás login para guardar chats por usuario).
- Sprint 8 es independiente (migración de datos estáticos), puede hacerse en paralelo con 5/6/7 si hay recursos.

## Notas
- Costo: $0 (Supabase free tier).
- No se toca la lógica del motor de IA (Groq/HF/reglas), solo se agrega persistencia.
- Los JSON locales se mantienen como backup hasta confirmar que todo funciona en Supabase.
