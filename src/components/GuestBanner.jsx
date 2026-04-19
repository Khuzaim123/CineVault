import { useState } from 'react';
import { Link } from 'react-router-dom';
import { CloseIcon } from './CustomIcons';

const GuestBanner = () => {
  const [dismissed, setDismissed] = useState(() => sessionStorage.getItem('guest_banner_dismissed') === '1');

  if (dismissed) return null;

  const dismiss = () => {
    sessionStorage.setItem('guest_banner_dismissed', '1');
    setDismissed(true);
  };

  return (
    <div
      className="w-full flex items-center justify-between gap-4 px-4 sm:px-6 py-2.5 text-sm"
      style={{
        background: 'linear-gradient(90deg, rgba(232,184,75,0.12) 0%, rgba(232,184,75,0.06) 100%)',
        borderBottom: '1px solid rgba(232,184,75,0.2)',
        zIndex: 49,
      }}
    >
      <p className="text-text-muted flex-1 min-w-0">
        <span className="text-gold font-medium">Guest mode</span>
        {' '}— Sign up free to watch movies, save favorites, and more.
      </p>
      <div className="flex items-center gap-3 flex-shrink-0">
        <Link
          to="/signup"
          className="px-4 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all hover:scale-[1.03]"
          style={{ background: 'linear-gradient(135deg, #E8B84B, #c49a30)', color: '#07080F' }}
        >
          Sign Up
        </Link>
        <button
          onClick={dismiss}
          className="text-text-muted hover:text-text-primary transition-colors"
          aria-label="Dismiss banner"
        >
          <CloseIcon size={16} color="currentColor" />
        </button>
      </div>
    </div>
  );
};

export default GuestBanner;
