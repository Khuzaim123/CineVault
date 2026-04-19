import { useState, useEffect, useCallback } from 'react';

const WATCHLIST_KEY = 'cinevault_watchlist';

export const useWatchlist = () => {
  const [watchlist, setWatchlist] = useState([]);
  const [isLoaded, setIsLoaded] = useState(false);

  useEffect(() => {
    const stored = localStorage.getItem(WATCHLIST_KEY);
    if (stored) {
      try {
        setWatchlist(JSON.parse(stored));
      } catch (e) {
        console.error('Failed to parse watchlist from localStorage');
      }
    }
    setIsLoaded(true);
  }, []);

  const addToWatchlist = useCallback((movie) => {
    setWatchlist(prev => {
      if (prev.find(m => m.id === movie.id)) return prev;
      const updated = [...prev, movie];
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const removeFromWatchlist = useCallback((id) => {
    setWatchlist(prev => {
      const updated = prev.filter(m => m.id !== id);
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const toggleWatchlist = useCallback((movie) => {
    setWatchlist(prev => {
      const exists = prev.find(m => m.id === movie.id);
      let updated;
      if (exists) {
        updated = prev.filter(m => m.id !== movie.id);
      } else {
        updated = [...prev, movie];
      }
      localStorage.setItem(WATCHLIST_KEY, JSON.stringify(updated));
      return updated;
    });
  }, []);

  const isInWatchlist = useCallback((id) => {
    return watchlist.some(m => m.id === id);
  }, [watchlist]);

  const getWatchlist = useCallback(() => {
    return watchlist;
  }, [watchlist]);

  return {
    watchlist,
    isLoaded,
    addToWatchlist,
    removeFromWatchlist,
    toggleWatchlist,
    isInWatchlist,
    getWatchlist,
  };
};
