import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { PlayIcon, StarIcon, ArrowLeftIcon, YouTubeIcon, HeartIcon, BookmarkIcon, LockIcon } from '../components/CustomIcons';
import { getMovieDetail, getSimilar, getImageUrl } from '../lib/tmdb';
import VideoPlayer from '../components/VideoPlayer';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useSupabaseLists } from '../lib/useSupabaseLists';
import { useGuestModal } from '../context/GuestModalContext';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);

  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useSupabaseLists();
  const { showWatchModal, showSaveModal } = useGuestModal();

  const inFavorites = isFavorite(movie?.id);
  const inWatchlist = isInWatchlist(movie?.id);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [detailResponse, similarResponse] = await Promise.all([
          getMovieDetail(id),
          getSimilar(id),
        ]);

        if (detailResponse.status === 404) {
          setError('Movie not found');
          setIsLoading(false);
          return;
        }

        const detailData = await detailResponse.json();
        const similarData = await similarResponse.json();

        if (detailData.id) {
          setMovie(detailData);
        } else {
          setError('Movie not found');
        }

        if (similarData.results && similarResponse.status !== 404) {
          setSimilar(similarData.results.slice(0, 6));
        }
      } catch (err) {
        console.error('Failed to load movie details:', err);
        setError('Failed to load movie details');
      } finally {
        setIsLoading(false);
      }
    };
    fetchDetails();
    window.scrollTo(0, 0);
  }, [id]);

  const handleWatch = () => {
    if (!user) { showWatchModal(); return; }
    setShowPlayer(true);
  };

  const handleFavorite = () => {
    if (!user) { showSaveModal(); return; }
    toggleFavorite(movie);
  };

  const handleWatchlist = () => {
    if (!user) { showSaveModal(); return; }
    toggleWatchlist(movie);
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            <div className="aspect-[2/3] bg-surface rounded-lg animate-pulse" />
            <div className="md:col-span-2 space-y-4">
              <div className="h-12 bg-surface rounded animate-pulse" />
              <div className="h-6 bg-surface rounded w-2/3 animate-pulse" />
              <div className="h-32 bg-surface rounded animate-pulse" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error || !movie) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-text-muted text-lg mb-4">{error || 'Movie not found'}</p>
          <button
            onClick={() => navigate('/')}
            className="px-6 py-3 bg-gold text-background rounded-full font-medium hover:bg-amber-400 transition-colors"
          >
            Back to Home
          </button>
        </div>
      </div>
    );
  }

  const trailer = movie.videos?.results?.find(v => v.type === 'Trailer' && v.site === 'YouTube');
  const cast = movie.credits?.cast?.slice(0, 10) || [];

  return (
    <div className="min-h-screen bg-background">
      {/* Backdrop */}
      <div className="relative h-[60vh] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center"
          style={{ backgroundImage: `url(${getImageUrl(movie.backdrop_path, 'w1280')})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent" />
        <div className="absolute inset-0 bg-gradient-to-r from-background via-background/30 to-transparent" />
      </div>

      {/* Back Button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-24 left-4 sm:left-8 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors z-10"
      >
        <ArrowLeftIcon size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* Main Content */}
      <div className="relative -mt-48 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* Poster */}
          <div className="hidden md:block">
            <div className="sticky top-24">
              <img
                src={getImageUrl(movie.poster_path, 'w500')}
                alt={movie.title}
                className="w-full rounded-lg shadow-[0_0_30px_rgba(232,184,75,0.15)]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary mb-4">{movie.title}</h1>

            {movie.tagline && (
              <p className="text-text-muted text-lg italic mb-6">{movie.tagline}</p>
            )}

            {/* Meta */}
            <div className="flex flex-wrap items-center gap-4 mb-6">
              <div className="flex items-center gap-2">
                <StarIcon size={20} color="#E8B84B" />
                <span className="text-text-primary font-medium">{movie.vote_average?.toFixed(1)}</span>
                <span className="text-text-muted">/ 10</span>
              </div>
              <span className="w-1 h-1 bg-text-muted rounded-full" />
              <span className="text-text-muted">{movie.release_date?.split('-')[0] || 'N/A'}</span>
              <span className="w-1 h-1 bg-text-muted rounded-full" />
              <span className="text-text-muted">{movie.runtime || 'N/A'} min</span>
              <span className="w-1 h-1 bg-text-muted rounded-full" />
              <span className="border border-text-muted/30 px-2 py-0.5 rounded text-xs text-text-muted">
                {movie.adult ? '18+' : 'PG-13'}
              </span>
            </div>

            {/* Genres */}
            <div className="flex flex-wrap gap-2 mb-6">
              {movie.genres?.map((genre) => (
                <span key={genre.id} className="px-4 py-1.5 bg-white/5 border border-white/10 rounded-full text-text-muted text-sm">
                  {genre.name}
                </span>
              ))}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-4 mb-8">
              <button
                onClick={handleWatch}
                className="relative flex items-center gap-3 px-8 py-4 bg-gold text-background rounded-full font-semibold hover:bg-amber-400 transition-all duration-300 hover:scale-105 hover:shadow-[0_0_30px_rgba(232,184,75,0.3)]"
              >
                <PlayIcon size={20} color="#07080F" />
                Watch Now
                {!user && (
                  <span className="absolute -top-1 -right-1 w-5 h-5 rounded-full flex items-center justify-center"
                    style={{ background: '#E8B84B', color: '#07080F' }}>
                    <LockIcon size={10} color="#07080F" />
                  </span>
                )}
              </button>

              {/* Favorite */}
              <button
                onClick={handleFavorite}
                className={`flex items-center gap-3 px-6 py-4 rounded-full font-semibold border transition-all duration-300 ${
                  inFavorites
                    ? 'bg-red-500/20 text-red-400 border-red-500/30'
                    : 'bg-white/10 text-text-primary border-white/20 hover:bg-white/20'
                }`}
              >
                {!user
                  ? <LockIcon size={18} color="currentColor" />
                  : <HeartIcon size={18} color="currentColor" filled={inFavorites} />}
                {inFavorites ? 'Favorited' : 'Favorite'}
              </button>

              {/* Watchlist */}
              <button
                onClick={handleWatchlist}
                className={`flex items-center gap-3 px-6 py-4 rounded-full font-semibold border transition-all duration-300 ${
                  inWatchlist
                    ? 'bg-gold/20 text-gold border-gold/30'
                    : 'bg-white/10 text-text-primary border-white/20 hover:bg-white/20'
                }`}
              >
                {!user
                  ? <LockIcon size={18} color="currentColor" />
                  : <BookmarkIcon size={18} color="currentColor" filled={inWatchlist} />}
                {inWatchlist ? 'In Watchlist' : 'Watchlist'}
              </button>
            </div>

            {/* Overview */}
            <div className="mb-8">
              <h3 className="font-display text-xl font-semibold text-text-primary mb-3">Storyline</h3>
              <p className="text-text-muted leading-relaxed">{movie.overview}</p>
            </div>

            {/* Cast */}
            {cast.length > 0 && (
              <div className="mb-8">
                <h3 className="font-display text-xl font-semibold text-text-primary mb-4">Cast</h3>
                <div className="flex gap-4 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {cast.map((actor) => (
                    <div key={actor.id} className="flex-shrink-0 w-24 text-center">
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 bg-surface">
                        {actor.profile_path ? (
                          <img
                            src={getImageUrl(actor.profile_path, 'w185')}
                            alt={actor.name}
                            className="w-full h-full object-cover"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <span className="text-text-muted text-xs">{actor.name.split(' ')[0]}</span>
                          </div>
                        )}
                      </div>
                      <p className="text-text-primary text-sm font-medium truncate">{actor.name}</p>
                      <p className="text-text-muted text-xs truncate">{actor.character}</p>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* Trailer */}
            {trailer && (
              <div className="mb-8">
                <h3 className="font-display text-xl font-semibold text-text-primary mb-4 flex items-center gap-2">
                  <YouTubeIcon size={24} color="#E8B84B" />
                  Trailer
                </h3>
                <div className="aspect-video rounded-lg overflow-hidden bg-surface">
                  <iframe
                    src={`https://www.youtube.com/embed/${trailer.key}`}
                    title="Movie Trailer"
                    className="w-full h-full"
                    frameBorder="0"
                    allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                    allowFullScreen
                  />
                </div>
              </div>
            )}
          </div>
        </div>

        {/* More Like This */}
        {similar.length > 0 && (
          <div className="mt-16">
            <h3 className="font-display text-2xl font-bold text-text-primary mb-6">More Like This</h3>
            <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
              {similar.map((m) => (
                <MovieCard key={m.id} movie={m} />
              ))}
            </div>
          </div>
        )}
      </div>

      {/* Video Player Modal */}
      {showPlayer && <VideoPlayer movieId={movie.id} trailerKey={trailer?.key} onClose={() => setShowPlayer(false)} />}
    </div>
  );
};

export default MovieDetail;
