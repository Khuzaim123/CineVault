import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link, useLocation } from 'react-router-dom';
import { PersonIcon } from '../components/CustomIcons';
import { PlayIcon, StarIcon, ArrowLeftIcon, YouTubeIcon, HeartIcon, BookmarkIcon, LockIcon } from '../components/CustomIcons';
import { getMovieDetail, getSimilar, getImageUrl, getTVDetail, getTVSimilar, getTVSeasonDetail } from '../lib/tmdb';
import VideoPlayer from '../components/VideoPlayer';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import { useAuth } from '../context/AuthContext';
import { useSupabaseLists } from '../lib/useSupabaseLists';
import { useGuestModal } from '../context/GuestModalContext';
import CommentSection from '../components/CommentSection';

const MovieDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const location = useLocation();
  const isTV = location.pathname.startsWith('/tv');
  
  const [movie, setMovie] = useState(null);
  const [similar, setSimilar] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showPlayer, setShowPlayer] = useState(false);
  const [selectedSeason, setSelectedSeason] = useState(null);
  const [seasonData, setSeasonData] = useState(null);
  const [selectedEpisodeForPlayer, setSelectedEpisodeForPlayer] = useState(1);
  const [isSeasonDropdownOpen, setIsSeasonDropdownOpen] = useState(false);

  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useSupabaseLists();
  const { showWatchModal, showSaveModal } = useGuestModal();

  const inFavorites = isFavorite(movie?.id);
  const inWatchlist = isInWatchlist(movie?.id);

  useEffect(() => {
    const fetchDetails = async () => {
      try {
        const [detailResponse, similarResponse] = await Promise.all([
          isTV ? getTVDetail(id) : getMovieDetail(id),
          isTV ? getTVSimilar(id) : getSimilar(id),
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
          if (isTV && detailData.seasons) {
            const valid = detailData.seasons.filter(s => s.season_number > 0);
            if (valid.length > 0) setSelectedSeason(valid[0].season_number);
          }
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
  }, [id, isTV]);

  useEffect(() => {
    if (isTV && selectedSeason !== null) {
      setSeasonData(null);
      getTVSeasonDetail(id, selectedSeason)
        .then(res => res.json())
        .then(data => setSeasonData(data))
        .catch(err => console.error(err));
    }
  }, [id, isTV, selectedSeason]);

  const handleWatch = () => {
    if (!user) { showWatchModal(); return; }
    setSelectedEpisodeForPlayer(1);
    setShowPlayer(true);
  };

  const handleEpisodeWatch = (episodeNumber) => {
    if (!user) { showWatchModal(); return; }
    setSelectedEpisodeForPlayer(episodeNumber);
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
          <p className="text-text-muted text-lg mb-4">{error || (isTV ? 'TV show not found' : 'Movie not found')}</p>
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

  const title = movie.title || movie.name || '';
  const date = movie.release_date || movie.first_air_date || 'N/A';
  const runtime = isTV ? (movie.episode_run_time?.[0] || 'N/A') : (movie.runtime || 'N/A');

  // Determine if content is available to watch.
  // Requires BOTH a valid status AND the release date to be today or in the past.
  // This prevents TMDB pre-marking movies as "Released" before they actually hit theaters.
  const today = new Date();
  today.setHours(0, 0, 0, 0); // compare at day level, ignore time

  const releaseDate = date !== 'N/A' ? new Date(date) : null;
  const dateHasPassed = releaseDate !== null && releaseDate <= today;

  const isReleased = (() => {
    if (!isTV) {
      const status = movie.status;
      // For movies: status must be "Released" AND the release date must be today or past
      if (status === 'Released') return dateHasPassed;
      // If no status, fall back to date only
      return dateHasPassed;
    } else {
      // TV shows that have aired episodes
      const tvAiredStatuses = ['Returning Series', 'Ended', 'Canceled'];
      const status = movie.status;
      if (status && tvAiredStatuses.includes(status)) return dateHasPassed;
      return dateHasPassed;
    }
  })();

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
                alt={title}
                className="w-full rounded-lg shadow-[0_0_30px_rgba(232,184,75,0.15)]"
                onError={(e) => { e.target.style.display = 'none'; }}
              />
            </div>
          </div>

          {/* Details */}
          <div className="md:col-span-2">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary mb-4">{title}</h1>

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
              <span className="text-text-muted">{date.split('-')[0]}</span>
              <span className="w-1 h-1 bg-text-muted rounded-full" />
              <span className="text-text-muted">{runtime} min</span>
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
              {isReleased ? (
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
              ) : (
                <div className="flex items-center gap-3 px-8 py-4 rounded-full font-semibold border border-white/10 bg-white/5 text-text-muted cursor-not-allowed select-none">
                  <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={1.5}>
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 6v6l4 2m6-2a10 10 0 11-20 0 10 10 0 0120 0z" />
                  </svg>
                  Coming Soon
                  {date !== 'N/A' && (
                    <span className="text-xs bg-gold/15 text-gold border border-gold/20 px-2.5 py-0.5 rounded-full font-medium">
                      {new Date(date).toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' })}
                    </span>
                  )}
                </div>
              )}

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

            {/* Episodes */}
            {isTV && movie.seasons && (
              <div className="mb-8 overflow-hidden">
                <div className="flex items-center justify-between mb-6 relative">
                  <h3 className="font-display text-xl font-semibold text-text-primary">Episodes</h3>
                  
                  {/* Custom Dropdown */}
                  <div className="relative z-20">
                    <button
                      onClick={() => setIsSeasonDropdownOpen(!isSeasonDropdownOpen)}
                      className="flex items-center gap-2 px-5 py-2.5 bg-white/5 border border-white/10 rounded-xl text-sm font-medium text-text-primary hover:bg-white/10 transition-all duration-300 backdrop-blur-sm"
                    >
                      Season {selectedSeason}
                      <svg className={`w-4 h-4 transition-transform duration-300 ${isSeasonDropdownOpen ? 'rotate-180 text-gold' : 'text-text-muted'}`} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
                    </button>
                    
                    {isSeasonDropdownOpen && (
                      <div className="absolute right-0 mt-2 w-48 bg-[#0d0f1a] border border-white/10 rounded-xl shadow-2xl max-h-60 overflow-y-auto py-2 backdrop-blur-md">
                        {movie.seasons.filter(s => s.season_number > 0).map(s => (
                          <button
                            key={s.id}
                            onClick={() => {
                              setSelectedSeason(s.season_number);
                              setIsSeasonDropdownOpen(false);
                            }}
                            className={`w-full text-left px-4 py-2.5 text-sm transition-colors ${selectedSeason === s.season_number ? 'text-gold bg-gold/10 font-semibold' : 'text-text-primary hover:bg-white/5'}`}
                          >
                            Season {s.season_number}
                          </button>
                        ))}
                      </div>
                    )}
                  </div>
                </div>

                {/* Episode List (Horizontal) */}
                {!seasonData ? (
                  <div className="flex gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {Array.from({ length: 6 }).map((_, i) => (
                      <div key={i} className="bg-surface/50 rounded-xl h-48 animate-pulse flex-shrink-0 w-72 sm:w-80" />
                    ))}
                  </div>
                ) : seasonData.episodes && seasonData.episodes.length > 0 ? (
                  <div className="flex gap-4 overflow-x-auto pb-4" style={{ WebkitOverflowScrolling: 'touch' }}>
                    {seasonData.episodes.map(episode => (
                      <div 
                        key={episode.id} 
                        onClick={() => handleEpisodeWatch(episode.episode_number)}
                        className="group relative bg-surface border border-white/5 rounded-xl overflow-hidden cursor-pointer hover:border-gold/30 hover:shadow-[0_4px_20px_rgba(232,184,75,0.1)] transition-all duration-300 flex flex-col flex-shrink-0 w-72 sm:w-80"
                      >
                        <div className="aspect-video relative overflow-hidden bg-[#0d0f1a]">
                          {episode.still_path ? (
                            <img 
                              src={getImageUrl(episode.still_path, 'w500')} 
                              alt={episode.name}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                              loading="lazy"
                            />
                          ) : (
                            <div className="w-full h-full flex items-center justify-center">
                              <PlayIcon size={32} color="rgba(255,255,255,0.1)" />
                            </div>
                          )}
                          <div className="absolute inset-0 bg-black/30 group-hover:bg-black/10 transition-colors duration-300" />
                          <div className="absolute inset-0 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity duration-300 transform group-hover:scale-110">
                            <div className="w-12 h-12 bg-gold/90 rounded-full flex items-center justify-center shadow-lg">
                              <PlayIcon size={20} color="#07080F" />
                            </div>
                          </div>
                        </div>
                        <div className="p-4 flex-1 flex flex-col">
                          <div className="flex items-center justify-between mb-2">
                            <span className="text-gold text-xs font-bold tracking-wider">EPISODE {episode.episode_number}</span>
                            {episode.runtime && <span className="text-text-muted text-[10px] uppercase font-medium bg-white/5 px-2 py-0.5 rounded-full">{episode.runtime} min</span>}
                          </div>
                          <h4 className="text-text-primary text-sm font-semibold line-clamp-1 mb-1 group-hover:text-gold transition-colors">{episode.name}</h4>
                          <p className="text-text-muted text-xs line-clamp-2 leading-relaxed">{episode.overview || 'No overview available.'}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                ) : (
                   <p className="text-text-muted text-sm">No episodes found for this season.</p>
                )}
              </div>
            )}

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
                    <Link
                      key={actor.id}
                      to={`/actor/${actor.id}`}
                      className="group flex-shrink-0 w-24 text-center"
                    >
                      <div className="w-20 h-20 mx-auto rounded-full overflow-hidden mb-2 bg-surface transition-all duration-300 group-hover:ring-2 group-hover:ring-gold">
                        {actor.profile_path ? (
                          <img
                            src={getImageUrl(actor.profile_path, 'w185')}
                            alt={actor.name}
                            className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-110"
                          />
                        ) : (
                          <div className="w-full h-full flex items-center justify-center bg-white/5">
                            <PersonIcon size={28} color="rgba(232,184,75,0.4)" />
                          </div>
                        )}
                      </div>
                      <p className="text-text-primary text-sm font-medium truncate group-hover:text-gold transition-colors">{actor.name}</p>
                      <p className="text-text-muted text-xs truncate">{actor.character}</p>
                    </Link>
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

        {/* Comment Section */}
        <div className="mt-16 border-t border-white/5 pt-12">
          <CommentSection
            mediaId={movie.id}
            mediaType={isTV ? 'tv' : 'movie'}
          />
        </div>
      </div>

      {/* Video Player Modal */}
      {showPlayer && (
        <VideoPlayer 
          movieId={movie.id} 
          trailerKey={trailer?.key} 
          isTV={isTV} 
          initialSeason={selectedSeason} 
          initialEpisode={selectedEpisodeForPlayer} 
          seasons={movie.seasons}
          onClose={() => setShowPlayer(false)} 
        />
      )}
    </div>
  );
};

export default MovieDetail;
