import { useState, useEffect } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { getPersonDetail, getImageUrl } from '../lib/tmdb';
import {
  ArrowLeftIcon, StarIcon, FilmIcon, TVIcon,
  BirthdayIcon, MapPinIcon, AwardIcon, PersonIcon,
} from '../components/CustomIcons';
import MovieCard from '../components/MovieCard';
import Footer from '../components/Footer';

// ─── Helpers ──────────────────────────────────────────────────────────────
const calcAge = (dob, dod) => {
  if (!dob) return null;
  const end  = dod ? new Date(dod) : new Date();
  const born = new Date(dob);
  let age = end.getFullYear() - born.getFullYear();
  const m = end.getMonth() - born.getMonth();
  if (m < 0 || (m === 0 && end.getDate() < born.getDate())) age--;
  return age;
};

const formatDate = (str) => {
  if (!str) return 'Unknown';
  const d = new Date(str);
  return d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
};

const GENDER_MAP = { 1: 'Female', 2: 'Male', 3: 'Non-binary' };

// ─── Image gallery ────────────────────────────────────────────────────────
const ImageScroller = ({ images }) => {
  if (!images?.length) return null;
  return (
    <div className="flex gap-3 overflow-x-auto pb-2" style={{ WebkitOverflowScrolling: 'touch' }}>
      {images.slice(0, 10).map((img, i) => (
        <div
          key={i}
          className="flex-shrink-0 w-24 h-36 rounded-lg overflow-hidden"
          style={{ boxShadow: '0 4px 20px rgba(0,0,0,0.4)' }}
        >
          <img
            src={getImageUrl(img.file_path, 'w185')}
            alt={`Photo ${i + 1}`}
            className="w-full h-full object-cover"
            loading="lazy"
          />
        </div>
      ))}
    </div>
  );
};

// ─── Stat pill ────────────────────────────────────────────────────────────
const StatPill = ({ icon: Icon, label, value }) => (
  <div
    className="flex items-center gap-3 px-5 py-3 rounded-xl"
    style={{ background: 'rgba(255,255,255,0.04)', border: '1px solid rgba(255,255,255,0.08)' }}
  >
    <Icon size={18} color="#E8B84B" />
    <div>
      <p className="text-text-muted text-xs">{label}</p>
      <p className="text-text-primary text-sm font-semibold">{value}</p>
    </div>
  </div>
);

// ─── Known-for movie card (clickable to /movie/:id) ───────────────────────
const FilmographyCard = ({ item, mediaType }) => {
  const [imgErr, setImgErr] = useState(false);
  const path   = item.poster_path;
  const title  = item.title || item.name || 'Untitled';
  const year   = (item.release_date || item.first_air_date || '').split('-')[0];
  const route  = mediaType === 'tv' ? `/tv/${item.id}` : `/movie/${item.id}`;

  return (
    <Link
      to={route}
      className="group flex-shrink-0 w-28 text-center"
    >
      <div
        className="aspect-[2/3] rounded-lg overflow-hidden mb-2 transition-all duration-300 group-hover:ring-2 group-hover:ring-gold"
        style={{ background: '#1a1730' }}
      >
        {!imgErr && path ? (
          <img
            src={getImageUrl(path, 'w185')}
            alt={title}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-[1.04]"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <FilmIcon size={28} color="rgba(232,184,75,0.3)" />
          </div>
        )}
      </div>
      <p className="text-text-primary text-xs font-medium truncate group-hover:text-gold transition-colors">{title}</p>
      {item.character && (
        <p className="text-text-muted text-[10px] truncate mt-0.5 italic">{item.character}</p>
      )}
      {year && <p className="text-text-muted text-[10px] mt-0.5">{year}</p>}
      {item.vote_average > 0 && (
        <div className="flex items-center justify-center gap-1 mt-0.5">
          <StarIcon size={9} color="#E8B84B" />
          <span className="text-text-muted text-[10px]">{item.vote_average.toFixed(1)}</span>
        </div>
      )}
    </Link>
  );
};

// ─── Main page ────────────────────────────────────────────────────────────
const ActorDetail = () => {
  const { id }   = useParams();
  const navigate = useNavigate();

  const [person,    setPerson]    = useState(null);
  const [isLoading, setIsLoading] = useState(true);
  const [imgErr,    setImgErr]    = useState(false);
  const [showFullBio, setShowFullBio] = useState(false);

  useEffect(() => {
    window.scrollTo(0, 0);
    setIsLoading(true);
    setImgErr(false);
    setShowFullBio(false);

    getPersonDetail(id)
      .then(r => r.json())
      .then(data => { setPerson(data); })
      .catch(err => console.error('Failed to load person:', err))
      .finally(() => setIsLoading(false));
  }, [id]);

  // ── Loading skeleton ────────────────────────────────────────────────────
  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 animate-pulse">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
            <div className="aspect-[2/3] rounded-2xl bg-white/5" />
            <div className="md:col-span-3 space-y-4 pt-4">
              <div className="h-10 bg-white/5 rounded w-1/2" />
              <div className="h-4 bg-white/5 rounded w-1/4" />
              <div className="h-32 bg-white/5 rounded" />
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (!person || person.success === false) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-4">
          <PersonIcon size={64} color="rgba(255,255,255,0.1)" />
          <p className="text-text-muted">Actor not found.</p>
          <button
            onClick={() => navigate('/actors')}
            className="px-6 py-3 rounded-full font-medium text-sm"
            style={{ background: '#E8B84B', color: '#07080F' }}
          >
            Back to Actors
          </button>
        </div>
      </div>
    );
  }

  const age       = calcAge(person.birthday, person.deathday);
  const movieCredits = (person.movie_credits?.cast || [])
    .filter(m => m.poster_path)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 20);
  const tvCredits = (person.tv_credits?.cast || [])
    .filter(m => m.poster_path)
    .sort((a, b) => (b.popularity || 0) - (a.popularity || 0))
    .slice(0, 20);
  const photos = person.images?.profiles || [];
  const bio    = person.biography || '';
  const bioPreview = bio.length > 400 ? bio.slice(0, 400) + '…' : bio;

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero backdrop (blurred profile image) ── */}
      {person.profile_path && (
        <div className="absolute top-0 left-0 right-0 h-[50vh] overflow-hidden pointer-events-none">
          <img
            src={getImageUrl(person.profile_path, 'w780')}
            alt=""
            aria-hidden="true"
            className="w-full h-full object-cover object-top"
            style={{ filter: 'blur(60px) brightness(0.25)', transform: 'scale(1.1)' }}
          />
          <div className="absolute inset-0 bg-gradient-to-b from-transparent to-background" />
        </div>
      )}

      {/* ── Back button ── */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-24 left-4 sm:left-8 z-10 flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors"
      >
        <ArrowLeftIcon size={20} />
        <span className="text-sm font-medium">Back</span>
      </button>

      {/* ── Main content ── */}
      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-28 pb-16">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 lg:gap-12">

          {/* ── Left: Portrait ── */}
          <div className="flex flex-col items-center md:items-start">
            <div
              className="w-56 md:w-full aspect-[2/3] rounded-2xl overflow-hidden mb-5"
              style={{ boxShadow: '0 0 40px rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.15)' }}
            >
              {!imgErr && person.profile_path ? (
                <img
                  src={getImageUrl(person.profile_path, 'w500')}
                  alt={person.name}
                  className="w-full h-full object-cover"
                  onError={() => setImgErr(true)}
                />
              ) : (
                <div
                  className="w-full h-full flex flex-col items-center justify-center gap-4"
                  style={{ background: 'linear-gradient(135deg, #1a1730, #0F1120)' }}
                >
                  <PersonIcon size={72} color="#E8B84B" />
                  <span className="text-text-muted text-sm text-center px-4">{person.name}</span>
                </div>
              )}
            </div>

            {/* Stats */}
            <div className="w-full space-y-2">
              {person.birthday && (
                <StatPill
                  icon={BirthdayIcon}
                  label={person.deathday ? 'Born' : 'Born'}
                  value={`${formatDate(person.birthday)}${age ? ` (age ${age})` : ''}`}
                />
              )}
              {person.deathday && (
                <StatPill icon={BirthdayIcon} label="Died" value={formatDate(person.deathday)} />
              )}
              {person.place_of_birth && (
                <StatPill icon={MapPinIcon} label="Born in" value={person.place_of_birth} />
              )}
              {person.known_for_department && (
                <StatPill icon={AwardIcon} label="Known for" value={person.known_for_department} />
              )}
              {person.gender && (
                <StatPill icon={PersonIcon} label="Gender" value={GENDER_MAP[person.gender] || 'Unknown'} />
              )}
              <StatPill
                icon={AwardIcon}
                label="Popularity"
                value={person.popularity?.toFixed(1) || 'N/A'}
              />
            </div>
          </div>

          {/* ── Right: Details ── */}
          <div className="md:col-span-3">
            <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary mb-2">
              {person.name}
            </h1>
            {person.known_for_department && (
              <p className="text-gold text-base font-medium mb-6">{person.known_for_department}</p>
            )}

            {/* Biography */}
            {bio && (
              <div className="mb-8">
                <h2 className="font-display text-xl font-semibold text-text-primary mb-3">Biography</h2>
                <p className="text-text-muted leading-relaxed text-sm">
                  {showFullBio ? bio : bioPreview}
                </p>
                {bio.length > 400 && (
                  <button
                    onClick={() => setShowFullBio(v => !v)}
                    className="mt-2 text-gold text-sm font-medium hover:underline"
                  >
                    {showFullBio ? 'Show less' : 'Read more'}
                  </button>
                )}
              </div>
            )}

            {/* Photos */}
            {photos.length > 0 && (
              <div className="mb-8">
                <h2 className="font-display text-xl font-semibold text-text-primary mb-4">Photos</h2>
                <ImageScroller images={photos} />
              </div>
            )}

            {/* Movie credits */}
            {movieCredits.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <FilmIcon size={20} color="#E8B84B" />
                  <h2 className="font-display text-xl font-semibold text-text-primary">
                    Movies ({person.movie_credits?.cast?.length || 0})
                  </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {movieCredits.map(m => (
                    <FilmographyCard key={`movie-${m.id}-${m.credit_id}`} item={m} mediaType="movie" />
                  ))}
                </div>
              </div>
            )}

            {/* TV credits */}
            {tvCredits.length > 0 && (
              <div className="mb-8">
                <div className="flex items-center gap-2 mb-4">
                  <TVIcon size={20} color="#E8B84B" />
                  <h2 className="font-display text-xl font-semibold text-text-primary">
                    TV Shows ({person.tv_credits?.cast?.length || 0})
                  </h2>
                </div>
                <div className="flex gap-4 overflow-x-auto pb-3" style={{ WebkitOverflowScrolling: 'touch' }}>
                  {tvCredits.map(m => (
                    <FilmographyCard key={`tv-${m.id}-${m.credit_id}`} item={m} mediaType="tv" />
                  ))}
                </div>
              </div>
            )}

            {movieCredits.length === 0 && tvCredits.length === 0 && (
              <div
                className="py-12 rounded-2xl flex flex-col items-center gap-3"
                style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.06)' }}
              >
                <FilmIcon size={48} color="rgba(255,255,255,0.1)" />
                <p className="text-text-muted text-sm">No filmography available</p>
              </div>
            )}
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
};

export default ActorDetail;
