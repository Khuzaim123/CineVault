import { useState, useEffect, useCallback } from 'react';
import { PlayIcon, InfoIcon, StarIcon, FireIcon, LockIcon } from './CustomIcons';
import { getTrending, getImageUrl } from '../lib/tmdb';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useGuestModal } from '../context/GuestModalContext';

// Mini genre map for hero display
const GENRE_MAP = {
  28: 'Action', 12: 'Adventure', 16: 'Animation', 35: 'Comedy', 80: 'Crime',
  99: 'Documentary', 18: 'Drama', 10751: 'Family', 14: 'Fantasy', 36: 'History',
  27: 'Horror', 10402: 'Music', 9648: 'Mystery', 10749: 'Romance',
  878: 'Sci-Fi', 10770: 'TV Movie', 53: 'Thriller', 10752: 'War', 37: 'Western',
};

const HeroSection = () => {
  const [movies, setMovies] = useState([]);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [posterLoaded, setPosterLoaded] = useState(false);
  const navigate = useNavigate();
  const { user } = useAuth();
  const { showWatchModal } = useGuestModal();

  useEffect(() => {
    const fetchTrending = async () => {
      try {
        const response = await getTrending();
        const data = await response.json();
        if (data.results) {
          setMovies(data.results.slice(0, 5));
        }
      } catch (err) {
        setError('Failed to load trending movies');
      } finally {
        setIsLoading(false);
      }
    };
    fetchTrending();
  }, []);

  const autoRotate = useCallback(() => {
    setCurrentIndex((prev) => (prev + 1) % movies.length);
    setPosterLoaded(false);
  }, [movies.length]);

  useEffect(() => {
    if (movies.length > 1) {
      const interval = setInterval(autoRotate, 7000);
      return () => clearInterval(interval);
    }
  }, [movies.length, autoRotate]);

  const handleWatch = () => {
    if (!user) { showWatchModal(); return; }
    navigate(`/movie/${movie?.id}`);
  };

  if (isLoading) {
    return <section className="h-screen bg-background animate-pulse" />;
  }

  if (error || movies.length === 0) {
    return (
      <section className="h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted text-lg">{error || 'No movies available'}</p>
          <button
            onClick={() => window.location.reload()}
            className="mt-4 px-6 py-2 bg-gold text-background rounded-full font-medium hover:bg-amber-400 transition-colors"
          >
            Retry
          </button>
        </div>
      </section>
    );
  }

  const movie = movies[currentIndex];
  const genres = movie?.genre_ids?.slice(0, 2).map(id => GENRE_MAP[id]).filter(Boolean) || [];

  return (
    <section className="relative min-h-screen" style={{ overflowX: 'clip' }}>
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-cover bg-center animate-ken-burns"
        style={{ backgroundImage: `url(${getImageUrl(movie?.backdrop_path, 'w1280')})` }}
      />

      {/* Gradient Overlays */}
      <div className="absolute inset-0 bg-gradient-to-r from-background via-background/85 to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-background/30" />
      <div className="absolute inset-0 bg-gradient-to-b from-background/30 via-transparent to-background" />

      {/* Noise */}
      <svg className="absolute inset-0 w-full h-full opacity-[0.03] pointer-events-none">
        <filter id="noise2">
          <feTurbulence type="fractalNoise" baseFrequency="0.8" numOctaves="4" stitchTiles="stitch" />
        </filter>
        <rect width="100%" height="100%" filter="url(#noise2)" />
      </svg>

      {/* Spotlight */}
      <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-gold/5 rounded-full blur-3xl pointer-events-none" />

      {/* Main Content: Two-column on lg+ */}
      <div className="relative min-h-screen flex items-center">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 w-full pt-24 pb-32">
          <div className="hero-grid">

            {/* LEFT COLUMN */}
            <div>
              {/* Trending Badge */}
              <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full mb-5 text-xs font-semibold uppercase tracking-wider animate-fade-up"
                style={{ background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.3)', color: '#E8B84B', animationDelay: '0ms' }}>
                <FireIcon size={14} color="#E8B84B" /> Trending Now
              </div>

              {/* Title */}
              <h1
                className="font-display text-5xl sm:text-6xl md:text-7xl font-bold text-text-primary mb-4 animate-fade-up"
                style={{ animationDelay: '60ms', lineHeight: 1.1 }}
              >
                {movie?.title}
              </h1>

              {/* Metadata */}
              <div className="flex items-center gap-3 text-text-muted text-sm mb-5 animate-fade-up flex-wrap" style={{ animationDelay: '120ms' }}>
                <span>{movie?.release_date?.split('-')[0] || 'N/A'}</span>
                <span className="w-1 h-1 bg-text-muted rounded-full" />
                {genres.length > 0 && (
                  <>
                    <span>{genres.join(' · ')}</span>
                    <span className="w-1 h-1 bg-text-muted rounded-full" />
                  </>
                )}
                <span className="border border-text-muted/30 px-2 py-0.5 rounded text-xs">
                  {movie?.adult ? '18+' : 'PG-13'}
                </span>
              </div>

              {/* Rating */}
              <div className="flex items-center gap-2 mb-5 animate-fade-up" style={{ animationDelay: '180ms' }}>
                <StarIcon size={20} color="#E8B84B" />
                <span className="text-text-primary font-semibold text-lg">{movie?.vote_average?.toFixed(1) || 'N/A'}</span>
                <span className="text-text-muted text-sm">/ 10</span>
              </div>

              {/* Synopsis */}
              <p
                className="text-text-muted text-base sm:text-lg leading-relaxed mb-8 line-clamp-3 animate-fade-up"
                style={{ animationDelay: '240ms' }}
              >
                {movie?.overview?.slice(0, 200)}
                {movie?.overview?.length > 200 ? '...' : ''}
              </p>

              {/* Buttons */}
              <div className="flex flex-wrap gap-4 animate-fade-up mb-10" style={{ animationDelay: '300ms' }}>
                <button
                  onClick={handleWatch}
                  className="relative flex items-center gap-3 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-amber-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(232,184,75,0.3)]"
                >
                  <PlayIcon size={20} color="#07080F" />
                  Watch Now
                  {/* Lock badge for guests */}
                  {!user && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                      style={{ background: '#E8B84B', color: '#07080F' }}>
                      <LockIcon size={10} color="#07080F" />
                    </span>
                  )}
                </button>
                <button
                  onClick={() => navigate(`/movie/${movie?.id}`)}
                  className="flex items-center gap-3 px-8 py-4 bg-white/10 backdrop-blur-sm text-text-primary rounded-full font-semibold border border-white/20 hover:bg-white/20 transition-all duration-300"
                >
                  <InfoIcon size={20} />
                  More Info
                </button>
              </div>

              {/* Stat Cards */}
              <div className="grid grid-cols-4 gap-3 animate-fade-up" style={{ animationDelay: '360ms' }}>
                {[
                  { label: 'IMDb Score', value: movie?.vote_average?.toFixed(1) || 'N/A' },
                  { label: 'Total Votes', value: movie?.vote_count ? `${(movie.vote_count / 1000).toFixed(0)}K` : 'N/A' },
                  { label: 'Language', value: movie?.original_language?.toUpperCase() || 'N/A' },
                  { label: 'Status', value: 'In Theaters' },
                ].map((stat) => (
                  <div
                    key={stat.label}
                    className="text-center rounded-xl py-3 px-2"
                    style={{
                      background: 'rgba(255,255,255,0.04)',
                      backdropFilter: 'blur(10px)',
                      border: '1px solid rgba(255,255,255,0.08)',
                    }}
                  >
                    <div className="font-semibold text-gold text-sm">{stat.value}</div>
                    <div className="text-text-muted text-[10px] mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* RIGHT COLUMN — poster, hidden on mobile */}
            <div className="hidden lg:block relative" style={{ height: '480px' }}>
              {/* Gold glow */}
              <div
                className="absolute inset-0 rounded-3xl"
                style={{
                  background: 'radial-gradient(ellipse at center, rgba(232,184,75,0.18) 0%, transparent 65%)',
                  filter: 'blur(28px)',
                  transform: 'scale(0.9) translateY(6%)',
                }}
              />

              {/* Genre pill — top left of poster */}
              {genres[0] && (
                <div
                  className="absolute top-4 -left-5 px-4 py-2 rounded-full text-xs font-semibold z-20"
                  style={{
                    background: 'rgba(232,184,75,0.15)',
                    border: '1px solid rgba(232,184,75,0.45)',
                    color: '#E8B84B',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {genres[0]}
                </div>
              )}

              {/* Genre pill — bottom right of poster */}
              {genres[1] && (
                <div
                  className="absolute bottom-8 -right-5 px-4 py-2 rounded-full text-xs font-semibold z-20"
                  style={{
                    background: 'rgba(232,184,75,0.15)',
                    border: '1px solid rgba(232,184,75,0.45)',
                    color: '#E8B84B',
                    backdropFilter: 'blur(10px)',
                    boxShadow: '0 4px 20px rgba(0,0,0,0.3)',
                  }}
                >
                  {genres[1]}
                </div>
              )}

              {/* Poster image */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{ padding: '0 12px' }}
              >
                <div
                  className="relative rounded-2xl overflow-hidden cursor-pointer transition-all duration-500"
                  style={{
                    width: '100%',
                    maxWidth: '300px',
                    height: '100%',
                    transform: posterLoaded ? 'rotate(-3deg)' : 'rotate(-3deg)',
                    boxShadow: '0 30px 70px rgba(0,0,0,0.7), 0 0 50px rgba(232,184,75,0.12)',
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.transform = 'rotate(0deg) scale(1.03)';
                    e.currentTarget.style.boxShadow = '0 30px 70px rgba(0,0,0,0.7), 0 0 60px rgba(232,184,75,0.25)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.transform = 'rotate(-3deg) scale(1)';
                    e.currentTarget.style.boxShadow = '0 30px 70px rgba(0,0,0,0.7), 0 0 50px rgba(232,184,75,0.12)';
                  }}
                  onClick={() => navigate(`/movie/${movie?.id}`)}
                >
                  <img
                    src={getImageUrl(movie?.poster_path, 'w500')}
                    alt={movie?.title}
                    className="w-full h-full object-cover block"
                    onLoad={() => setPosterLoaded(true)}
                    onError={(e) => { e.target.parentElement.style.background = 'rgba(15,17,32,0.6)'; }}
                  />
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Indicator Dots */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 flex gap-3 animate-fade-up" style={{ animationDelay: '400ms' }}>
        {movies.map((_, index) => (
          <button
            key={index}
            onClick={() => { setCurrentIndex(index); setPosterLoaded(false); }}
            className={`h-2 rounded-full transition-all duration-300 ${index === currentIndex ? 'bg-gold w-8' : 'bg-white/30 hover:bg-white/50 w-2'}`}
          />
        ))}
      </div>
    </section>
  );
};

export default HeroSection;
