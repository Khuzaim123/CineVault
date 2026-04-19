import { useState, useEffect, useCallback } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { getPopularPeople, searchPeople, getImageUrl } from '../lib/tmdb';
import { PeopleGroupIcon, SearchIcon, FilterIcon, MaleIcon, FemaleIcon, TrendingUpIcon, PersonIcon } from '../components/CustomIcons';
import Pagination from '../components/Pagination';
import Footer from '../components/Footer';

// ─── Gender options ────────────────────────────────────────────────────────
const GENDER_OPTIONS = [
  { value: 'all',    label: 'All'     },
  { value: '2',      label: 'Male'    },
  { value: '1',      label: 'Female'  },
];

// ─── Sort options ──────────────────────────────────────────────────────────
const SORT_OPTIONS = [
  { value: 'popularity', label: 'Most Popular' },
  { value: 'name_asc',   label: 'Name A–Z'     },
  { value: 'name_desc',  label: 'Name Z–A'     },
];

// ─── Skeleton card ─────────────────────────────────────────────────────────
const ActorSkeleton = () => (
  <div className="animate-pulse">
    <div className="aspect-[2/3] rounded-xl bg-white/5 mb-3" />
    <div className="h-3.5 bg-white/5 rounded mb-2 w-3/4" />
    <div className="h-3 bg-white/5 rounded w-1/2" />
  </div>
);

// ─── Single actor card ─────────────────────────────────────────────────────
const ActorCard = ({ person }) => {
  const [imgErr, setImgErr] = useState(false);
  const initials = person.name?.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

  return (
    <Link
      to={`/actor/${person.id}`}
      className="group block"
    >
      <div
        className="relative aspect-[2/3] rounded-xl overflow-hidden mb-3 transition-all duration-300 group-hover:ring-2 group-hover:ring-gold"
        style={{ boxShadow: 'none' }}
        onMouseEnter={e => { e.currentTarget.style.boxShadow = '0 0 24px rgba(232,184,75,0.18)'; }}
        onMouseLeave={e => { e.currentTarget.style.boxShadow = 'none'; }}
      >
        {!imgErr && person.profile_path ? (
          <img
            src={getImageUrl(person.profile_path, 'w342')}
            alt={person.name}
            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
            loading="lazy"
            onError={() => setImgErr(true)}
          />
        ) : (
          <div
            className="w-full h-full flex flex-col items-center justify-center gap-3"
            style={{ background: 'linear-gradient(135deg, #1a1730, #0F1120)' }}
          >
            <PersonIcon size={48} color="#E8B84B" />
            <span className="text-text-muted text-xs text-center px-2 leading-tight">{person.name}</span>
          </div>
        )}

        {/* Gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

        {/* Popularity badge */}
        <div
          className="absolute top-2 right-2 flex items-center gap-1 px-2 py-1 rounded-full text-[10px] font-semibold"
          style={{ background: 'rgba(0,0,0,0.65)', backdropFilter: 'blur(6px)', color: '#E8B84B' }}
        >
          <TrendingUpIcon size={9} color="#E8B84B" />
          {person.popularity?.toFixed(0)}
        </div>

        {/* Bottom overlay on hover */}
        <div className="absolute bottom-0 left-0 right-0 p-3 translate-y-full group-hover:translate-y-0 transition-transform duration-300">
          <p className="text-text-muted text-[10px] text-center">View Profile</p>
        </div>
      </div>

      <h3 className="text-text-primary text-sm font-semibold leading-tight truncate group-hover:text-gold transition-colors">
        {person.name}
      </h3>
      {person.known_for_department && (
        <p className="text-text-muted text-xs mt-0.5 truncate">{person.known_for_department}</p>
      )}
      {person.known_for?.[0]?.title || person.known_for?.[0]?.name ? (
        <p className="text-text-muted text-[10px] mt-0.5 truncate opacity-70">
          {person.known_for[0].title || person.known_for[0].name}
        </p>
      ) : null}
    </Link>
  );
};

// ─── Main page ─────────────────────────────────────────────────────────────
const Actors = () => {
  const [searchParams, setSearchParams] = useSearchParams();

  const pageParam   = parseInt(searchParams.get('page') || '1', 10);
  const genderParam = searchParams.get('gender') || 'all';
  const sortParam   = searchParams.get('sort')   || 'popularity';
  const queryParam  = searchParams.get('q')      || '';

  const [people,     setPeople]     = useState([]);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoading,  setIsLoading]  = useState(true);
  const [searchInput, setSearchInput] = useState(queryParam);

  const applyParams = useCallback((overrides = {}) => {
    const next = {
      page:   '1',
      gender: genderParam,
      sort:   sortParam,
      q:      queryParam,
      ...overrides,
    };
    // Don't include empty values
    const params = {};
    if (next.page   !== '1')  params.page   = next.page;
    if (next.gender !== 'all') params.gender = next.gender;
    if (next.sort   !== 'popularity') params.sort = next.sort;
    if (next.q)               params.q      = next.q;
    setSearchParams(params);
  }, [genderParam, sortParam, queryParam, setSearchParams]);

  // Real-time debounced search
  useEffect(() => {
    const handler = setTimeout(() => {
      const q = searchInput.trim();
      if (q !== queryParam) {
        applyParams({ q, page: '1' });
      }
    }, 300);
    return () => clearTimeout(handler);
  }, [searchInput, queryParam, applyParams]);

  useEffect(() => {
    setIsLoading(true);
    window.scrollTo({ top: 0, behavior: 'smooth' });

    const doFetch = async () => {
      try {
        let raw;
        if (queryParam) {
          raw = await searchPeople(queryParam, pageParam).then(r => r.json());
        } else {
          raw = await getPopularPeople(pageParam).then(r => r.json());
        }

        let results = raw.results || [];

        // Client-side gender filter (TMDB doesn't support gender filter in popular endpoint)
        if (genderParam !== 'all') {
          results = results.filter(p => String(p.gender) === genderParam);
        }

        // Client-side sort
        if (sortParam === 'name_asc') {
          results = [...results].sort((a, b) => a.name.localeCompare(b.name));
        } else if (sortParam === 'name_desc') {
          results = [...results].sort((a, b) => b.name.localeCompare(a.name));
        }
        // 'popularity' is already the default TMDB order

        setPeople(results);
        setTotalPages(Math.min(raw.total_pages || 1, 500));
      } catch (err) {
        console.error('Failed to fetch people:', err);
        setPeople([]);
      } finally {
        setIsLoading(false);
      }
    };

    doFetch();
  }, [pageParam, genderParam, sortParam, queryParam]);

  const handleSearchSubmit = (e) => {
    e.preventDefault();
    applyParams({ q: searchInput.trim(), page: '1' });
  };

  return (
    <div className="min-h-screen bg-background">
      {/* ── Hero header ── */}
      <div
        className="relative pt-32 pb-12 px-4 sm:px-6 lg:px-8"
        style={{
          background: 'linear-gradient(180deg, rgba(232,184,75,0.06) 0%, transparent 100%)',
          borderBottom: '1px solid rgba(255,255,255,0.05)',
        }}
      >
        <div className="max-w-7xl mx-auto">
          <div className="flex items-center gap-4 mb-4">
            <div
              className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.2)' }}
            >
              <PeopleGroupIcon size={24} color="#E8B84B" />
            </div>
            <div>
              <h1 className="font-display text-4xl sm:text-5xl font-bold text-text-primary">Actors</h1>
              <p className="text-text-muted text-sm mt-1">Discover actors and actresses from around the world</p>
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        {/* ── Filters bar ── */}
        <div
          className="flex flex-wrap gap-3 items-start mb-8 p-5 rounded-2xl"
          style={{ background: 'rgba(255,255,255,0.03)', border: '1px solid rgba(255,255,255,0.07)' }}
        >
          {/* Search */}
          <div className="flex gap-2 flex-1" style={{ minWidth: '180px' }}>
            <div className="relative flex-1">
              <div className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none">
                <SearchIcon size={16} color="#6B6875" />
              </div>
              <input
                id="actor-search"
                type="text"
                value={searchInput}
                onChange={e => setSearchInput(e.target.value)}
                placeholder="Search actors..."
                className="w-full pl-9 pr-4 py-2.5 text-sm rounded-full text-text-primary placeholder-text-muted outline-none"
                style={{
                  background: 'rgba(255,255,255,0.06)',
                  border: '1px solid rgba(255,255,255,0.1)',
                }}
              />
            </div>
          </div>

          {/* Gender filter */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-1.5 mr-1">
              <FilterIcon size={14} color="#6B6875" />
              <span className="text-text-muted text-xs font-medium">Gender</span>
            </div>
            {GENDER_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => applyParams({ gender: opt.value })}
                className="flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300"
                style={{
                  background: genderParam === opt.value ? 'rgba(232,184,75,0.15)' : 'rgba(255,255,255,0.05)',
                  border:     genderParam === opt.value ? '1px solid rgba(232,184,75,0.4)' : '1px solid rgba(255,255,255,0.08)',
                  color:      genderParam === opt.value ? '#E8B84B' : '#6B6875',
                }}
              >
                {opt.value === '2' && <MaleIcon size={12} color="currentColor" />}
                {opt.value === '1' && <FemaleIcon size={12} color="currentColor" />}
                {opt.label}
              </button>
            ))}
          </div>

          {/* Sort */}
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-text-muted text-xs font-medium">Sort</span>
            {SORT_OPTIONS.map(opt => (
              <button
                key={opt.value}
                onClick={() => applyParams({ sort: opt.value })}
                className="px-4 py-2 rounded-full text-xs font-semibold transition-all duration-300"
                style={{
                  background: sortParam === opt.value ? '#E8B84B' : 'rgba(255,255,255,0.05)',
                  border:     sortParam === opt.value ? '1px solid #E8B84B' : '1px solid rgba(255,255,255,0.08)',
                  color:      sortParam === opt.value ? '#07080F' : '#6B6875',
                }}
              >
                {opt.label}
              </button>
            ))}
          </div>

          {/* Clear */}
          {(genderParam !== 'all' || sortParam !== 'popularity' || queryParam) && (
            <button
              onClick={() => { setSearchInput(''); setSearchParams({}); }}
              className="px-4 py-2 rounded-full text-xs font-medium transition-all duration-300"
              style={{ border: '1px solid rgba(255,255,255,0.1)', color: '#6B6875' }}
            >
              Clear
            </button>
          )}
        </div>

        {/* ── Results count ── */}
        {!isLoading && (
          <p className="text-text-muted text-sm mb-6">
            {queryParam ? `Results for "${queryParam}"` : 'Popular actors & actresses'}
            {' '}&mdash;{' '}
            <span className="text-text-primary font-medium">{people.length}</span> shown
          </p>
        )}

        {/* ── Grid ── */}
        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {Array.from({ length: 18 }).map((_, i) => <ActorSkeleton key={i} />)}
          </div>
        ) : people.length === 0 ? (
          <div className="min-h-[40vh] flex flex-col items-center justify-center gap-4">
            <PersonIcon size={64} color="rgba(255,255,255,0.1)" />
            <p className="text-text-muted text-lg">No actors found</p>
            <button
              onClick={() => { setSearchInput(''); setSearchParams({}); }}
              className="px-6 py-2.5 rounded-full text-sm font-semibold transition-all"
              style={{ background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.25)', color: '#E8B84B' }}
            >
              Clear filters
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-5">
            {people.map(person => <ActorCard key={person.id} person={person} />)}
          </div>
        )}

        {/* ── Pagination ── */}
        {!isLoading && totalPages > 1 && (
          <Pagination
            currentPage={pageParam}
            totalPages={totalPages}
            onPageChange={page => applyParams({ page: String(page) })}
            accentColor="#E8B84B"
            className="mt-12"
          />
        )}
      </div>

      <Footer />
    </div>
  );
};

export default Actors;
