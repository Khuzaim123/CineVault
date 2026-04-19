/**
 * Pagination.jsx
 * Reusable, premium pagination component.
 * Used by both the main movie/TV pages and the adult section.
 *
 * Props:
 *   currentPage  {number}   1-indexed current page
 *   totalPages   {number}   Total number of pages
 *   onPageChange {function} (newPage: number) => void
 *   accentColor  {string}   CSS color for active state (default gold for main, red for adult)
 *   className    {string}   Extra wrapper classes
 */

// ── SVG Icons ─────────────────────────────────────────────────────────────────
const ChevronLeftIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M15 18L9 12L15 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const ChevronRightIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M9 18L15 12L9 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoubleChevronLeftIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M11 18L5 12L11 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M18 18L12 12L18 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

const DoubleChevronRightIcon = ({ size = 18 }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none">
    <path d="M13 18L19 12L13 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    <path d="M6 18L12 12L6 6" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
  </svg>
);

// ── Helper ─────────────────────────────────────────────────────────────────────
/**
 * Generate page numbers to display around currentPage.
 * e.g. [1, '...', 4, 5, 6, '...', 20]
 */
const getPageNumbers = (current, total) => {
  if (total <= 7) return Array.from({ length: total }, (_, i) => i + 1);

  const pages = new Set();
  // Always include first, last, current ± 2
  pages.add(1);
  pages.add(total);
  for (let i = Math.max(1, current - 2); i <= Math.min(total, current + 2); i++) {
    pages.add(i);
  }

  // Convert to sorted array, inserting '...' where gaps exist
  const sorted = Array.from(pages).sort((a, b) => a - b);
  const result = [];
  for (let i = 0; i < sorted.length; i++) {
    if (i > 0 && sorted[i] - sorted[i - 1] > 1) result.push('...');
    result.push(sorted[i]);
  }
  return result;
};

// ── Component ─────────────────────────────────────────────────────────────────
const Pagination = ({
  currentPage  = 1,
  totalPages   = 1,
  onPageChange,
  accentColor  = '#E8B84B', // gold default; pass '#dc2626' for adult
  className    = '',
}) => {
  if (totalPages <= 1) return null;

  const goTo = (page) => {
    if (page < 1 || page > totalPages || page === currentPage) return;
    onPageChange?.(page);
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const pages = getPageNumbers(currentPage, totalPages);

  const btnBase = {
    display:        'flex',
    alignItems:     'center',
    justifyContent: 'center',
    borderRadius:   '50%',
    width:          '38px',
    height:         '38px',
    fontSize:       '14px',
    fontWeight:     600,
    cursor:         'pointer',
    transition:     'all 0.2s ease',
    border:         '1px solid rgba(255,255,255,0.08)',
    background:     'rgba(255,255,255,0.04)',
    color:          '#6B6875',
  };

  const btnActive = {
    ...btnBase,
    background: accentColor,
    border:     `1px solid ${accentColor}`,
    color:      '#07080F',
    boxShadow:  `0 0 16px ${accentColor}50`,
  };

  const btnNav = (disabled) => ({
    ...btnBase,
    opacity:   disabled ? 0.3 : 1,
    cursor:    disabled ? 'not-allowed' : 'pointer',
  });

  return (
    <nav
      aria-label="Pagination"
      className={`flex items-center justify-center gap-2 flex-wrap ${className}`}
    >
      {/* First page */}
      <button
        onClick={() => goTo(1)}
        disabled={currentPage === 1}
        style={btnNav(currentPage === 1)}
        title="First page"
        onMouseEnter={(e) => { if (currentPage !== 1) { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; } }}
        onMouseLeave={(e) => { if (currentPage !== 1) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#6B6875'; } }}
      >
        <DoubleChevronLeftIcon size={16} />
      </button>

      {/* Prev */}
      <button
        onClick={() => goTo(currentPage - 1)}
        disabled={currentPage === 1}
        style={btnNav(currentPage === 1)}
        title="Previous page"
        onMouseEnter={(e) => { if (currentPage !== 1) { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; } }}
        onMouseLeave={(e) => { if (currentPage !== 1) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#6B6875'; } }}
      >
        <ChevronLeftIcon size={16} />
      </button>

      {/* Page numbers */}
      {pages.map((pg, idx) =>
        pg === '...' ? (
          <span key={`ellipsis-${idx}`} style={{ color: '#6B6875', fontSize: '14px', width: '38px', textAlign: 'center' }}>
            …
          </span>
        ) : (
          <button
            key={pg}
            onClick={() => goTo(pg)}
            style={pg === currentPage ? btnActive : btnBase}
            aria-current={pg === currentPage ? 'page' : undefined}
            onMouseEnter={(e) => {
              if (pg !== currentPage) {
                e.currentTarget.style.borderColor = accentColor;
                e.currentTarget.style.color = accentColor;
              }
            }}
            onMouseLeave={(e) => {
              if (pg !== currentPage) {
                e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)';
                e.currentTarget.style.color = '#6B6875';
              }
            }}
          >
            {pg}
          </button>
        )
      )}

      {/* Next */}
      <button
        onClick={() => goTo(currentPage + 1)}
        disabled={currentPage === totalPages}
        style={btnNav(currentPage === totalPages)}
        title="Next page"
        onMouseEnter={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; } }}
        onMouseLeave={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#6B6875'; } }}
      >
        <ChevronRightIcon size={16} />
      </button>

      {/* Last page */}
      <button
        onClick={() => goTo(totalPages)}
        disabled={currentPage === totalPages}
        style={btnNav(currentPage === totalPages)}
        title="Last page"
        onMouseEnter={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = accentColor; e.currentTarget.style.color = accentColor; } }}
        onMouseLeave={(e) => { if (currentPage !== totalPages) { e.currentTarget.style.borderColor = 'rgba(255,255,255,0.08)'; e.currentTarget.style.color = '#6B6875'; } }}
      >
        <DoubleChevronRightIcon size={16} />
      </button>
    </nav>
  );
};

export default Pagination;
