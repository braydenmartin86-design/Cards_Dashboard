-- Cloud sync storage for CardFlip EV. Run once in Supabase: SQL Editor -> New query -> Run.
-- One row per signed-in user per data list (cards, Pokémon, targets, box breaks, ...).

create table if not exists public.app_data (
  user_id   uuid   not null default auth.uid() references auth.users (id) on delete cascade,
  key       text   not null,
  data      jsonb  not null,
  saved_at  bigint not null,
  updated_at timestamptz not null default now(),
  primary key (user_id, key)
);

-- Only the signed-in owner can see or change their rows. The public anon key in the page
-- can't read anyone's data without being signed into that account.
alter table public.app_data enable row level security;

drop policy if exists "Users read own data" on public.app_data;
create policy "Users read own data" on public.app_data
  for select using (auth.uid() = user_id);

drop policy if exists "Users insert own data" on public.app_data;
create policy "Users insert own data" on public.app_data
  for insert with check (auth.uid() = user_id);

drop policy if exists "Users update own data" on public.app_data;
create policy "Users update own data" on public.app_data
  for update using (auth.uid() = user_id) with check (auth.uid() = user_id);

drop policy if exists "Users delete own data" on public.app_data;
create policy "Users delete own data" on public.app_data
  for delete using (auth.uid() = user_id);
