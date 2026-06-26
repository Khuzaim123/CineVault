import { useEffect, useState, useCallback, useRef } from 'react';
import { CloseIcon, FullscreenIcon } from './CustomIcons';

const CustomDropdown = ({ label, options, value, onChange, isOpen, toggleOpen, closeOpen }) => (
  <div className="relative" onMouseLeave={closeOpen}>
    <button
      onClick={toggleOpen}
      style={{
        display: 'flex', alignItems: 'center', gap: '0.5rem', padding: '0.4rem 1rem',
        borderRadius: '6px', fontSize: '0.8rem', fontWeight: 600, cursor: 'pointer',
        background: 'rgba(255,255,255,0.05)', color: '#fff', border: '1px solid rgba(255,255,255,0.15)',
        transition: 'all 0.2s ease', whiteSpace: 'nowrap'
      }}
    >
      {label}
      <svg style={{ width: '12px', height: '12px', transform: isOpen ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s' }} fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" /></svg>
    </button>
    
    {isOpen && (
      <div 
        style={{
          position: 'absolute', top: '110%', left: 0, minWidth: '100%',
          background: '#0d0f1a', border: '1px solid rgba(255,255,255,0.1)',
          borderRadius: '6px', overflowY: 'auto', maxHeight: '200px', zIndex: 100,
          boxShadow: '0 10px 25px rgba(0,0,0,0.5)', padding: '0.25rem 0'
        }}
      >
        {options.map(opt => (
          <button
            key={opt.value}
            onClick={() => { onChange(opt.value); closeOpen(); }}
            style={{
              display: 'block', width: '100%', textAlign: 'left', padding: '0.4rem 1rem',
              fontSize: '0.8rem', color: value === opt.value ? '#E8B84B' : '#fff',
              background: value === opt.value ? 'rgba(232,184,75,0.1)' : 'transparent',
              border: 'none', cursor: 'pointer', whiteSpace: 'nowrap'
            }}
            onMouseEnter={(e) => {
              if (value !== opt.value) e.currentTarget.style.background = 'rgba(255,255,255,0.1)';
            }}
            onMouseLeave={(e) => {
              if (value !== opt.value) e.currentTarget.style.background = 'transparent';
            }}
          >
            {opt.label}
          </button>
        ))}
      </div>
    )}
  </div>
);

// ─── Source definitions ──────────────────────────────────────────────────────
const buildSources = (tmdbId, trailerKey, isTV, season, episode) => {
  const tvSuffix = isTV && season && episode ? `/${season}/${episode}` : '';
  const tvSuffix2 = isTV && season && episode ? `&s=${season}&e=${episode}` : '';
  const tvSuffix3 = isTV && season && episode ? `&season=${season}&episode=${episode}` : '';

  return [
    {
      id: 'src1',
      label: 'Source 1',
      url: `https://vidsrc.to/embed/${isTV ? 'tv' : 'movie'}/${tmdbId}${tvSuffix}`,
    },
    {
      id: 'src2',
      label: 'Source 2',
      url: `https://vidsrc.me/embed/${isTV ? 'tv' : 'movie'}?tmdb=${tmdbId}${tvSuffix3}`,
    },
    {
      id: 'src3',
      label: 'Source 3',
      url: isTV ? `https://multiembed.mov/?tmdb=1&video_id=${tmdbId}&tmdb_type=tv${tvSuffix2}` : `https://multiembed.mov/?tmdb=1&video_id=${tmdbId}`,
    },
    {
      id: 'trailer',
      label: 'Trailer',
      url: trailerKey ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1` : null,
    },
  ];
};

// ─── Component ───────────────────────────────────────────────────────────────
const VideoPlayer = ({ movieId, trailerKey, isTV, initialSeason, initialEpisode, seasons = [], onClose }) => {
  const validSeasons = seasons.filter(s => s.season_number > 0);
  const [season, setSeason] = useState(initialSeason || 1);
  const [episode, setEpisode] = useState(initialEpisode || 1);
  
  const [isSeasonOpen, setIsSeasonOpen] = useState(false);
  const [isEpisodeOpen, setIsEpisodeOpen] = useState(false);

  const sources = buildSources(movieId, trailerKey, isTV, season, episode);
  const streamSources = sources.slice(0, 3); // Source 1–3 only

  const [activeIndex, setActiveIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [failedIndices, setFailedIndices] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  // Reset when movie, season, or episode changes
  useEffect(() => {
    setActiveIndex(0);
    setIframeKey(k => k + 1);
    setFailedIndices(new Set());
    setIsLoading(true);
  }, [movieId, season, episode]);

  // Keyboard close
  useEffect(() => {
    const handleEsc = (e) => e.key === 'Escape' && onClose();
    document.addEventListener('keydown', handleEsc);
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', handleEsc);
      document.body.style.overflow = 'auto';
    };
  }, [onClose]);

  // ── Ad Blocker: silently swallow popup/redirect attempts from iframe scripts ──
  useEffect(() => {
    // 1. Override window.open — ads open new tabs via this. We return a fake dead window.
    const originalOpen = window.open;
    window.open = (url, target, features) => {
      // Allow YouTube embeds (trailers)
      if (url && url.includes('youtube.com')) return originalOpen(url, target, features);
      // Silently swallow everything else
      return {
        closed: true, focus: () => {}, blur: () => {}, close: () => {},
        location: { href: '' }, document: { write: () => {}, close: () => {} },
      };
    };

    // 2. Protect window.top.location — some ads try to redirect the whole page
    try {
      Object.defineProperty(window, 'location', {
        configurable: true,
        get() { return window._realLocation || location; },
        set(val) {
          // Block redirect if it's not from user action (ads do this programmatically)
          console.debug('[CineVault] Blocked redirect to:', val);
        },
      });
    } catch (_) { /* Some browsers don't allow overriding location — safe to ignore */ }

    // 3. Block beforeunload / unload redirects triggered by ad scripts
    const blockUnload = (e) => { e.preventDefault(); e.returnValue = ''; };
    window.addEventListener('beforeunload', blockUnload);

    return () => {
      window.open = originalOpen;
      window.removeEventListener('beforeunload', blockUnload);
      try {
        Object.defineProperty(window, 'location', { configurable: true, get: undefined, set: undefined });
      } catch (_) {}
    };
  }, []);

  const currentSource = sources[activeIndex];

  // Switch to a specific source index
  const switchTo = useCallback((index) => {
    setActiveIndex(index);
    setIframeKey((k) => k + 1);
    setIsLoading(true);
  }, []);

  // Called when iframe fires onError — auto-advance to next working source
  const handleError = useCallback(() => {
    setIsLoading(false);
    setFailedIndices((prev) => {
      const next = new Set(prev).add(activeIndex);
      // Find next available stream source (0–2) that hasn't failed
      const nextIdx = streamSources.findIndex((_, i) => !next.has(i) && i !== activeIndex);
      if (nextIdx !== -1) {
        setTimeout(() => switchTo(nextIdx), 0);
      } else {
        // All 3 streams failed — fall back to Trailer (index 3) if available
        if (sources[3].url) {
          setTimeout(() => switchTo(3), 0);
        }
      }
      return next;
    });
  }, [activeIndex, streamSources, sources, switchTo]);

  // Fullscreen
  const toggleFullscreen = () => {
    const el = iframeRef.current;
    if (!el) return;
    const req = el.requestFullscreen || el.webkitRequestFullscreen || el.msRequestFullscreen;
    if (req) req.call(el);
  };

  return (
    <div
      className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-black/92 backdrop-blur-md"
      style={{ backdropFilter: 'blur(12px)' }}
    >
      {/* ── Close Button ── */}
      <button
        onClick={onClose}
        aria-label="Close player"
        style={{
          position: 'absolute',
          top: '1.25rem',
          right: '1.25rem',
          zIndex: 10,
          color: 'var(--color-text-muted, #9ca3af)',
          transition: 'color 0.2s',
          background: 'none',
          border: 'none',
          cursor: 'pointer',
          padding: '4px',
        }}
        onMouseEnter={(e) => (e.currentTarget.style.color = '#fff')}
        onMouseLeave={(e) => (e.currentTarget.style.color = 'var(--color-text-muted, #9ca3af)')}
      >
        <CloseIcon size={30} />
      </button>

      {/* ── Player Wrapper ── */}
      <div
        style={{
          width: '100%',
          maxWidth: '1100px',
          padding: '0 1rem',
          display: 'flex',
          flexDirection: 'column',
          gap: '0.75rem',
        }}
      >
        {/* ── Source Selector Row ── */}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            flexWrap: 'wrap',
          }}
        >
          {sources.map((src, idx) => {
            // Hide Trailer button if no key available
            if (idx === 3 && !trailerKey) return null;
            const isActive = activeIndex === idx;
            const isFailed = failedIndices.has(idx) && idx !== 3;
            return (
              <button
                key={src.id}
                onClick={() => switchTo(idx)}
                style={{
                  padding: '0.4rem 1rem',
                  borderRadius: '9999px',
                  fontSize: '0.8rem',
                  fontWeight: 600,
                  letterSpacing: '0.03em',
                  cursor: 'pointer',
                  transition: 'all 0.2s ease',
                  border: isActive
                    ? '1px solid #E8B84B'
                    : '1px solid rgba(255,255,255,0.15)',
                  background: isActive
                    ? 'rgba(232,184,75,0.18)'
                    : 'rgba(255,255,255,0.05)',
                  color: isActive
                    ? '#E8B84B'
                    : isFailed
                    ? 'rgba(255,255,255,0.3)'
                    : 'rgba(255,255,255,0.7)',
                  boxShadow: isActive
                    ? '0 0 14px rgba(232,184,75,0.25)'
                    : 'none',
                  textDecoration: isFailed ? 'line-through' : 'none',
                }}
              >
                {src.label}
              </button>
            );
          })}

          {/* Custom Dropdowns for Season/Episode */}
          {isTV && validSeasons.length > 0 && (
            <div style={{ display: 'flex', gap: '0.5rem', marginLeft: 'auto', alignItems: 'center' }}>
              <CustomDropdown
                label={`Season ${season}`}
                options={validSeasons.map(s => ({ value: s.season_number, label: `Season ${s.season_number}` }))}
                value={season}
                onChange={(val) => { setSeason(val); setEpisode(1); }}
                isOpen={isSeasonOpen}
                toggleOpen={() => { setIsSeasonOpen(!isSeasonOpen); setIsEpisodeOpen(false); }}
                closeOpen={() => setIsSeasonOpen(false)}
              />
              
              <CustomDropdown
                label={`Episode ${episode}`}
                options={Array.from({ length: validSeasons.find(s => s.season_number === season)?.episode_count || 1 }).map((_, i) => ({ value: i + 1, label: `Episode ${i + 1}` }))}
                value={episode}
                onChange={(val) => setEpisode(val)}
                isOpen={isEpisodeOpen}
                toggleOpen={() => { setIsEpisodeOpen(!isEpisodeOpen); setIsSeasonOpen(false); }}
                closeOpen={() => setIsEpisodeOpen(false)}
              />
            </div>
          )}

          {/* Hint message */}
          <span
            style={{
              marginLeft: isTV && validSeasons.length > 0 ? '0.5rem' : 'auto',
              fontSize: '0.72rem',
              color: 'rgba(255,255,255,0.35)',
              fontStyle: 'italic',
              whiteSpace: 'nowrap',
            }}
          >
            If video doesn&apos;t load, try another source
          </span>
        </div>

        {/* ── Iframe Container ── */}
        <div
          style={{
            position: 'relative',
            width: '100%',
            aspectRatio: '16/9',
            background: '#0d0f1a',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 0 50px rgba(232,184,75,0.08)',
          }}
        >
          {/* Loading spinner */}
          {isLoading && (
            <div
              style={{
                position: 'absolute',
                inset: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#0d0f1a',
                zIndex: 2,
                gap: '0.75rem',
              }}
            >
              <div
                style={{
                  width: '40px',
                  height: '40px',
                  border: '3px solid rgba(232,184,75,0.25)',
                  borderTopColor: '#E8B84B',
                  borderRadius: '50%',
                  animation: 'spin 0.8s linear infinite',
                }}
              />
              <p style={{ color: 'rgba(255,255,255,0.4)', fontSize: '0.8rem' }}>
                Loading {currentSource.label}…
              </p>
            </div>
          )}

          {currentSource?.url ? (
            <iframe
              ref={iframeRef}
              key={iframeKey}
              id="movie-iframe"
              src={currentSource.url}
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
              allowFullScreen
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              title={`Movie Player – ${currentSource.label}`}
              referrerPolicy="no-referrer"
              onLoad={() => setIsLoading(false)}
              onError={handleError}
            />
          ) : (
            // Trailer source selected but no key
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                height: '100%',
                color: 'rgba(255,255,255,0.4)',
                fontSize: '0.9rem',
              }}
            >
              No trailer available for this title.
            </div>
          )}

          {/* Fullscreen button overlay */}
          <button
            onClick={toggleFullscreen}
            title="Fullscreen"
            style={{
              position: 'absolute',
              bottom: '0.75rem',
              right: '0.75rem',
              background: 'rgba(0,0,0,0.55)',
              border: 'none',
              borderRadius: '6px',
              padding: '6px',
              cursor: 'pointer',
              color: 'rgba(255,255,255,0.6)',
              transition: 'color 0.2s',
              opacity: 0,
              zIndex: 3,
            }}
            onMouseEnter={(e) => {
              e.currentTarget.style.opacity = '1';
              e.currentTarget.style.color = '#E8B84B';
            }}
            onMouseLeave={(e) => {
              e.currentTarget.style.opacity = '0';
            }}
          >
            <FullscreenIcon size={20} color="currentColor" />
          </button>
        </div>
      </div>

      {/* Spin keyframe */}
      <style>{`
        @keyframes spin { to { transform: rotate(360deg); } }

        /* Make fullscreen button visible on container hover */
        div:hover > button[title="Fullscreen"] {
          opacity: 1 !important;
        }
      `}</style>
    </div>
  );
};

export default VideoPlayer;
