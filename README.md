# 🎬 CineVault

> A modern, full-featured movie & TV discovery platform built with React, Vite, Supabase, and the TMDB API.

![CineVault Banner](https://image.tmdb.org/t/p/original/placeholder.jpg)

---

## 📋 Table of Contents

- [Overview](#-overview)
- [Features](#-features)
- [Tech Stack](#-tech-stack)
- [Project Structure](#-project-structure)
- [Getting Started](#-getting-started)
  - [Prerequisites](#prerequisites)
  - [Installation](#installation)
  - [Environment Variables](#environment-variables)
- [Supabase Setup](#-supabase-setup)
- [Architecture](#-architecture)
  - [Routing](#routing)
  - [Auth Context](#auth-context)
  - [Custom Hooks](#custom-hooks)
  - [Components](#components)
  - [Pages](#pages)
  - [API Layer (TMDB)](#api-layer-tmdb)
- [Security Features](#-security-features)
- [Scripts](#-scripts)
- [Contributing](#-contributing)
- [License](#-license)

---

## 🌟 Overview

CineVault is a feature-rich cinema discovery application that lets users explore trending movies and TV shows, maintain personal watchlists and favorites, and stream content directly through an embedded video player — all backed by Supabase for authentication and persistent user data, and the TMDB API for media metadata.

---

## ✨ Features

| Feature | Description |
|---|---|
| 🔍 **Search** | Real-time movie & TV show search powered by TMDB |
| 🎭 **Genre Filtering** | Browse content by genre across Movies and TV |
| 🎬 **Actors & Crews** | Explore popular actors, with dedicated bios and filmographies |
| 📺 **Video Player** | In-app streaming with 3 fallback sources + YouTube trailer support |
| ❤️ **Favorites** | Save your favourite titles to a personal list |
| 📌 **Watchlist** | Keep track of what you want to watch next |
| 👤 **User Profiles** | Editable profile with avatar upload and bio |
| 🔐 **Authentication** | Email/password and Google OAuth sign-in via Supabase |
| 🧩 **Dynamic Nav** | "Adults" tab visibility controlled by a Supabase feature flag |
| 📱 **Mobile Preview** | Built-in mobile viewport toggle for development/testing |
| 🛡️ **Dev Protection** | Context-menu & DevTools keyboard shortcut blocking |
| 💀 **Skeleton Loading** | Skeleton card placeholders for smooth perceived performance |
| 🌐 **Guest Mode** | Browse content without signing in; auth prompt on interaction |

---

## 🛠 Tech Stack

| Layer | Technology |
|---|---|
| **Framework** | [React 19](https://react.dev/) |
| **Build Tool** | [Vite 8](https://vitejs.dev/) |
| **Routing** | [React Router DOM 7](https://reactrouter.com/) |
| **Backend / Auth** | [Supabase](https://supabase.com/) (PostgreSQL + Auth + Storage) |
| **Movie Data** | [TMDB API v3](https://developer.themoviedb.org/docs) |
| **Styling** | [Tailwind CSS 3](https://tailwindcss.com/) + Vanilla CSS |
| **Icons** | Custom inline SVG components (`CustomIcons.jsx`) |
| **Linting** | ESLint 9 + React Hooks + React Refresh plugins |
| **Compiler** | Babel + `babel-plugin-react-compiler` |

---

## 📁 Project Structure

```
cinevault/
├── public/                   # Static assets
├── src/
│   ├── assets/               # Images, fonts, and other static assets
│   ├── components/           # Reusable UI components
│   │   ├── CustomIcons.jsx   # All custom SVG icon components
│   │   ├── Footer.jsx        # Site footer
│   │   ├── GenreFilter.jsx   # Horizontal genre pill filter bar
│   │   ├── GuestBanner.jsx   # Banner shown to unauthenticated users
│   │   ├── HeroSection.jsx   # Animated homepage hero with featured title
│   │   ├── MobileViewToggle.jsx  # Floating button to preview in mobile frame
│   │   ├── MovieCard.jsx     # Poster card with rating, actions & hover effects
│   │   ├── MovieRow.jsx      # Horizontal scrollable row of MovieCards
│   │   ├── Navbar.jsx        # Responsive top navigation bar
│   │   ├── Pagination.jsx    # Page navigation controls
│   │   ├── SkeletonCard.jsx  # Loading placeholder card
│   │   └── VideoPlayer.jsx   # Embedded video player with source fallback
│   ├── context/
│   │   ├── AuthContext.jsx        # Global auth state + actions (useAuth hook)
│   │   └── GuestModalContext.jsx  # Guest prompt modal state management
│   ├── hooks/
│   │   ├── useDevProtection.js    # Blocks right-click & DevTools shortcuts
│   │   └── useSiteSettings.js     # Reads feature flags from Supabase
│   ├── lib/
│   │   ├── supabase.js            # Supabase client initialisation
│   │   ├── tmdb.js                # TMDB API helper functions
│   │   ├── useSupabaseLists.js    # Hook: favourites & watchlist CRUD
│   │   └── useWatchlist.js        # Hook: watchlist-specific operations
│   ├── pages/
│   │   ├── ActorDetail.jsx        # Detailed biography and filmography page for an actor
│   │   ├── Actors.jsx             # Browse actors with gender and popularity filters
│   │   ├── Favorites.jsx          # User's saved favourites page
│   │   ├── ForgotPassword.jsx     # Password reset request page
│   │   ├── Genre.jsx              # Dedicated movie list filtered by specific genre
│   │   ├── Home.jsx               # Homepage (hero + movie rows + genre cards)
│   │   ├── Login.jsx              # Email & Google sign-in page
│   │   ├── MovieDetail.jsx        # Full movie detail + video player
│   │   ├── Movies.jsx             # Browse all movies with pagination
│   │   ├── Profile.jsx            # User profile editor & stats
│   │   ├── Search.jsx             # Search results page
│   │   ├── Signup.jsx             # New account registration page
│   │   ├── TV.jsx                 # Browse TV shows
│   │   └── Watchlist.jsx          # User's watchlist page
│   ├── App.jsx                    # Root component with providers & routing
│   ├── main.jsx                   # React entry point
│   └── index.css                  # Global styles & Tailwind directives
├── .env                           # Local environment variables (git-ignored)
├── .env.example                   # Environment variable template
├── SUPABASE_SETUP.md              # Supabase SQL migration guide
├── tailwind.config.js             # Tailwind theme customisation
├── vite.config.js                 # Vite build configuration
└── package.json
```

---

## 🚀 Getting Started

### Prerequisites

- **Node.js** ≥ 18
- **npm** ≥ 9
- A [TMDB account](https://www.themoviedb.org/signup) — to get a free API key
- A [Supabase project](https://supabase.com/) — free tier works perfectly

### Installation

```bash
# 1. Clone the repository
git clone https://github.com/Khuzaim123/CineVault.git
cd CineVault/cinevault

# 2. Install dependencies
npm install

# 3. Copy the environment template
cp .env.example .env
```

### Environment Variables

Edit `.env` and fill in your keys:

```env
# ─── TMDB ────────────────────────────────────────────────────────────────────
# Get your API key from https://www.themoviedb.org/settings/api
VITE_TMDB_KEY=your_tmdb_api_key_here

# ─── Supabase ─────────────────────────────────────────────────────────────────
# Find these in your Supabase project → Settings → API
VITE_SUPABASE_URL=https://your-project-id.supabase.co
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key_here
```

> **Never commit `.env` to version control.** It is already listed in `.gitignore`.

Then start the dev server:

```bash
npm run dev
# App is available at http://localhost:5173
```

---

## 🗄 Supabase Setup

CineVault requires several tables and policies in your Supabase project. See the full SQL migration reference in **[SUPABASE_SETUP.md](./SUPABASE_SETUP.md)**.

### Quick Summary

| Step | What it creates |
|---|---|
| 1 | `profiles` table — user profile data with RLS |
| 2 | `on_auth_user_created` trigger — auto-creates profile on signup |
| 3 | `favorites` table — per-user saved favourites with RLS |
| 4 | `watchlist` table — per-user watchlist with RLS |
| 5 | `avatars` storage bucket — public bucket for profile pictures |
| 6 | Google OAuth provider — optional social login |

### Feature Flags Table (Optional)

To use the dynamic Adults navigation tab, create the `site_settings` table:

```sql
create table if not exists public.site_settings (
  key   text primary key,
  value boolean not null default true
);

insert into public.site_settings (key, value)
values ('show_adult_section', true)
on conflict (key) do nothing;

-- Allow anonymous reads
alter table public.site_settings enable row level security;
create policy "Public read" on public.site_settings
  for select using (true);
```

Toggle the Adults tab without a deployment by updating this row:

```sql
update public.site_settings set value = false where key = 'show_adult_section';
```

---

## 🏗 Architecture

### Routing

All routes are defined in `src/App.jsx`. The application wraps the entire tree in:

```
<Router>
  <AuthProvider>
    <GuestModalProvider>
      <AppShell />        ← Navbar, Routes, MobileViewToggle
    </GuestModalProvider>
  </AuthProvider>
</Router>
```

| Path | Component | Description |
|---|---|---|
| `/` | `Home` | Hero + trending rows + clickable genre categories |
| `/movies` | `Movies` | Full movie browser with genre filter and sorting |
| `/tv` | `TV` | TV show browser |
| `/actors` | `Actors` | Browse popular actors with gender and sort filters |
| `/actor/:id` | `ActorDetail` | Actor bio, photo gallery, and clickable filmography |
| `/genre/:id` | `Genre` | Dedicated page for movies of a specific genre |
| `/search` | `Search` | Search results |
| `/movie/:id` | `MovieDetail` | Detail page + video player |
| `/watchlist` | `Watchlist` | Auth-protected watchlist |
| `/favorites` | `Favorites` | Auth-protected favourites |
| `/profile` | `Profile` | Auth-protected profile editor |
| `/login` | `Login` | Sign-in page |
| `/signup` | `Signup` | Registration page |
| `/forgot-password` | `ForgotPassword` | Password reset |

### Auth Context

`src/context/AuthContext.jsx` exposes a `useAuth()` hook providing:

| Value / Action | Type | Description |
|---|---|---|
| `user` | `object \| null` | Current Supabase user object |
| `session` | `object \| null` | Full session (includes JWT) |
| `loading` | `boolean` | True until initial session resolves |
| `avatarUrl` | `string \| null` | Shared avatar URL (Navbar ↔ Profile) |
| `setAvatarUrl` | `function` | Update shared avatar state |
| `signUp(email, password)` | `function` | Email/password registration |
| `signIn(email, password)` | `function` | Email/password login |
| `signInWithGoogle()` | `function` | Google OAuth PKCE flow |
| `signOut()` | `function` | Sign out and clear session |
| `resetPassword(email)` | `function` | Send password reset email |

### Custom Hooks

#### `useDevProtection()`
**File:** `src/hooks/useDevProtection.js`

Attaches event listeners to the document that:
- Prevent the browser context menu (right-click)
- Block DevTools keyboard shortcuts: `F12`, `Ctrl+Shift+I/J/C`, `Ctrl+U`, `Ctrl+S`
- Display a full-screen warning overlay when DevTools is detected via `window.outerWidth` / `outerHeight` difference
- Automatically skips when running inside an `<iframe>` (used by the mobile preview)

> **Note:** This is a UX-layer deterrent only. Experienced developers can always bypass client-side protections.

---

#### `useSiteSettings()`
**File:** `src/hooks/useSiteSettings.js`

Reads global feature flags from the `site_settings` Supabase table.

```js
const { showAdultSection, loading } = useSiteSettings();
```

| Return value | Type | Description |
|---|---|---|
| `showAdultSection` | `boolean` | Whether to show the Adults nav tab |
| `loading` | `boolean` | True during the initial fetch |

Uses a module-level cache (`_cache`) so all components share one database read per page load. Defaults to `true` if the table doesn't exist yet.

---

#### `useSupabaseLists` & `useWatchlist`
**Files:** `src/lib/useSupabaseLists.js`, `src/lib/useWatchlist.js`

CRUD helpers for the `favorites` and `watchlist` tables. Used by `MovieCard`, `MovieDetail`, `Favorites`, and `Watchlist` pages.

### Components

| Component | Purpose |
|---|---|
| `Navbar` | Top navigation: logo, links (dynamic Adults tab), search, user menu |
| `HeroSection` | Animated hero banner with featured movie backdrop, title, and CTA buttons |
| `MovieCard` | Poster card with rating badge, media-type label, and quick-add buttons |
| `MovieRow` | Horizontally scrollable row of `MovieCard`s with a section heading |
| `GenreFilter` | Pill-button genre selector that updates the current page's filter |
| `VideoPlayer` | Fullscreen modal player with 3 streaming sources + YouTube trailer fallback |
| `Pagination` | Previous / Next / page-number controls with ellipsis for large ranges |
| `GuestBanner` | Sticky banner prompting sign-in, shown to unauthenticated users |
| `MobileViewToggle` | Fixed bottom-right FAB that wraps the site in a phone frame for preview |
| `SkeletonCard` | Animated placeholder rendered while movie data loads |
| `Footer` | Site-wide footer with links and credits |
| `CustomIcons` | Library of reusable inline SVG icon components |

### VideoPlayer — Source Fallback Logic

```
User opens player
       │
       ▼
Source 1 (vidsrc.to)  ──onError──▶  Source 2 (vidsrc.me)
                                           │
                                        onError
                                           │
                                           ▼
                                    Source 3 (multiembed.mov)
                                           │
                                        onError
                                           │
                                           ▼
                                    YouTube Trailer (if available)
```

Users can also manually select any source at any time via the button row above the player.

### Pages

| Page | Key Features |
|---|---|
| `Home` | Hero section + Trending, Popular, Top Rated, Now Playing rows |
| `Movies` | Paginated grid, genre filter, trending/popular/top-rated tabs |
| `TV` | Same layout as Movies but for TV shows |
| `Search` | Debounced query input, paginated results, media type badge |
| `MovieDetail` | Backdrop, cast, runtime, genre chips, similar movies, video player trigger |
| `Profile` | Avatar upload to Supabase Storage, username/bio edit, stats (watchlist/fav count) |
| `Watchlist` | Grid of saved watchlist entries, remove button, empty state |
| `Favorites` | Grid of saved favourite entries, remove button, empty state |
| `Login` | Email + password form, Google OAuth button, link to signup |
| `Signup` | Registration form with success animation |
| `ForgotPassword` | Email input → Supabase password reset email |

### API Layer (TMDB)

All TMDB API calls are centralised in `src/lib/tmdb.js`:

```js
getTrending(page)           // Weekly trending movies
getPopular(page)            // Popular movies
getTopRated(page)           // Top-rated movies
getNowPlaying(page)         // Now playing in cinemas
getByGenre(genreId, page)   // Movies filtered by genre ID
discoverMovies(options)     // Movies filtered by genre ID with optional sorting
getMovieDetail(id)          // Full detail + videos + credits
searchMovies(query, page)   // Text search
getSimilar(id)              // Similar movies
getGenres()                 // Genre list

getTVTrending(page)         // Weekly trending TV
getTVPopular(page)          // Popular TV
getTVTopRated(page)         // Top-rated TV

getPopularPeople(page)      // Popular actors/actresses
getPersonDetail(id)         // Actor biography and combined credits
searchPeople(query, page)   // Text search for actors

IMAGE_BASE                  // "https://image.tmdb.org/t/p/"
getImageUrl(path, size)     // Constructs full image URL
```

---

## 🛡 Security Features

- **Row Level Security (RLS)** on all Supabase tables ensures users can only read and write their own data.
- **Context-menu blocking** and **DevTools keyboard shortcut prevention** via `useDevProtection`.
- **DevTools overlay warning** shown when the browser window/panel size difference exceeds 160 px threshold.
- **Environment variables** are used for all secrets; never hardcoded. The `.env` file is git-ignored.
- **OAuth PKCE flow** used for Google sign-in — no implicit grants.

---

## 📜 Scripts

```bash
# Start development server (hot-reload)
npm run dev

# Lint the codebase
npm run lint

# Build for production
npm run build

# Preview the production build locally
npm run preview
```

---

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch: `git checkout -b feat/your-feature`
3. Commit your changes: `git commit -m "feat: add your feature"`
4. Push the branch: `git push origin feat/your-feature`
5. Open a Pull Request

Please keep components focused and reusable, and follow the existing naming conventions.

---

## 📄 License

This project is for personal/educational use. Movie data is provided by [TMDB](https://www.themoviedb.org/) under their [API terms of use](https://www.themoviedb.org/documentation/api/terms-of-use).

<div align="center">
  <sub>Built with ❤️ using React + Supabase + TMDB</sub>
</div>