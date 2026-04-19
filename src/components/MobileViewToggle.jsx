/**
 * MobileViewToggle.jsx — v2
 *
 * Uses an iframe overlay to preview the site at 390px (iPhone 14).
 * This is the ONLY correct way to trigger real CSS media queries / Tailwind
 * responsive breakpoints (sm:, md:, lg:) — iframes have their own viewport.
 *
 * Behaviour:
 *  - Click button → iframe opens over the page, sized 390×844px
 *  - Iframe loads the current URL, so all routing context is preserved
 *  - A device frame is drawn around the iframe
 *  - Click "Exit" or press Escape to close
 *  - Button is hidden on real mobile screens (< 768px)
 */
import { useState, useEffect, useCallback } from 'react';

// ── Icons ─────────────────────────────────────────────────────────────────────
const PhoneIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="5" y="2" width="14" height="20" rx="3" stroke="currentColor" strokeWidth="2" />
    <circle cx="12" cy="18" r="1" fill="currentColor" />
    <path d="M9 5H15" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
  </svg>
);

const MonitorIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <rect x="2" y="3" width="20" height="14" rx="2" stroke="currentColor" strokeWidth="2" />
    <path d="M8 21H16M12 17V21" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const CloseIcon = ({ size = 16 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M18 6L6 18M6 6L18 18" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

const RefreshIcon = ({ size = 14 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M1 4v6h6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M3.51 15a9 9 0 1 0 .49-5.44" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
  </svg>
);

// ── Device sizes ──────────────────────────────────────────────────────────────
const DEVICES = [
  { id: 'iphone',  label: 'iPhone 14',      w: 390,  h: 844  },
  { id: 'android', label: 'Android Large',  w: 412,  h: 915  },
  { id: 'tablet',  label: 'iPad Mini',      w: 768,  h: 1024 },
];

const MobileViewToggle = () => {
  const [isOpen,    setIsOpen]    = useState(false);
  const [device,    setDevice]    = useState(DEVICES[0]);
  const [iframeKey, setIframeKey] = useState(0); // force iframe reload
  const [isDesktop, setIsDesktop] = useState(window.innerWidth >= 768);

  // Hide on real mobile screens
  useEffect(() => {
    const check = () => setIsDesktop(window.innerWidth >= 768);
    window.addEventListener('resize', check);
    return () => window.removeEventListener('resize', check);
  }, []);

  // Close on Escape
  const handleKeyDown = useCallback((e) => {
    if (e.key === 'Escape') setIsOpen(false);
  }, []);
  useEffect(() => {
    document.addEventListener('keydown', handleKeyDown);
    return () => document.removeEventListener('keydown', handleKeyDown);
  }, [handleKeyDown]);

  // Prevent body scroll when overlay is open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  if (!isDesktop) return null;

  // ── Iframe overlay ────────────────────────────────────────────────────────
  if (isOpen) {
    // Scale the iframe + frame to fit viewport height with some padding
    const vh = window.innerHeight;
    const maxH = vh - 120; // 60px top + 60px bottom chrome
    const scale = device.h > maxH ? maxH / device.h : 1;
    const scaledW = device.w * scale;
    const scaledH = device.h * scale;

    return (
      <>
        {/* Dim backdrop */}
        <div
          onClick={() => setIsOpen(false)}
          style={{
            position:   'fixed',
            inset:       0,
            zIndex:      9998,
            background: 'rgba(0,0,0,0.85)',
            backdropFilter: 'blur(8px)',
          }}
        />

        {/* Device chrome wrapper */}
        <div
          style={{
            position:  'fixed',
            top:        '50%',
            left:       '50%',
            transform:  'translate(-50%, -50%)',
            zIndex:      9999,
            display:    'flex',
            flexDirection: 'column',
            alignItems: 'center',
            gap:        '16px',
          }}
        >
          {/* Top toolbar */}
          <div style={{
            display:        'flex',
            alignItems:     'center',
            gap:            '10px',
            padding:        '8px 12px',
            borderRadius:   '999px',
            background:     'rgba(15,17,32,0.95)',
            border:         '1px solid rgba(255,255,255,0.12)',
            backdropFilter: 'blur(12px)',
            boxShadow:      '0 8px 32px rgba(0,0,0,0.4)',
          }}>
            {/* Device selector */}
            {DEVICES.map((d) => (
              <button
                key={d.id}
                onClick={() => { setDevice(d); setIframeKey((k) => k + 1); }}
                style={{
                  padding:      '5px 12px',
                  borderRadius: '999px',
                  fontSize:     '12px',
                  fontWeight:   '600',
                  border:       `1px solid ${device.id === d.id ? 'rgba(232,184,75,0.6)' : 'rgba(255,255,255,0.1)'}`,
                  background:   device.id === d.id ? 'rgba(232,184,75,0.15)' : 'transparent',
                  color:        device.id === d.id ? '#E8B84B' : '#6B6875',
                  cursor:       'pointer',
                  transition:   'all 0.2s',
                  whiteSpace:   'nowrap',
                }}
              >
                {d.label}
                <span style={{ marginLeft: '4px', opacity: 0.5 }}>
                  {d.w}×{d.h}
                </span>
              </button>
            ))}

            <div style={{ width: '1px', height: '20px', background: 'rgba(255,255,255,0.1)' }} />

            {/* Refresh */}
            <button
              onClick={() => setIframeKey((k) => k + 1)}
              title="Reload preview"
              style={{
                width:      '30px',
                height:     '30px',
                borderRadius: '999px',
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border:     '1px solid rgba(255,255,255,0.1)',
                background: 'transparent',
                color:      '#6B6875',
                cursor:     'pointer',
              }}
            >
              <RefreshIcon size={13} />
            </button>

            {/* Close */}
            <button
              onClick={() => setIsOpen(false)}
              title="Exit mobile view (Esc)"
              style={{
                width:      '30px',
                height:     '30px',
                borderRadius: '999px',
                display:    'flex',
                alignItems: 'center',
                justifyContent: 'center',
                border:     '1px solid rgba(220,38,38,0.3)',
                background: 'rgba(220,38,38,0.1)',
                color:      '#f87171',
                cursor:     'pointer',
              }}
            >
              <CloseIcon size={13} />
            </button>
          </div>

          {/* Phone shell + iframe */}
          <div
            style={{
              position:     'relative',
              width:        `${scaledW + 28}px`,
              height:       `${scaledH + 60}px`,
              borderRadius: '40px',
              background:   'linear-gradient(145deg, #1a1a2e, #0d0d1a)',
              border:       '2px solid rgba(255,255,255,0.15)',
              boxShadow:    `
                0 0 0 1px rgba(255,255,255,0.05),
                0 40px 100px rgba(0,0,0,0.8),
                inset 0 1px 0 rgba(255,255,255,0.1)
              `,
              padding:      `30px 14px`,
              overflow:     'hidden',
            }}
          >
            {/* Top notch / speaker */}
            <div style={{
              position:     'absolute',
              top:          '12px',
              left:         '50%',
              transform:    'translateX(-50%)',
              width:        '80px',
              height:       '10px',
              borderRadius: '999px',
              background:   'rgba(0,0,0,0.8)',
              border:       '1px solid rgba(255,255,255,0.08)',
            }} />

            {/* Home indicator */}
            <div style={{
              position:     'absolute',
              bottom:       '10px',
              left:         '50%',
              transform:    'translateX(-50%)',
              width:        '100px',
              height:       '4px',
              borderRadius: '999px',
              background:   'rgba(255,255,255,0.25)',
            }} />

            {/* The actual iframe — this creates a real 390px viewport */}
            <div style={{
              width:        `${scaledW}px`,
              height:       `${scaledH}px`,
              borderRadius: '20px',
              overflow:     'hidden',
              background:   '#07080F',
            }}>
              <iframe
                key={iframeKey}
                src={window.location.href}
                style={{
                  width:        `${device.w}px`,
                  height:       `${device.h}px`,
                  border:       'none',
                  display:      'block',
                  transformOrigin: 'top left',
                  transform:    scale < 1 ? `scale(${scale})` : 'none',
                }}
                title="Mobile Preview"
                allow="autoplay; fullscreen"
              />
            </div>
          </div>

          {/* Bottom hint */}
          <p style={{
            color:      '#6B6875',
            fontSize:   '11px',
            letterSpacing: '0.05em',
          }}>
            Press <kbd style={{ padding: '1px 5px', background: 'rgba(255,255,255,0.08)', borderRadius: '4px', fontSize: '10px' }}>Esc</kbd> or click outside to exit
          </p>
        </div>

        {/* Exit button fixed — always visible */}
        <button
          id="mobile-view-toggle"
          onClick={() => setIsOpen(false)}
          style={{
            position:    'fixed',
            bottom:      '24px',
            right:       '24px',
            zIndex:      10000,
            display:     'flex',
            alignItems:  'center',
            gap:         '8px',
            padding:     '10px 16px',
            borderRadius: '999px',
            border:      '1px solid rgba(232,184,75,0.5)',
            background:  'linear-gradient(135deg, #E8B84B, #c49a30)',
            color:       '#07080F',
            fontSize:    '13px',
            fontWeight:  '600',
            cursor:      'pointer',
            boxShadow:   '0 0 24px rgba(232,184,75,0.35)',
            transition:  'all 0.3s ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
        >
          <MonitorIcon size={15} />
          Exit Mobile
        </button>
      </>
    );
  }

  // ── Trigger button ────────────────────────────────────────────────────────
  return (
    <button
      id="mobile-view-toggle"
      onClick={() => setIsOpen(true)}
      title="Preview the site in a real mobile viewport"
      style={{
        position:       'fixed',
        bottom:         '24px',
        right:          '24px',
        zIndex:         9997,
        display:        'flex',
        alignItems:     'center',
        gap:            '8px',
        padding:        '10px 16px',
        borderRadius:   '999px',
        border:         '1px solid rgba(255,255,255,0.15)',
        background:     'rgba(15,17,32,0.90)',
        color:          '#F0EDE8',
        fontSize:       '13px',
        fontWeight:     '600',
        cursor:         'pointer',
        backdropFilter: 'blur(12px)',
        boxShadow:      '0 0 0 1px rgba(255,255,255,0.05), 0 8px 24px rgba(0,0,0,0.4)',
        transition:     'all 0.3s ease',
        userSelect:     'none',
        letterSpacing:  '0.01em',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.05)'; e.currentTarget.style.borderColor = 'rgba(232,184,75,0.4)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; e.currentTarget.style.borderColor = 'rgba(255,255,255,0.15)'; }}
    >
      <PhoneIcon size={15} />
      Mobile View
    </button>
  );
};

export default MobileViewToggle;
