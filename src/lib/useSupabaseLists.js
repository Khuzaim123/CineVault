import { useState, useEffect, useCallback } from 'react';
import { supabase } from './supabase';
import { useAuth } from '../context/AuthContext';

/**
 * Hook for managing Supabase-backed favorites and watchlist.
 * Falls back gracefully when user is not logged in.
 */
export const useSupabaseLists = () => {
  const { user } = useAuth();
  const [favorites, setFavorites] = useState([]);
  const [watchlist, setWatchlist] = useState([]);
  const [loading, setLoading] = useState(false);

  const fetchLists = useCallback(async () => {
    if (!user) { setFavorites([]); setWatchlist([]); return; }
    setLoading(true);
    const [{ data: favData }, { data: wlData }] = await Promise.all([
      supabase.from('favorites').select('tmdb_movie_id').eq('user_id', user.id),
      supabase.from('watchlist').select('tmdb_movie_id').eq('user_id', user.id),
    ]);
    setFavorites((favData || []).map(r => r.tmdb_movie_id));
    setWatchlist((wlData || []).map(r => r.tmdb_movie_id));
    setLoading(false);
  }, [user]);

  useEffect(() => { fetchLists(); }, [fetchLists]);

  const buildRow = (movie) => ({
    user_id: user.id,
    tmdb_movie_id: movie.id,
    movie_title: movie.title || movie.name || 'Unknown',
    poster_path: movie.poster_path || null,
    vote_average: movie.vote_average || null,
    release_date: movie.release_date || movie.first_air_date || null,
    media_type: movie.title ? 'movie' : 'tv',
    added_at: new Date().toISOString(),
  });

  // FAVORITES
  const isFavorite = useCallback((id) => favorites.includes(id), [favorites]);

  const toggleFavorite = useCallback(async (movie) => {
    if (!user) return false; // caller should handle redirect
    const id = movie.id;
    if (isFavorite(id)) {
      setFavorites(prev => prev.filter(x => x !== id));
      await supabase.from('favorites').delete().eq('user_id', user.id).eq('tmdb_movie_id', id);
    } else {
      setFavorites(prev => [...prev, id]);
      await supabase.from('favorites').upsert(buildRow(movie));
    }
    return true;
  }, [user, isFavorite]);

  // WATCHLIST
  const isInWatchlist = useCallback((id) => watchlist.includes(id), [watchlist]);

  const toggleWatchlist = useCallback(async (movie) => {
    if (!user) return false;
    const id = movie.id;
    if (isInWatchlist(id)) {
      setWatchlist(prev => prev.filter(x => x !== id));
      await supabase.from('watchlist').delete().eq('user_id', user.id).eq('tmdb_movie_id', id);
    } else {
      setWatchlist(prev => [...prev, id]);
      await supabase.from('watchlist').upsert(buildRow(movie));
    }
    return true;
  }, [user, isInWatchlist]);

  return { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist, loading };
};
