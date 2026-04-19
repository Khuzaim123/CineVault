# CineVault — Supabase Setup Guide

Run these SQL statements in your Supabase SQL Editor (https://supabase.com/dashboard → SQL Editor).

---

## 1. profiles table

```sql
create table if not exists public.profiles (
  id uuid references auth.users(id) on delete cascade primary key,
  username text unique,
  full_name text,
  avatar_url text,
  bio text,
  created_at timestamptz default now()
);

-- Enable Row Level Security
alter table public.profiles enable row level security;

create policy "Users can view own profile"
  on public.profiles for select
  using (auth.uid() = id);

create policy "Users can insert own profile"
  on public.profiles for insert
  with check (auth.uid() = id);

create policy "Users can update own profile"
  on public.profiles for update
  using (auth.uid() = id);
```

## 2. Auto-create profile on signup (trigger)

```sql
create or replace function public.handle_new_user()
returns trigger as $$
begin
  insert into public.profiles (id)
  values (new.id)
  on conflict (id) do nothing;
  return new;
end;
$$ language plpgsql security definer;

create or replace trigger on_auth_user_created
  after insert on auth.users
  for each row execute function public.handle_new_user();
```

## 3. favorites table

```sql
create table if not exists public.favorites (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_movie_id integer not null,
  movie_title text,
  poster_path text,
  vote_average numeric,
  release_date text,
  media_type text default 'movie',
  added_at timestamptz default now(),
  unique(user_id, tmdb_movie_id)
);

alter table public.favorites enable row level security;

create policy "Users manage own favorites"
  on public.favorites for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## 4. watchlist table

```sql
create table if not exists public.watchlist (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references public.profiles(id) on delete cascade not null,
  tmdb_movie_id integer not null,
  movie_title text,
  poster_path text,
  vote_average numeric,
  release_date text,
  media_type text default 'movie',
  added_at timestamptz default now(),
  unique(user_id, tmdb_movie_id)
);

alter table public.watchlist enable row level security;

create policy "Users manage own watchlist"
  on public.watchlist for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);
```

## 5. avatars storage bucket

In Supabase Dashboard → Storage → New bucket:
- Name: `avatars`
- Public: ✅ Yes

Then add this storage policy in SQL Editor:

```sql
create policy "Avatar images are publicly accessible."
  on storage.objects for select
  using (bucket_id = 'avatars');

create policy "Users can upload own avatar."
  on storage.objects for insert
  with check (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);

create policy "Users can update own avatar."
  on storage.objects for update
  using (bucket_id = 'avatars' AND auth.uid()::text = (storage.foldername(name))[1]);
```

## 6. Enable Google OAuth (optional)

In Supabase Dashboard → Authentication → Providers → Google:
- Enable Google
- Add your Google OAuth Client ID and Secret
- Set authorized redirect URI in Google Console to:
  `https://kuygjfoezknxzuivcmen.supabase.co/auth/v1/callback`
