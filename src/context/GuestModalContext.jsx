import { createContext, useContext, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';

const GuestModalContext = createContext(null);

// Modal types
export const MODAL_TYPE = {
  WATCH: 'watch',
  SAVE: 'save',
};

export const GuestModalProvider = ({ children }) => {
  const [modal, setModal] = useState(null); // { type: MODAL_TYPE }
  const navigate = useNavigate();

  const showWatchModal = useCallback(() => setModal({ type: MODAL_TYPE.WATCH }), []);
  const showSaveModal = useCallback(() => setModal({ type: MODAL_TYPE.SAVE }), []);
  const closeModal = useCallback(() => setModal(null), []);

  const goSignUp = () => { closeModal(); navigate('/signup'); };
  const goSignIn = () => { closeModal(); navigate('/login'); };

  return (
    <GuestModalContext.Provider value={{ showWatchModal, showSaveModal, closeModal }}>
      {children}

      {/* Guest Restriction Modal */}
      {modal && (
        <div
          className="fixed inset-0 z-[200] flex items-center justify-center p-4"
          style={{ animation: 'fadeIn 0.25s ease' }}
        >
          {/* Backdrop */}
          <div
            className="absolute inset-0 bg-black/80 backdrop-blur-sm"
            onClick={closeModal}
          />

          {/* Modal Card */}
          <div
            className="relative z-10 max-w-sm w-full rounded-2xl p-8 text-center"
            style={{
              background: 'linear-gradient(135deg, #0F1120 0%, #1a1730 100%)',
              border: '1px solid rgba(232,184,75,0.25)',
              boxShadow: '0 0 60px rgba(232,184,75,0.12)',
            }}
          >
            {/* Icon */}
            <div
              className="w-16 h-16 rounded-full mx-auto mb-5 flex items-center justify-center text-2xl"
              style={{ background: 'rgba(232,184,75,0.12)', border: '1px solid rgba(232,184,75,0.3)' }}
            >
              {modal.type === MODAL_TYPE.WATCH ? '🎬' : '🔖'}
            </div>

            <h2 className="font-display text-2xl font-bold text-text-primary mb-2">
              {modal.type === MODAL_TYPE.WATCH ? 'Want to watch this?' : 'Save to your list?'}
            </h2>
            <p className="text-text-muted text-sm mb-7 leading-relaxed">
              {modal.type === MODAL_TYPE.WATCH
                ? 'Create a free account or sign in to start watching.'
                : 'Sign in to save your favorites and build your watchlist.'}
            </p>

            <div className="flex flex-col gap-3 mb-4">
              <button
                onClick={goSignUp}
                className="w-full py-3 rounded-full font-semibold text-sm"
                style={{
                  background: 'linear-gradient(135deg, #E8B84B, #c49a30)',
                  color: '#07080F',
                }}
              >
                Create Account
              </button>
              <button
                onClick={goSignIn}
                className="w-full py-3 rounded-full font-semibold text-sm"
                style={{
                  background: 'rgba(255,255,255,0.08)',
                  color: '#F0EDE8',
                  border: '1px solid rgba(255,255,255,0.15)',
                }}
              >
                Sign In
              </button>
            </div>

            <button
              onClick={closeModal}
              className="text-text-muted text-xs hover:text-text-primary transition-colors"
            >
              Continue as Guest
            </button>
          </div>
        </div>
      )}
    </GuestModalContext.Provider>
  );
};

export const useGuestModal = () => {
  const ctx = useContext(GuestModalContext);
  if (!ctx) throw new Error('useGuestModal must be used within GuestModalProvider');
  return ctx;
};
