import { useState, useEffect, useRef } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { SearchIcon, CloseIcon } from '../components/CustomIcons';
import { searchMovies, getTrending, getTopRated, getNowPlaying, getTVTrending, getImageUrl } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';

const Search = () => {
  const [searchParams] = useSearchParams();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [isLoading, setIsLoading] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [searchMode, setSearchMode] = useState('all'); // 'all', 'movies', 'tv'
  const navigate = useNavigate();
  const inputRef = useRef(null);
  const dropdownRef = useRef(null);

  // Check for filter params
  const isTrending = searchParams.get('trending');
  const isTopRated = searchParams.get('top_rated');
  const isNowPlaying = searchParams.get('now_playing');

  useEffect(() => {
    const loadFiltered = async () => {
      setIsLoading(true);
      try {
        let response;
        if (isTrending) response = await getTrending();
        else if (isTopRated) response = await getTopRated();
        else if (isNowPlaying) response = await getNowPlaying();
        else response = await getTrending();
        
        const data = await response.json();
        if (data.results) {
          setResults(data.results);
        }
      } catch (error) {
        console.error('Failed to load results:', error);
      } finally {
        setIsLoading(false);
      }
    };

    if (isTrending || isTopRated || isNowPlaying) {
      loadFiltered();
    }
  }, [isTrending, isTopRated, isNowPlaying]);

  // Debounced search
  useEffect(() => {
    const timer = setTimeout(() => {
      if (query.trim()) {
        performSearch(query);
      } else {
        setResults([]);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query]);

  const performSearch = async (searchQuery) => {
    setIsLoading(true);
    try {
      const response = await searchMovies(searchQuery);
      const data = await response.json();
      if (data.results) {
        setResults(data.results);
      }
    } catch (error) {
      console.error('Search failed:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Keyboard navigation
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!showDropdown || results.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        setActiveIndex((prev) => (prev + 1) % results.length);
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        setActiveIndex((prev) => (prev - 1 + results.length) % results.length);
      } else if (e.key === 'Enter' && activeIndex >= 0) {
        e.preventDefault();
        navigate(`/movie/${results[activeIndex].id}`);
      } else if (e.key === 'Escape') {
        setShowDropdown(false);
      }
    };

    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [showDropdown, results, activeIndex, navigate]);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const handleInputChange = (e) => {
    setQuery(e.target.value);
    setShowDropdown(true);
    setActiveIndex(-1);
  };

  const handleClear = () => {
    setQuery('');
    setResults([]);
    setShowDropdown(false);
    inputRef.current?.focus();
  };

  const modeButtons = [
    { id: 'all', label: 'All' },
    { id: 'movies', label: 'Movies' },
    { id: 'tv', label: 'TV Shows' },
  ];

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Search Header */}
        <div className="max-w-2xl mx-auto mb-12">
          <h1 className="font-display text-4xl font-bold text-text-primary text-center mb-8">
            Search
          </h1>

          {/* Search Input */}
          <div ref={dropdownRef} className="relative">
            <div className="relative">
              <span className="absolute left-4 top-1/2 -translate-y-1/2 text-text-muted">
                <SearchIcon size={20} />
              </span>
              <input
                ref={inputRef}
                type="text"
                value={query}
                onChange={handleInputChange}
                onFocus={() => setShowDropdown(true)}
                placeholder="Search for movies, TV shows..."
                className="w-full pl-12 pr-12 py-4 bg-surface border border-white/10 rounded-full text-text-primary placeholder-text-muted focus:outline-none focus:border-gold focus:ring-2 focus:ring-gold/20 transition-all duration-300"
              />
              {query && (
                <button
                  onClick={handleClear}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-text-muted hover:text-text-primary transition-colors"
                >
                  <CloseIcon size={18} />
                </button>
              )}
            </div>

            {/* Search Dropdown */}
            {showDropdown && query.trim() && (
              <div className="absolute top-full left-0 right-0 mt-2 bg-surface border border-white/10 rounded-lg overflow-hidden shadow-xl z-20 max-h-96 overflow-y-auto">
                {isLoading ? (
                  <div className="p-4 text-center text-text-muted">Searching...</div>
                ) : results.length > 0 ? (
                  results.slice(0, 8).map((movie, index) => (
                    <button
                      key={movie.id}
                      onClick={() => {
                        navigate(`/movie/${movie.id}`);
                        setShowDropdown(false);
                      }}
                      className={`w-full flex items-center gap-4 p-3 hover:bg-white/5 transition-colors ${
                        index === activeIndex ? 'bg-white/10' : ''
                      }`}
                    >
                      <img
                        src={getImageUrl(movie.poster_path, 'w92')}
                        alt={movie.title || movie.name}
                        className="w-12 h-16 object-cover rounded"
                      />
                      <div className="text-left">
                        <p className="text-text-primary font-medium text-sm line-clamp-1">
                          {movie.title || movie.name}
                        </p>
                        <p className="text-text-muted text-xs">
                          {movie.release_date?.split('-')[0] || movie.first_air_date?.split('-')[0] || 'N/A'}
                        </p>
                      </div>
                    </button>
                  ))
                ) : (
                  <div className="p-4 text-center text-text-muted">No results found</div>
                )}
              </div>
            )}
          </div>

          {/* Mode Buttons */}
          <div className="flex justify-center gap-2 mt-6">
            {modeButtons.map((mode) => (
              <button
                key={mode.id}
                onClick={() => setSearchMode(mode.id)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${
                  searchMode === mode.id
                    ? 'bg-gold text-background'
                    : 'bg-white/5 text-text-muted hover:text-text-primary'
                }`}
              >
                {mode.label}
              </button>
            ))}
          </div>
        </div>

        {/* Results */}
        <div>
          <h2 className="font-display text-2xl font-bold text-text-primary mb-6">
            {query ? `Results for "${query}"` : isTrending ? 'Trending' : isTopRated ? 'Top Rated' : isNowPlaying ? 'Now Playing' : 'Discover'}
          </h2>

          {isLoading ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {Array.from({ length: 12 }).map((_, i) => (
                <SkeletonCard key={i} />
              ))}
            </div>
          ) : results.length > 0 ? (
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {results.map((movie) => (
                <MovieCard key={movie.id} movie={movie} />
              ))}
            </div>
          ) : (
            <div className="text-center py-16">
              <p className="text-text-muted text-lg">
                {query ? 'No results found. Try a different search term.' : 'Start searching to discover movies and TV shows.'}
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Search;
