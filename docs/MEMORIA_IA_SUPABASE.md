# Memoria del chat + IA (Supabase, costo 0)

## Objetivo
Guardar el historial de chat para que el usuario vuelva otro dia y continue donde quedo, sin perder contexto. La integracion debe mantener el costo en 0 Bs.

## Opciones de memoria (costo 0)
1) **Local (sin login)**
   - Guardado en el navegador (localStorage / IndexedDB).
   - Pros: cero costo, simple.
   - Contras: solo ese dispositivo; si borra cache, se pierde.

2) **Supabase (con login)**
   - Auth + Postgres (free tier).
   - Pros: memoria multi-dispositivo, trazabilidad por usuario.
   - Contras: requiere login (OTP o magic link).

## Arquitectura minima con Supabase
### Auth
- Metodo recomendado: OTP por email o magic link.
- Cada usuario tiene `auth.users.id`.

### Base de datos
Tablas minimas:
- `profiles` (opcional, para nombre)
- `conversations` (una o varias por usuario)
- `messages` (historial completo)

#### SQL sugerido (minimo)
```sql
create table profiles (
  id uuid primary key references auth.users(id),
  display_name text,
  created_at timestamptz default now()
);

create table conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) not null,
  title text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references conversations(id) not null,
  role text check (role in ('user','assistant','system')),
  content text not null,
  created_at timestamptz default now()
);

create index messages_conversation_id_idx on messages (conversation_id);
```

#### RLS (seguridad minima)
```sql
alter table conversations enable row level security;
alter table messages enable row level security;

create policy "conversations by owner" on conversations
  for all using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create policy "messages by conversation owner" on messages
  for all using (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  )
  with check (
    exists (
      select 1 from conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );
```

## Flujo de la app (con IA)
1) Usuario inicia sesion.
2) Se carga la ultima conversacion (o se crea una nueva).
3) Usuario envia un mensaje -> se guarda en `messages`.
4) Motor de IA procesa contexto + datos.
5) Respuesta de IA -> se guarda en `messages`.
6) UI muestra historial completo.

## IA para empezar (costo 0)
### Opcion A: Motor por reglas (recomendado para demo)
- Intentos + dataset local.
- Respuestas predefinidas y estables.
- Ideal para validar el flujo y la UI.

### Opcion B: LLM local (Ollama)
- Si el hardware lo permite, se usa un modelo local.
- Costo 0, pero requiere instalacion y consumo de recursos.

## Interfaz de integracion (idea minima)
Entrada:
- `messages[]` (ultimos N)
- `contextoDatos` (catalogo, stock, sucursales)

Salida:
- `reply` (texto)
- `ui_payload` (instrucciones para panel visual)

## Costos
- Supabase free tier + IA local/reglas = 0 Bs.
- No se usan APIs pagadas en esta fase.
