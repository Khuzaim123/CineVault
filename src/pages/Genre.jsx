import { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { discoverMovies, getGenres, getImageUrl } from '../lib/tmdb';
import { CategoryIcon, ArrowLeftIcon, FilterIcon, SortIcon } from '../components/CustomIcons';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';

// ─── Sort options ──────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'popularity.desc',     label: 'Most Popular'  },
  { value: 'vote_average.desc',   label: 'Top Rated'     },
  { value: 'release_date.desc',   label: 'Newest First'  },
  { value: 'release_date.asc',    label: 'Oldest First'  },
  { value: 'revenue.desc',        label: 'Highest Grossing' },
];

const Genre = () => {
  const { id }   = useParams();           // genre id from URL
  const navigate = useNavigate();

  const [movies,    setMovies]    = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading, setIsLoading] = useState(true);
  const [genreName, setGenreName] = useState('');
  const [page,      setPage]      = useState(1);
  const [sortBy,    setSortBy]    = useState('popularity.desc');

  // Resolve genre name
  useEffect(() => {
    getGenres()
      .then(r => r.json())
      .then(data => {
        const found = data.genres?.find(g => String(g.id) === String(id));
        setGenreName(found?.name || 'Genre');
      })
      .catch(() => setGenreName('Genre'));
  }, [id]);

  // Fetch movies whenever genre, sort or page changes
  useEffect(() => {
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    discoverMovies({ genreId: id, sortBy, page })
      .then(r => r.json())
      .then(data => {
        setMovies(data.results || []);
        setTotalPages(Math.min(data.total_pages || 1, 500));
      })
      .catch(() => setMovies([]))
      .finally(() => setIsLoading(false));
  }, [id, sortBy, page]);

  // Reset to page 1 on sort change
  const handleSortChange = (value) => {
    setSortBy(value);
    setPage(1);
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Header ── */}
      <div
        className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(180deg, rgba(232,184,75,0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <button
            onClick={() => navigate(-1)}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-6 text-sm"
          >
            <ArrowLeftIcon size={18} />
            Back
          </button>

          <div className="flex items-center gap-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center flex-shrink-0"
              style={{ background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.2)' }}
            >
              <CategoryIcon size={22} color="#E8B84B" />
            </div>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary">
                {genreName}
              </h1>
              <p className="text-text-muted text-sm mt-1">Browse all {genreName.toLowerCase()} movies</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Sort bar ── */}
        <div
          className="flex flex-wrap items-center gap-3 mb-8 p-4 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          <div className="flex items-center gap-2 mr-2">
            <SortIcon size={15} color="#6B6875" />
            <span className="text-text-muted text-xs font-medium">Sort by</span>
          </div>
          {SORT_OPTIONS.map(opt => (
            <button
              key={opt.value}
              onClick={() => handleSortChange(opt.value)}
              className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300"
              style={{
                background: sortBy === opt.value ? '#E8B84B' : 'rgba(255,255,255,0.05)',
                border:     sortBy === opt.value ? '1px solid #E8B84B' : '1px solid rgba(255,255,255,0.1)',
                color:      sortBy === opt.value ? '#07080F' : '#6B6875',
              }}
            >
              {opt.label}
            </button>
          ))}
        </div>

        {/* ── Results count ── */}
        {!isLoading && (
          <p className="text-text-muted text-sm mb-6">
            Page <span className="text-text-primary font-medium">{page}</span> of{' '}
            <span className="text-text-primary font-medium">{totalPages}</span>
          </p>
        )}

        {/* ── Movies grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => <SkeletonCard key={i} />)}
          </div>
        ) : movies.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
            <CategoryIcon size={64} color="rgba(255,255,255,0.1)" />
            <p className="text-text-muted text-lg">No movies found</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {movies.map(movie => <MovieCard key={movie.id} movie={movie} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={page}
            totalPages={totalPages}
            onPageChange={setPage}
            accentColor="#E8B84B"
            className="mt-12"
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Genre;
