# Project Overview
Create a React Native mobile application using Expo for "CineVault", a premium movie and TV show tracking app. The app must perfectly match the design, theme, and features of the existing React web application.

## 🛠 Tech Stack
- **Framework:** React Native with Expo (Managed Workflow)
- **Styling:** NativeWind (Tailwind CSS for React Native)
- **Navigation:** React Navigation (Bottom Tabs + Native Stack)
- **Backend/Auth:** Supabase (`@supabase/supabase-js` + `@react-native-async-storage/async-storage` for persistence)
- **Data Source:** TMDB API
- **Icons:** Custom `react-native-svg` icons to match the website perfectly.

---

## 🎨 Theme & Styling
The app uses a dark, premium glassmorphism aesthetic with gold accents.

### Colors
Update the `tailwind.config.js` (for NativeWind) with these exact values:
- `background`: '#07080F'
- `surface`: '#0F1120'
- `gold-DEFAULT`: '#E8B84B'
- `gold-glow`: 'rgba(232, 184, 75, 0.15)'
- `crimson`: '#C0392B'
- `text-primary`: '#F0EDE8'
- `text-muted`: '#6B6875'

### Typography
Use `expo-google-fonts` to load the exact fonts used on the website:
- **Display Font:** `Playfair Display` (serif)
- **Body Font:** `DM Sans` (sans-serif)

### UI Characteristics
- **Glassmorphism:** Use `expo-blur` to create glass effects. Base style equivalent: `backgroundColor: 'rgba(255, 255, 255, 0.05)'` with a blur tint.
- **Scrollbars:** Hide scrollbars on horizontal lists (Movie Rows, Actor lists).

---

## 🔐 Environment Variables & Supabase Setup
Create a `.env` file with the following variables. Ensure the app uses them securely.

```env
# TMDB Setup
EXPO_PUBLIC_TMDB_KEY=fb7bb23f03b6994dafc674c074d01761

# RapidAPI Setup (If needed)
EXPO_PUBLIC_RAPIDAPI_KEY=5ba48c135cmsh4556544e554fc32p1610acjsn8d89a50e0827

# Supabase Setup
EXPO_PUBLIC_SUPABASE_URL=https://kuygjfoezknxzuivcmen.supabase.co
EXPO_PUBLIC_SUPABASE_ANON_KEY=sb_publishable_Fm2gJqqtebIAXHlmKTW1Ug_5YejUSi6
```

Initialize Supabase in a `src/lib/supabase.js` file using `AppState` and `AsyncStorage` to handle session persistence in React Native.

### Database Schema Requirements
The app must interact with the following Supabase tables with Row Level Security (RLS) enabled:
1. **`profiles`**: `id` (uuid, refs auth.users), `username`, `full_name`, `avatar_url`, `bio`, `created_at`.
   - *Note: A trigger `on_auth_user_created` automatically inserts a row here when a user signs up.*
2. **`favorites`**: `id`, `user_id` (uuid, refs profiles), `tmdb_movie_id` (integer), `movie_title`, `poster_path`, `vote_average`, `release_date`, `media_type` (default 'movie'), `added_at`.
   - *Unique constraint on `(user_id, tmdb_movie_id)`.*
3. **`watchlist`**: Same schema as favorites.

### Storage Buckets
- **`avatars`**: A public bucket used to store user profile images. Ensure the app uses `supabase.storage.from('avatars')` to upload and retrieve images.

---

## 📱 App Navigation Structure
Implement a hybrid navigation setup using `@react-navigation/native`:

1. **Auth Stack (If user is not logged in):**
   - Login Screen
   - Signup Screen
   - Forgot Password Screen
   - Guest Access (Bypass login to browse movies)
2. **Main Tab Navigator (If user is logged in or in Guest Mode):**
   - Home
   - Movies
   - TV Shows
   - Profile (Contains Favorites & Watchlist)
3. **Detail Stack (Overlayed on tabs):**
   - Movie/TV Detail Screen
   - Actor Detail Screen
   - Video Player Screen (Use `expo-av` or `react-native-youtube-iframe` for trailers)
   - Search Screen

---

## 🧩 Custom SVGs (CRITICAL)
Do NOT use generic icon libraries. You must recreate the exact custom SVGs from the web app using `react-native-svg`. Here are a few core examples that must be implemented exactly like this:

**Play Icon:**
```jsx
import Svg, { Circle, Path } from 'react-native-svg';
export const PlayIcon = ({ size = 24, color = '#F0EDE8' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Circle cx="12" cy="12" r="10" stroke={color} strokeWidth="1.5" />
    <Path d="M10 8L16 12L10 16V8Z" fill={color} />
  </Svg>
);
```

**Star Icon:**
```jsx
import Svg, { Path } from 'react-native-svg';
export const StarIcon = ({ size = 24, color = '#E8B84B' }) => (
  <Svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <Path 
      d="M12 2L15.09 8.26L22 9.27L17 14.14L18.18 21.02L12 17.77L5.82 21.02L7 14.14L2 9.27L8.91 8.26L12 2Z" 
      fill={color} stroke={color} strokeWidth="1.5" strokeLinejoin="round"
    />
  </Svg>
);
```
*(Implement similar `react-native-svg` components for HeartIcon, SearchIcon, BookmarkIcon, UserIcon, LogOutIcon, etc., using a generic `currentColor` approach mapped to the active theme color).*

---

## 🚀 Key Features to Implement
1. **Hero Section:** A featured movie/show at the top of the Home screen with a large poster background, gradient overlay, and "Play" / "More Info" buttons.
2. **Horizontal Movie Rows:** Scrollable horizontal lists for "Trending", "Top Rated", etc. Include a Skeleton Loading state while fetching from TMDB.
3. **Authentication & Guest Flow:** Full Supabase email/password authentication. Provide elegant error handling and loading states using the Gold color theme. Include a "Continue as Guest" mode where users can browse content but are prompted to sign in if they try to use features like Favorites or Watchlist.
4. **Detail Pages:** When clicking a movie, show a backdrop image, title, genres, overview, Cast (horizontal scroll of actors), and an "Add to Favorites/Watchlist" button that syncs with Supabase.
5. **Video Playback (Full Movies & Trailers):** The web app allows users to watch the actual movies/shows by embedding third-party streaming sources. You must replicate this using `react-native-webview` for the streams and `react-native-youtube-iframe` for the trailer fallback. 
   - Implement a custom video player overlay with a source selector (buttons to switch between sources).
   - **Source 1:** `https://vidsrc.to/embed/{tv_or_movie}/{tmdbId}`
   - **Source 2:** `https://vidsrc.me/embed/{tv_or_movie}?tmdb={tmdbId}`
   - **Source 3:** `https://multiembed.mov/?tmdb=1&video_id={tmdbId}&tmdb_type={tv_or_movie}`
   - **Trailer (Source 4):** `https://www.youtube.com/embed/{trailerKey}?autoplay=1`
   - *Logic:* Auto-advance to the next source if a stream fails to load. Use a dark, blurred backdrop behind the player.
