-- ─────────────────────────────────────────────────────────────
-- CineVault: Comments v2 migration
-- Run in Supabase SQL Editor after the first migration
-- ─────────────────────────────────────────────────────────────

-- 1. Add parent_id for nested replies (one level deep)
alter table public.comments
  add column if not exists parent_id uuid references public.comments(id) on delete cascade;

-- Index for fast reply lookups
create index if not exists comments_parent_idx on public.comments (parent_id);

-- 2. Comment likes table (per-user toggle)
create table if not exists public.comment_likes (
  user_id    uuid not null references auth.users(id) on delete cascade,
  comment_id uuid not null references public.comments(id) on delete cascade,
  created_at timestamptz not null default now(),
  primary key (user_id, comment_id)
);

alter table public.comment_likes enable row level security;

create policy "comment_likes_select" on public.comment_likes
  for select using (true);

create policy "comment_likes_insert" on public.comment_likes
  for insert with check (auth.uid() = user_id);

create policy "comment_likes_delete" on public.comment_likes
  for delete using (auth.uid() = user_id);
