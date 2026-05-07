-- ============================================================
-- PredictionTrade — Unified Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Profiles table (auto-created on signup via trigger)
create table if not exists profiles (
  id           uuid primary key references auth.users(id) on delete cascade,
  email        text,
  display_name text,
  avatar_url   text,
  created_at   timestamptz default now(),
  updated_at   timestamptz default now()
);

alter table profiles enable row level security;

create policy "Users can view own profile"
  on profiles for select using (auth.uid() = id);

create policy "Users can update own profile"
  on profiles for update using (auth.uid() = id);

create policy "Profiles are publicly readable"
  on profiles for select using (true);

-- Trigger: auto-create profile on signup
create or replace function public.handle_new_user()
returns trigger language plpgsql security definer set search_path = public as $$
begin
  insert into public.profiles (id, email, display_name)
  values (
    new.id,
    new.email,
    coalesce(new.raw_user_meta_data->>'display_name', split_part(new.email, '@', 1))
  )
  on conflict (id) do nothing;
  return new;
end;
$$;

drop trigger if exists on_auth_user_created on auth.users;
create trigger on_auth_user_created
  after insert on auth.users
  for each row execute procedure public.handle_new_user();

-- 2. Game results table (keep existing, just ensure it exists)
create table if not exists game_results (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  profit       float not null,
  profit_pct   float not null,
  position     text check (position in ('buy', 'sell')),
  entry_price  float,
  exit_price   float,
  duration     text check (duration in ('30s', '60s', '3min')),
  won          boolean default false,
  created_at   timestamptz default now()
);

alter table game_results enable row level security;

create policy "Users can insert own game results"
  on game_results for insert
  with check (auth.uid() = user_id);

create policy "Game results are public for leaderboard"
  on game_results for select
  using (true);

-- 3. Demo portfolios table (keep existing)
create table if not exists demo_portfolios (
  id               uuid primary key default gen_random_uuid(),
  user_id          uuid references auth.users(id) on delete cascade unique,
  balance          float default 10000,
  positions        jsonb default '[]'::jsonb,
  activity         jsonb default '[]'::jsonb,
  starting_balance float default 10000,
  updated_at       timestamptz default now(),
  created_at       timestamptz default now()
);

alter table demo_portfolios enable row level security;

create policy "Users can manage own demo portfolio"
  on demo_portfolios for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- 4. Academy progress table (NEW)
create table if not exists academy_progress (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid references auth.users(id) on delete cascade,
  lesson_id    text not null,
  level_id     text not null,
  completed_at timestamptz default now(),
  unique(user_id, lesson_id)
);

alter table academy_progress enable row level security;

create policy "Users can manage own academy progress"
  on academy_progress for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

create index if not exists idx_academy_progress_user on academy_progress(user_id);

-- 5. Game leaderboard view (fixed streak + wins_count)
create or replace view game_leaderboard as
select
  gr.user_id,
  coalesce(p.display_name, u.raw_user_meta_data->>'display_name', u.email, 'Anonymous') as display_name,
  count(*)::int                                    as games_played,
  count(*) filter (where gr.won = true)::int       as wins_count,
  sum(gr.profit)                                   as total_profit,
  coalesce((
    select max(streak_len)::int
    from (
      select count(*) as streak_len
      from (
        select
          won,
          row_number() over (order by created_at) -
          row_number() over (partition by won order by created_at) as grp
        from game_results g2
        where g2.user_id = gr.user_id
      ) grouped
      where won = true
      group by grp
    ) streaks
  ), 0) as best_streak
from game_results gr
join auth.users u on u.id = gr.user_id
left join profiles p on p.id = gr.user_id
group by gr.user_id, p.display_name, u.raw_user_meta_data, u.email;

-- 6. Indexes
create index if not exists idx_game_results_user    on game_results(user_id);
create index if not exists idx_game_results_profit  on game_results(profit desc);
create index if not exists idx_game_results_created on game_results(created_at desc);
create index if not exists idx_demo_portfolios_user on demo_portfolios(user_id);
