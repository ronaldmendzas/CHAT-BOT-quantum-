-- ============================================================
-- Quantum Guide — Schema de conversaciones y mensajes
-- Ejecutar esto en Supabase SQL Editor (New query → Run)
-- ============================================================

-- 1. Tabla de conversaciones (una por chat del usuario)
create table if not exists public.conversations (
  id uuid primary key default gen_random_uuid(),
  user_id uuid references auth.users(id) on delete cascade not null,
  title text default 'Nueva conversación',
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Tabla de mensajes (dentro de una conversación)
create table if not exists public.messages (
  id uuid primary key default gen_random_uuid(),
  conversation_id uuid references public.conversations(id) on delete cascade not null,
  role text check (role in ('user','assistant')) not null,
  content text not null,
  intent text,
  created_at timestamptz default now()
);

-- 3. Seguridad: solo el dueño puede ver/editar sus conversaciones y mensajes
alter table public.conversations enable row level security;
alter table public.messages enable row level security;

-- Policies para conversations
drop policy if exists "conversations_select_own" on public.conversations;
drop policy if exists "conversations_insert_own" on public.conversations;
drop policy if exists "conversations_delete_own" on public.conversations;

create policy "conversations_select_own"
  on public.conversations for select
  using (auth.uid() = user_id);

create policy "conversations_insert_own"
  on public.conversations for insert
  with check (auth.uid() = user_id);

create policy "conversations_delete_own"
  on public.conversations for delete
  using (auth.uid() = user_id);

-- Policies para messages
drop policy if exists "messages_select_own" on public.messages;
drop policy if exists "messages_insert_own" on public.messages;

create policy "messages_select_own"
  on public.messages for select
  using (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

create policy "messages_insert_own"
  on public.messages for insert
  with check (
    exists (
      select 1 from public.conversations c
      where c.id = messages.conversation_id
        and c.user_id = auth.uid()
    )
  );

-- 4. Índice para búsqueda rápida de mensajes por conversación
create index if not exists messages_conversation_id_idx on public.messages (conversation_id);

-- 5. Verificación
select 'Tablas conversations y messages creadas' as status;
select 'RLS y policies activos' as status;
select 'Índice messages_conversation_id_idx creado' as status;
