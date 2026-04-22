import { useState, useEffect, useRef } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import {
  CinemaIcon, SearchIcon, MenuIcon, CloseIcon,
  HomeIcon, TVIcon, HeartIcon, UserIcon,
  BookmarkIcon, LogOutIcon, PeopleGroupIcon, CategoryIcon,
} from './CustomIcons';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import GuestBanner from './GuestBanner';
import logoImg from '../assets/logo.png';

const Navbar = () => {
  const [isScrolled,      setIsScrolled]      = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [dropdownOpen,    setDropdownOpen]    = useState(false);
  const [displayName,     setDisplayName]     = useState('');
  const [navImgError,     setNavImgError]     = useState(false);
  const dropdownRef = useRef(null);

  const location = useLocation();
  const navigate = useNavigate();
  const { user, signOut, avatarUrl } = useAuth();

  useEffect(() => {
    const handleScroll = () => setIsScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Click outside to close dropdown
  useEffect(() => {
    const handler = (e) => {
      if (dropdownRef.current && !dropdownRef.current.contains(e.target)) {
        setDropdownOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  // Fetch display name
  useEffect(() => {
    if (!user) { setDisplayName(''); return; }
    supabase.from('profiles').select('avatar_url, username, full_name').eq('id', user.id).single()
      .then(({ data }) => {
        if (data) {
          setNavImgError(false);
          setDisplayName(data.full_name || data.username || user.email?.split('@')[0] || 'User');
        }
      });
  }, [user]);

  const handleSignOut = async () => {
    setDropdownOpen(false);
    await signOut();
    navigate('/');
  };

  const navLinks = [
    { path: '/',        label: 'Home',       icon: HomeIcon        },
    { path: '/movies',  label: 'Movies',     icon: CinemaIcon      },
    { path: '/tv',      label: 'TV Shows',   icon: TVIcon          },
    { path: '/actors',  label: 'Actors',     icon: PeopleGroupIcon },
  ];

  const isActive = (path) => path === '/'
    ? location.pathname === '/'
    : location.pathname.startsWith(path);

  const initials = (displayName || user?.email || 'U')[0]?.toUpperCase();

  return (
    <>
      <nav
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          isScrolled ? 'backdrop-blur-md bg-black/60 py-3' : 'bg-transparent py-5'
        }`}
      >
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between">
            {/* Logo */}
            <Link to="/" className="flex items-center gap-3 group">
              <div className="group-hover:scale-110 transition-transform duration-300">
                <img src={logoImg} alt="CineVault Logo" className="w-12 h-12 object-contain mix-blend-screen" />
              </div>
              <span className="font-display text-2xl font-bold text-text-primary tracking-wide">CineVault</span>
            </Link>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center gap-8">
              {navLinks.map(({ path, label, icon: Icon }) => (
                <Link
                  key={path}
                  to={path}
                  className={`flex items-center gap-2 text-sm font-medium transition-all duration-300 ${
                    isActive(path) ? 'text-gold' : 'text-text-muted hover:text-text-primary'
                  }`}
                >
                  <Icon size={18} />
                  {label}
                </Link>
              ))}
            </div>

            {/* Right Actions */}
            <div className="flex items-center gap-4">
              <Link to="/search" className="text-text-muted hover:text-gold transition-colors duration-300">
                <SearchIcon size={22} />
              </Link>

              {user ? (
                /* Avatar + Dropdown */
                <div className="relative" ref={dropdownRef}>
                  <button
                    onClick={() => setDropdownOpen(!dropdownOpen)}
                    className="w-9 h-9 rounded-full overflow-hidden transition-all duration-300 hover:scale-105 hover:ring-2 hover:ring-gold"
                    style={{ border: '2px solid rgba(232,184,75,0.4)' }}
                  >
                    {avatarUrl && !navImgError ? (
                      <img
                        src={avatarUrl}
                        alt="avatar"
                        className="w-full h-full object-cover"
                        onError={() => setNavImgError(true)}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-background font-bold text-sm"
                        style={{ background: 'linear-gradient(135deg, #E8B84B, #c49a30)' }}>
                        {initials}
                      </div>
                    )}
                  </button>

                  {/* Dropdown */}
                  {dropdownOpen && (
                    <div
                      className="absolute right-0 top-12 w-52 rounded-xl py-2 z-50"
                      style={{
                        background: 'rgba(15,17,32,0.97)',
                        border: '1px solid rgba(232,184,75,0.2)',
                        boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
                        backdropFilter: 'blur(20px)',
                        animation: 'fadeIn 0.15s ease',
                      }}
                    >
                      <div className="px-4 py-2 border-b border-white/5 mb-1">
                        <p className="text-text-primary text-sm font-medium">{displayName}</p>
                        <p className="text-text-muted text-xs truncate">{user.email}</p>
                      </div>
                      {[
                        { to: '/profile',   label: 'Profile',   Icon: UserIcon     },
                        { to: '/favorites', label: 'Favorites', Icon: HeartIcon    },
                        { to: '/watchlist', label: 'Watchlist', Icon: BookmarkIcon },
                      ].map(({ to, label, Icon }) => (
                        <Link
                          key={to}
                          to={to}
                          onClick={() => setDropdownOpen(false)}
                          className="flex items-center gap-3 px-4 py-2 text-sm text-text-muted hover:text-text-primary hover:bg-white/5 transition-colors"
                        >
                          <Icon size={15} color="currentColor" />
                          {label}
                        </Link>
                      ))}
                      <div className="border-t border-white/5 mt-1 pt-1">
                        <button
                          onClick={handleSignOut}
                          className="w-full flex items-center gap-3 text-left px-4 py-2 text-sm text-red-400 hover:text-red-300 hover:bg-white/5 transition-colors"
                        >
                          <LogOutIcon size={15} color="currentColor" />
                          Sign Out
                        </button>
                      </div>
                    </div>
                  )}
                </div>
              ) : (
                /* Sign In Button */
                <Link
                  to="/login"
                  className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-[1.03]"
                  style={{ background: 'linear-gradient(135deg, #E8B84B, #c49a30)', color: '#07080F' }}
                >
                  Sign In
                </Link>
              )}

              {/* Mobile Menu Button */}
              <button
                className="md:hidden text-text-primary"
                onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              >
                <MenuIcon size={24} isOpen={isMobileMenuOpen} />
              </button>
            </div>
          </div>
        </div>

        {/* Guest Banner */}
        {!user && <GuestBanner />}
      </nav>

      {/* Mobile Menu Overlay */}
      <div
        className={`fixed inset-0 bg-black/95 z-40 md:hidden transition-transform duration-500 ${
          isMobileMenuOpen ? 'translate-x-0' : 'translate-x-full'
        }`}
      >
        <div className="flex flex-col h-full">
          <div className="flex items-center justify-between p-6 border-b border-white/10">
            <Link to="/" className="flex items-center gap-3" onClick={() => setIsMobileMenuOpen(false)}>
              <div>
                <img src={logoImg} alt="CineVault Logo" className="w-12 h-12 object-contain mix-blend-screen" />
              </div>
              <span className="font-display text-xl font-bold text-text-primary">CineVault</span>
            </Link>
            <button className="text-text-muted hover:text-text-primary" onClick={() => setIsMobileMenuOpen(false)}>
              <CloseIcon size={24} />
            </button>
          </div>
          <div className="flex-1 flex flex-col items-center justify-center gap-8">
            {navLinks.map(({ path, label, icon: Icon }) => (
              <Link
                key={path}
                to={path}
                onClick={() => setIsMobileMenuOpen(false)}
                className={`flex items-center gap-4 text-2xl font-display font-medium transition-all duration-300 ${
                  isActive(path) ? 'text-gold' : 'text-text-muted hover:text-text-primary'
                }`}
              >
                <Icon size={28} />
                {label}
              </Link>
            ))}
            {user ? (
              <button
                onClick={() => { setIsMobileMenuOpen(false); handleSignOut(); }}
                className="text-2xl font-display font-medium text-red-400 hover:text-red-300 transition-colors mt-4"
              >
                Sign Out
              </button>
            ) : (
              <Link
                to="/login"
                onClick={() => setIsMobileMenuOpen(false)}
                className="px-8 py-3 rounded-full font-semibold text-lg mt-4"
                style={{ background: 'linear-gradient(135deg, #E8B84B, #c49a30)', color: '#07080F' }}
              >
                Sign In
              </Link>
            )}
          </div>
        </div>
      </div>
    </>
  );
};

export default Navbar;
