import { useState, useEffect, useRef, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchIcon, CloseIcon } from '../components/CustomIcons';
import { searchMovies, getTrending, getTopRated, getNowPlaying, getImageUrl } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';

const QUICK_FILTERS = [
  { id: 'trending',    label: 'Trending',    fetch: getTrending },
  { id: 'top_rated',   label: 'Top Rated',   fetch: getTopRated },
  { id: 'now_playing', label: 'Now Playing', fetch: getNowPlaying },
];

const Search = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const inputRef  = useRef(null);
  const dropdownRef = useRef(null);

  // State
  const [query,        setQuery]        = useState(searchParams.get('q') || '');
  const [results,      setResults]      = useState([]);
  const [suggestions,  setSuggestions]  = useState([]); // type-ahead
  const [isLoading,    setIsLoading]    = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex,  setActiveIndex]  = useState(-1);
  const [activeFilter, setActiveFilter] = useState(null);
  const [page,         setPage]         = useState(1);
  const [totalPages,   setTotalPages]   = useState(1);
  const [totalResults, setTotalResults] = useState(0);

  // ── Quick filter (Trending / Top Rated / Now Playing) ──────────────────────
  const loadFilter = useCallback(async (filter, pg = 1) => {
    setIsLoading(true);
    try {
      const res  = await filter.fetch(pg);
      const data = await res.json();
      setResults(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500));
      setTotalResults(data.total_results || 0);
    } catch {
      setResults([]);
    } finally { setIsLoading(false); }
  }, []);

  // ── Text search ────────────────────────────────────────────────────────────
  const performSearch = useCallback(async (q, pg = 1) => {
    if (!q.trim()) { setResults([]); return; }
    setIsLoading(true);
    try {
      const res  = await searchMovies(encodeURIComponent(q.trim()), pg);
      const data = await res.json();
      setResults(data.results || []);
      setTotalPages(Math.min(data.total_pages || 1, 500));
      setTotalResults(data.total_results || 0);
    } catch {
      setResults([]);
    } finally { setIsLoading(false); }
  }, []);

  // Type-ahead suggestions (no pagination, up to 6)
  useEffect(() => {
    if (!query.trim() || query.length < 2) { setSuggestions([]); return; }
    const t = setTimeout(async () => {
      try {
        const res  = await searchMovies(encodeURIComponent(query.trim()), 1);
        const data = await res.json();
        setSuggestions((data.results || []).slice(0, 6));
      } catch { setSuggestions([]); }
    }, 280);
    return () => clearTimeout(t);
  }, [query]);

  // Initial load from URL param
  useEffect(() => {
    const q = searchParams.get('q');
    if (q) { setQuery(q); performSearch(q, 1); setPage(1); }
    else if (!activeFilter) {
      loadFilter(QUICK_FILTERS[0], 1);
      setActiveFilter(QUICK_FILTERS[0].id);
    }
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Keyboard navigation
  useEffect(() => {
    const handle = (e) => {
      if (!showDropdown || !suggestions.length) return;
      if (e.key === 'ArrowDown') { e.preventDefault(); setActiveIndex((p) => (p + 1) % suggestions.length); }
      if (e.key === 'ArrowUp')   { e.preventDefault(); setActiveIndex((p) => (p - 1 + suggestions.length) % suggestions.length); }
      if (e.key === 'Enter' && activeIndex >= 0) { e.preventDefault(); navigate(`/movie/${suggestions[activeIndex].id}`); setShowDropdown(false); }
      if (e.key === 'Escape') setShowDropdown(false);
    };
    document.addEventListener('keydown', handle);
    return () => document.removeEventListener('keydown', handle);
  }, [showDropdown, suggestions, activeIndex, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handle = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) setShowDropdown(false);
    };
    document.addEventListener('mousedown', handle);
    return () => document.removeEventListener('mousedown', handle);
  }, []);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!query.trim()) return;
    setShowDropdown(false);
    setActiveFilter(null);
    setPage(1);
    performSearch(query, 1);
    setSearchParams({ q: query.trim() });
  };

  const handleClear = () => {
    setQuery('');
    setSuggestions([]);
    setResults([]);
    setShowDropdown(false);
    setTotalPages(1);
    setTotalResults(0);
    setPage(1);
    inputRef.current?.focus();
    loadFilter(QUICK_FILTERS[0], 1);
    setActiveFilter(QUICK_FILTERS[0].id);
    setSearchParams({});
  };

  const handleFilterSwitch = (filter) => {
    setActiveFilter(filter.id);
    setQuery('');
    setSuggestions([]);
    setTotalPages(1);
    setPage(1);
    setSearchParams({});
    loadFilter(filter, 1);
  };

  const handlePageChange = (pg) => {
    setPage(pg);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    if (query.trim()) performSearch(query, pg);
    else {
      const filter = QUICK_FILTERS.find((f) => f.id === activeFilter) || QUICK_FILTERS[0];
      loadFilter(filter, pg);
    }
  };

  const heading = query
    ? `Results for "${query}"`
    : activeFilter === 'trending'    ? 'Trending'
    : activeFilter === 'top_rated'   ? 'Top Rated'
    : activeFilter === 'now_playing' ? 'Now Playing'
    : 'Discover';

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">

        {/* Search header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="font-display text-4xl font-bold text-text-primary text-center mb-8">Search</h1>

          {/* Input */}
          <form onSubmit={handleSubmit}>
            <div ref={dropdownRef} className="relative">
              <div className="relative">
                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                  <SearchIcon size={20} />
                </span>
                <input
                  ref={inputRef}
                  id="main-search-input"
                  type="text"
                  value={query}
                  onChange={(e) => { setQuery(e.target.value); setShowDropdown(true); setActiveIndex(-1); }}
                  onFocus={() => setShowDropdown(true)}
                  placeholder="Search for movies, TV shows…"
                  className="w-full pl-12 pr-12 py-4 bg-surface border border-white/10 rounded-full text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300"
                />
                {query && (
                  <button
                    type="button"
                    onClick={handleClear}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                  >
                    <CloseIcon size={18} />
                  </button>
                )}
              </div>

              {/* Suggestions dropdown */}
              {showDropdown && query.trim() && suggestions.length > 0 && (
                <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-xl overflow-hidden shadow-2xl z-20">
                  {suggestions.map((item, idx) => (
                    <button
                      key={item.id}
                      type="button"
                      onClick={() => { navigate(`/movie/${item.id}`); setShowDropdown(false); }}
                      className={`w-full flex items-center gap-4 p-3 text-left hover:bg-white/5 transition-colors ${idx === activeIndex ? 'bg-white/10' : ''}`}
                    >
                      <img
                        src={getImageUrl(item.poster_path, 'w92')}
                        alt={item.title || item.name}
                        className="w-10 h-14 object-cover rounded"
                      />
                      <div>
                        <p className="text-text-primary font-medium text-sm line-clamp-1">{item.title || item.name}</p>
                        <p className="text-text-muted text-xs">
                          {item.release_date?.split('-')[0] || item.first_air_date?.split('-')[0] || 'N/A'}
                        </p>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>
          </form>

          {/* Quick filters */}
          <div className="flex justify-center gap-2 mt-6">
            {QUICK_FILTERS.map((filter) => (
              <button
                key={filter.id}
                onClick={() => handleFilterSwitch(filter)}
                className="px-5 py-2 rounded-full text-sm font-medium transition-all duration-300"
                style={{
                  background: !query && activeFilter === filter.id ? '#E8B84B' : 'rgba(255,255,255,0.05)',
                  color:      !query && activeFilter === filter.id ? '#07080F' : '#6B6875',
                  border:     !query && activeFilter === filter.id ? '1px solid #E8B84B' : '1px solid rgba(255,255,255,0.08)',
                }}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div>
          <div className="flex items-baseline justify-between mb-6 flex-wrap gap-2">
            <h2 className="font-display text-2xl font-bold text-text-primary">{heading}</h2>
            {totalResults > 0 && (
              <span className="text-text-muted text-sm">{totalResults.toLocaleString()} results</span>
            )}
          </div>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">
                {query ? `No results found for "${query}". Try a different term.` : 'Start searching to discover content.'}
              </p>
            </div>
          )}

          {!isLoading && totalPages > 1 && (
            <Pagination
              currentPage={page}
              totalPages={totalPages}
              onPageChange={handlePageChange}
              accentColor="#E8B84B"
              className="mt-12"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
