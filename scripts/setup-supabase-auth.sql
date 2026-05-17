-- ============================================================
-- Quantum Guide — Schema de autenticación + perfiles
-- Ejecutar esto en Supabase SQL Editor (New query → Run)
-- ============================================================

-- 1. Tabla de perfiles (extensión de auth.users)
create table if not exists public.profiles (
  id uuid primary key references auth.users(id) on delete cascade,
  username text unique,
  full_name text,
  phone text,
  city text,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

-- 2. Seguridad: solo el dueño puede ver/editar su perfil
alter table public.profiles enable row level security;

-- Borrar policies viejas si existen (para evitar duplicados)
drop policy if exists "profiles_select_own" on public.profiles;
drop policy if exists "profiles_update_own" on public.profiles;

create policy "profiles_select_own"
  on public.profiles for select
  using (auth.uid() = id);

create policy "profiles_update_own"
  on public.profiles for update
  using (auth.uid() = id);

-- 3. Trigger: cuando un usuario se registra, crear automáticamente su perfil
create or replace function public.handle_new_user()
returns trigger
language plpgsql
security definer set search_path = public
as $$
begin
  insert into public.profiles (id, username, full_name)
  values (
    new.id,
    new.raw_user_meta_data->>'username',
    new.raw_user_meta_data->>'full_name'
  );
  return new;
end;
$$;

-- Borrar trigger viejo si existe
drop trigger if exists on_auth_user_created on auth.users;

create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 4. Verificación
select 'Tabla profiles creada' as status;
select 'Trigger on_auth_user_created activo' as status;
