import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { supabase } from '../lib/supabase';
import { getImageUrl } from '../lib/tmdb';
import { HeartIcon, PlusIcon, CloseIcon } from '../components/CustomIcons';

const Watchlist = () => {
  const { user, loading } = useAuth();
  const navigate = useNavigate();
  const [watchlist, setWatchlist] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');

  useEffect(() => {
    if (loading) return;
    if (!user) { navigate('/login'); return; }
    fetchWatchlist();
  }, [user, loading]);

  const fetchWatchlist = async () => {
    setIsLoading(true);
    const { data } = await supabase
      .from('watchlist')
      .select('*')
      .eq('user_id', user.id)
      .order('added_at', { ascending: false });
    setWatchlist(data || []);
    setIsLoading(false);
  };

  const removeItem = async (tmdbMovieId) => {
    await supabase.from('watchlist').delete().eq('user_id', user.id).eq('tmdb_movie_id', tmdbMovieId);
    setWatchlist(prev => prev.filter(w => w.tmdb_movie_id !== tmdbMovieId));
  };

  const filteredList = watchlist.filter(item => {
    if (filter === 'all') return true;
    return filter === 'movies' ? item.media_type === 'movie' : item.media_type === 'tv';
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background pt-24 flex items-center justify-center">
        <div className="w-12 h-12 rounded-full border-2 border-gold border-t-transparent animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
          <div>
            <h1 className="font-display text-4xl font-bold text-text-primary mb-1">My Watchlist</h1>
            <p className="text-text-muted">{watchlist.length} {watchlist.length === 1 ? 'title' : 'titles'} saved</p>
          </div>
          <div className="flex gap-2">
            {['all', 'movies', 'tv'].map(f => (
              <button
                key={f}
                onClick={() => setFilter(f)}
                className={`px-5 py-2 rounded-full text-sm font-medium transition-all duration-300 ${filter === f ? 'bg-gold text-background' : 'bg-white/5 text-text-muted hover:text-text-primary'}`}
              >
                {f === 'all' ? 'All' : f === 'movies' ? 'Movies' : 'TV Shows'}
              </button>
            ))}
          </div>
        </div>

        {watchlist.length === 0 ? (
          <div className="text-center py-24">
            <div className="inline-flex items-center justify-center w-20 h-20 rounded-full bg-white/5 mb-6">
              <HeartIcon size={40} color="#6B6875" />
            </div>
            <h2 className="font-display text-2xl font-semibold text-text-primary mb-3">Your watchlist is empty</h2>
            <p className="text-text-muted mb-8 max-w-md mx-auto">Add movies and TV shows to keep track of what you want to watch.</p>
            <Link to="/" className="inline-flex items-center gap-2 px-8 py-4 rounded-full font-semibold text-sm" style={{ background: 'linear-gradient(135deg, #E8B84B, #c49a30)', color: '#07080F' }}>
              <PlusIcon size={18} color="#07080F" />
              Browse Movies
            </Link>
          </div>
        ) : filteredList.length === 0 ? (
          <div className="text-center py-24">
            <p className="text-text-muted text-lg">No {filter === 'movies' ? 'movies' : 'TV shows'} in your watchlist.</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5 xl:grid-cols-6 gap-4">
            {filteredList.map((item) => (
              <div key={item.id} className="relative group">
                <Link to={`/movie/${item.tmdb_movie_id}`}>
                  <div className="relative aspect-[2/3] rounded-lg overflow-hidden" style={{ minWidth: '130px' }}>
                    {item.poster_path ? (
                      <img
                        src={getImageUrl(item.poster_path, 'w300')}
                        alt={item.movie_title}
                        className="w-full h-full object-cover transition-transform duration-300 group-hover:scale-105"
                        onError={(e) => { e.target.style.display = 'none'; e.target.nextSibling.style.display = 'flex'; }}
                      />
                    ) : null}
                    <div className="w-full h-full hidden items-center justify-center bg-surface p-2 text-center">
                      <span className="text-text-muted text-xs">{item.movie_title}</span>
                    </div>
                    <div className="absolute inset-0 bg-gradient-to-t from-background/90 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  </div>
                </Link>
                <p className="text-text-primary text-xs font-medium mt-2 line-clamp-1">{item.movie_title}</p>
                <button
                  onClick={() => removeItem(item.tmdb_movie_id)}
                  className="absolute top-2 right-2 w-7 h-7 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  style={{ background: 'rgba(15,17,32,0.85)' }}
                  title="Remove"
                >
                  <CloseIcon size={12} color="#E8B84B" />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Watchlist;
