import { useEffect, useState, useCallback, useRef } from 'react';
import { CloseIcon, FullscreenIcon } from './CustomIcons';

// ─── Source definitions ──────────────────────────────────────────────────────
const buildSources = (tmdbId, trailerKey, isTV) => [
  {
    id: 'src1',
    label: 'Source 1',
    url: `https://vidsrc.to/embed/${isTV ? 'tv' : 'movie'}/${tmdbId}`,
  },
  {
    id: 'src2',
    label: 'Source 2',
    url: `https://vidsrc.me/embed/${isTV ? 'tv' : 'movie'}?tmdb=${tmdbId}`,
  },
  {
    id: 'src3',
    label: 'Source 3',
    url: isTV ? `https://multiembed.mov/?tmdb=1&video_id=${tmdbId}&tmdb_type=tv` : `https://multiembed.mov/?tmdb=1&video_id=${tmdbId}`,
  },
  {
    id: 'trailer',
    label: 'Trailer',
    url: trailerKey ? `https://www.youtube.com/embed/${trailerKey}?autoplay=1` : null,
  },
];

// ─── Component ───────────────────────────────────────────────────────────────
const VideoPlayer = ({ movieId, trailerKey, isTV, onClose }) => {
  const sources = buildSources(movieId, trailerKey, isTV);
  const streamSources = sources.slice(0, 3); // Source 1–3 only

  const [activeIndex, setActiveIndex] = useState(0);
  const [iframeKey, setIframeKey] = useState(0);
  const [failedIndices, setFailedIndices] = useState(new Set());
  const [isLoading, setIsLoading] = useState(true);
  const iframeRef = useRef(null);

  // Reset when movie changes
  useEffect(() => {
    setActiveIndex(0);
    setIframeKey(0);
    setFailedIndices(new Set());
    setIsLoading(true);
  }, [movieId]);

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

          {/* Hint message */}
          <span
            style={{
              marginLeft: 'auto',
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
