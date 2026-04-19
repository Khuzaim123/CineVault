import { useState, useEffect } from 'react';
import { useSearchParams } from 'react-router-dom';
import { getTVTrending, getTVPopular, getTVTopRated, searchTV } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';
import { SearchIcon } from '../components/CustomIcons';
const TABS = [
  { id: 'trending',  label: 'Trending',  fetch: getTVTrending },
  { id: 'popular',   label: 'Popular',   fetch: getTVPopular },
  { id: 'top_rated', label: 'Top Rated', fetch: getTVTopRated },
];

const TV = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const tabParam  = searchParams.get('tab')  || 'trending';
  const pageParam = parseInt(searchParams.get('page') || '1', 10);
  const queryParam = searchParams.get('q') || '';

  const [shows,       setShows]       = useState([]);
  const [totalPages,  setTotalPages]  = useState(1);
  const [isLoading,   setLoading]     = useState(true);
  const [searchInput, setSearchInput] = useState(queryParam);

  const activeTab = TABS.find((t) => t.id === tabParam) || TABS[0];

  useEffect(() => {
    setLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });
    
    const fetchShows = queryParam 
      ? searchTV(queryParam, pageParam) 
      : activeTab.fetch(pageParam);
      
    fetchShows
      .then((r) => r.json())
      .then((data) => {
        setShows(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      })
      .catch(() => setShows([]))
      .finally(() => setLoading(false));
  }, [tabParam, pageParam, queryParam]);

  const updateParams = (overrides) => {
    const next = { tab: tabParam, page: '1', q: queryParam, ...overrides };
    const out = {};
    if (next.tab !== 'trending') out.tab = next.tab;
    if (next.page !== '1') out.page = next.page;
    if (next.q) out.q = next.q;
    setSearchParams(out);
  };

  const goToPage = (page) => updateParams({ page: String(page) });
  const switchTab = (tabId) => updateParams({ tab: tabId, page: '1' });

  // Real-time debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = searchInput.trim();
      if (q !== queryParam) {
        updateParams({ q, page: '1' });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, queryParam]);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
            <h1 className="font-display text-4xl font-bold text-text-primary">TV Shows</h1>
            
            {/* Real-time Search */}
            <div className="relative w-full md:w-64 lg:w-80">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <SearchIcon size={16} color="#6B6875" />
              </div>
              <input
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search TV shows..."
                className="w-full pl-9 pr-4 py-2 text-sm rounded-full text-text-primary placeholder-text-muted outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>
          
          {!queryParam && (
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
          )}
          
          {queryParam && !isLoading && (
            <p className="text-text-muted text-sm mt-4">
              Results for &quot;{queryParam}&quot; &mdash; <span className="text-text-primary font-medium">{shows.length}</span> shown
            </p>
          )}
        </div>

        {/* Grid */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {shows.map((show) => <MovieCard key={show.id} movie={show} />)}
          </div>
        )}

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

export default TV;
