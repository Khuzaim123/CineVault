import { useState } from 'react';
import { Link } from 'react-router-dom';
import { StarIcon, HeartIcon, BookmarkIcon, LockIcon, FilmIcon } from './CustomIcons';
import { getImageUrl } from '../lib/tmdb';
import { useAuth } from '../context/AuthContext';
import { useSupabaseLists } from '../lib/useSupabaseLists';
import { useGuestModal } from '../context/GuestModalContext';


const MovieCard = ({ movie }) => {
  const [isHovered, setIsHovered] = useState(false);
  const [imgError, setImgError] = useState(false);
  const { user } = useAuth();
  const { isFavorite, toggleFavorite, isInWatchlist, toggleWatchlist } = useSupabaseLists();
  const { showSaveModal } = useGuestModal();

  const inFavorites = isFavorite(movie?.id);
  const inWatchlist = isInWatchlist(movie?.id);
  const releaseYear = movie?.release_date?.split('-')[0] || movie?.first_air_date?.split('-')[0] || 'N/A';
  const title = movie?.title || movie?.name || '';

  const handleFavorite = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { showSaveModal(); return; }
    toggleFavorite(movie);
  };

  const handleWatchlist = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (!user) { showSaveModal(); return; }
    toggleWatchlist(movie);
  };

  return (
    <Link
      to={`/movie/${movie?.id}`}
      className="relative group block flex-shrink-0"
      style={{ minWidth: '130px', width: '130px' }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
    >
      {/* Responsive sizing via CSS classes */}
      <div className="movie-card-width">
        <div
          className={`relative aspect-[2/3] rounded-lg overflow-hidden transition-all duration-300 ${
            isHovered ? 'shadow-[0_0_30px_rgba(232,184,75,0.2)] ring-2 ring-gold' : ''
          }`}
          style={{ transform: isHovered ? 'scale(1.03)' : 'scale(1)' }}
        >
          {/* Poster Image or Fallback */}
          {!imgError && movie?.poster_path ? (
            <img
              src={getImageUrl(movie?.poster_path, 'w300')}
              alt={title}
              className="w-full h-full object-cover"
              loading="lazy"
              onError={() => setImgError(true)}
            />
          ) : (
            <div
              className="w-full h-full flex flex-col items-center justify-center p-3 text-center"
              style={{ background: 'linear-gradient(135deg, #1a1730, #0F1120)' }}
            >
              <div className="mb-2 opacity-40"><FilmIcon size={32} color="#E8B84B" /></div>
              <span className="text-text-muted text-xs line-clamp-3">{title}</span>
            </div>
          )}

          {/* Gradient overlay */}
          <div
            className="absolute inset-0 bg-gradient-to-t from-background via-background/50 to-transparent transition-opacity duration-300"
            style={{ opacity: isHovered ? 1 : 0.7 }}
          />

          {/* Mobile: always show title; Desktop: slide up on hover */}
          <div
            className="absolute bottom-0 left-0 right-0 p-3 transition-transform duration-300"
            style={{ transform: isHovered ? 'translateY(0)' : 'translateY(4px)' }}
          >
            {/* Title: visible on mobile always, hover only on desktop */}
            <h3 className="text-text-primary font-medium text-xs leading-tight line-clamp-2 mb-1.5 md:opacity-0 md:group-hover:opacity-100 transition-opacity duration-300">
              {title}
            </h3>

            <div className="flex items-center justify-between">
              <div className="flex items-center gap-1">
                <StarIcon size={11} color="#E8B84B" />
                <span className="text-text-muted text-[10px]">{movie?.vote_average?.toFixed(1) || 'N/A'}</span>
              </div>
              <span className="text-text-muted text-[10px]">{releaseYear}</span>
            </div>

            {/* Action icons (visible on hover desktop, always on mobile when tapped) */}
            <div className={`flex gap-2 mt-2 transition-opacity duration-300 ${isHovered ? 'opacity-100' : 'opacity-0'}`}>
              {/* Favorite heart */}
              <button
                onClick={handleFavorite}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300 relative"
                style={{
                  background: inFavorites ? 'rgba(232,184,75,0.2)' : 'rgba(255,255,255,0.08)',
                  color: inFavorites ? '#E8B84B' : '#F0EDE8',
                  opacity: !user ? 0.7 : 1,
                }}
              >
                {!user
                  ? <LockIcon size={12} color="currentColor" />
                  : <HeartIcon size={12} color="currentColor" filled={inFavorites} />}
              </button>

              {/* Watchlist bookmark */}
              <button
                onClick={handleWatchlist}
                className="flex-1 flex items-center justify-center gap-1 py-1.5 rounded-full text-[10px] font-medium transition-all duration-300"
                style={{
                  background: inWatchlist ? 'rgba(232,184,75,0.2)' : 'rgba(255,255,255,0.08)',
                  color: inWatchlist ? '#E8B84B' : '#F0EDE8',
                  opacity: !user ? 0.7 : 1,
                }}
              >
                {!user
                  ? <LockIcon size={12} color="currentColor" />
                  : <BookmarkIcon size={12} color="currentColor" filled={inWatchlist} />}
              </button>
            </div>
          </div>

          {/* Rating Badge (top-right) */}
          <div className="absolute top-2 right-2 flex items-center gap-1 px-1.5 py-0.5 bg-black/60 backdrop-blur-sm rounded-full">
            <StarIcon size={10} color="#E8B84B" />
            <span className="text-text-primary text-[10px] font-medium">{movie?.vote_average?.toFixed(1) || 'N/A'}</span>
          </div>
        </div>

        {/* Title always visible below on mobile */}
        <p className="md:hidden text-text-primary text-xs font-medium mt-1.5 line-clamp-1 px-0.5">{title}</p>
      </div>
    </Link>
  );
};

export default MovieCard;
