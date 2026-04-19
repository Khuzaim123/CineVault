import { CinemaIcon } from './CustomIcons';

const Footer = () => {
  return (
    <footer className="bg-surface border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          {/* Brand */}
          <div className="md:col-span-1">
            <div className="flex items-center gap-3 mb-4">
              <div className="text-gold">
                <CinemaIcon size={32} />
              </div>
              <span className="font-display text-xl font-bold text-text-primary">
                CineVault
              </span>
            </div>
            <p className="text-text-muted text-sm leading-relaxed">
              Your premium cinema lounge. Discover and watch the best movies and TV shows.
            </p>
          </div>

          {/* Browse Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-text-primary mb-4">Browse</h4>
            <ul className="space-y-2">
              <li><a href="/" className="text-text-muted hover:text-gold text-sm transition-colors">Home</a></li>
              <li><a href="/movies" className="text-text-muted hover:text-gold text-sm transition-colors">Movies</a></li>
              <li><a href="/tv" className="text-text-muted hover:text-gold text-sm transition-colors">TV Shows</a></li>
              <li><a href="/watchlist" className="text-text-muted hover:text-gold text-sm transition-colors">Watchlist</a></li>
            </ul>
          </div>

          {/* Company Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-text-primary mb-4">Company</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-muted hover:text-gold text-sm transition-colors">About Us</a></li>
              <li><a href="#" className="text-text-muted hover:text-gold text-sm transition-colors">Careers</a></li>
              <li><a href="#" className="text-text-muted hover:text-gold text-sm transition-colors">Press</a></li>
              <li><a href="#" className="text-text-muted hover:text-gold text-sm transition-colors">Blog</a></li>
            </ul>
          </div>

          {/* Support Links */}
          <div>
            <h4 className="font-display text-lg font-semibold text-text-primary mb-4">Support</h4>
            <ul className="space-y-2">
              <li><a href="#" className="text-text-muted hover:text-gold text-sm transition-colors">Help Center</a></li>
              <li><a href="#" className="text-text-muted hover:text-gold text-sm transition-colors">Terms of Service</a></li>
              <li><a href="#" className="text-text-muted hover:text-gold text-sm transition-colors">Privacy Policy</a></li>
              <li><a href="#" className="text-text-muted hover:text-gold text-sm transition-colors">Contact Us</a></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="mt-12 pt-8 border-t border-white/5 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-text-muted text-sm">
            © {new Date().getFullYear()} CineVault. All rights reserved.
          </p>
          <p className="text-text-muted text-xs">
            Not affiliated with any streaming service. Data provided by TMDB.
          </p>
        </div>
      </div>
    </footer>
  );
};

export default Footer;
