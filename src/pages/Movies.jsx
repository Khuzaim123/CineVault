import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getPopular, getTrending, getTopRated, getNowPlaying } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';

const TABS = [
  { id: 'popular',     label: 'Popular',     fetch: getPopular },
  { id: 'trending',    label: 'Trending',    fetch: getTrending },
  { id: 'top_rated',   label: 'Top Rated',   fetch: getTopRated },
  { id: 'now_playing', label: 'Now Playing', fetch: getNowPlaying },
];

const Movies = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam  = searchParams.get('tab')  || 'popular';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);

  const [movies,     setMovies]     = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading,  setLoading]    = useState(true);

  const activeTab = TABS.find((t) => t.id === tabParam) || TABS[0];

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    activeTab.fetch(pageParam)
      .then((r) => r.json())
      .then((data) => {
        setMovies(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500)); // TMDB caps at 500
      })
      .catch(() => setMovies([]))
      .finally(() => setLoading(false));
  }, [tabParam, pageParam]);

  const goToPage = (page) =>
    setSearchParams({ tab: tabParam, page: String(page) });

  const switchTab = (tabId) =>
    setSearchParams({ tab: tabId, page: '1' });

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="font-display text-4xl font-bold text-text-primary mb-6">Movies</h1>
          {/* Tab switcher */}
          <div className="flex flex-wrap gap-2">
            {TABS.map((tab) => (
              <button
                key={tab.id}
                onClick={() => switchTab(tab.id)}
                className="px-5 py-2 rounded-full text-sm font-semibold transition-all duration-300"
                style={{
                  background: tab.id === tabParam ? '#E8B84B' : 'rgba(255,255,255,0.05)',
                  color:      tab.id === tabParam ? '#07080F' : '#6B6875',
                  border:     tab.id === tabParam ? '1px solid #E8B84B' : '1px solid rgba(255,255,255,0.08)',
                  boxShadow:  tab.id === tabParam ? '0 0 16px rgba(232,184,75,0.3)' : 'none',
                }}
              >
                {tab.label}
              </button>
            ))}
          </div>
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}

        {/* Pagination */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={pageParam}
            totalPages={totalPages}
            onPageChange={goToPage}
            accentColor="#E8B84B"
            className="mt-12"
          />
        )}
      </div>
      <Footer />
    </div>
  );
};

export default Movies;
