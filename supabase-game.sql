-- ============================================================
-- PredictionTrade Game — Supabase Schema
-- Run this in your Supabase SQL Editor
-- ============================================================

-- 1. Game results table
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

-- 2. Leaderboard view with correct streak (gaps-and-islands)
create or replace view game_leaderboard as
select
  gr.user_id,
  coalesce(u.raw_user_meta_data->>'display_name', u.email, 'Anonymous') as display_name,
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
  ), 0)                                            as best_streak
from game_results gr
join auth.users u on u.id = gr.user_id
group by gr.user_id, u.raw_user_meta_data, u.email;

-- 3. RLS
alter table game_results enable row level security;

create policy "Users can insert own results"
  on game_results for insert
  with check (auth.uid() = user_id);

create policy "Leaderboard is public"
  on game_results for select
  using (true);

-- 4. Indexes
create index if not exists idx_game_results_user    on game_results(user_id);
create index if not exists idx_game_results_profit  on game_results(profit desc);
create index if not exists idx_game_results_created on game_results(created_at desc);
