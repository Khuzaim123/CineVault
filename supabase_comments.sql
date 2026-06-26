-- ─────────────────────────────────────────────────────────────
-- CineVault: Comments table
-- Run this in your Supabase SQL Editor (Dashboard → SQL Editor)
-- ─────────────────────────────────────────────────────────────

create table if not exists public.comments (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references auth.users(id) on delete cascade,
  media_id    integer not null,          -- TMDB movie/show ID
  media_type  text not null check (media_type in ('movie', 'tv')),
  content     text not null check (char_length(content) between 1 and 1000),
  likes       integer not null default 0,
  created_at  timestamptz not null default now(),
  updated_at  timestamptz not null default now()
);

-- Index for fast lookups per movie/show
create index if not exists comments_media_idx on public.comments (media_id, media_type, created_at desc);

-- Store display name so we don't need a join every time
alter table public.comments
  add column if not exists user_name text,
  add column if not exists user_avatar text;

-- Row Level Security
alter table public.comments enable row level security;

-- Anyone can read comments
create policy "comments_select" on public.comments
  for select using (true);

-- Only authenticated users can insert their own comments
create policy "comments_insert" on public.comments
  for insert with check (auth.uid() = user_id);

-- Users can only update/delete their own comments
create policy "comments_update" on public.comments
  for update using (auth.uid() = user_id);

create policy "comments_delete" on public.comments
  for delete using (auth.uid() = user_id);
