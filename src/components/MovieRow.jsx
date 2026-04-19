import { useState, useRef, useEffect } from 'react';
import { ChevronIcon } from './CustomIcons';
import MovieCard from './MovieCard';
import SkeletonCard from './SkeletonCard';

const MovieRow = ({ title, fetchFunction, seeAllLink, icon }) => {
  const [movies, setMovies] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const scrollRef = useRef(null);

  useEffect(() => {
    const fetchMovies = async () => {
      try {
        const response = await fetchFunction();
        const data = await response.json();
        if (data.results) {
          setMovies(data.results.slice(0, 10));
        }
      } catch (error) {
        console.error('Failed to fetch movies:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchMovies();
  }, [fetchFunction]);

  const scroll = (direction) => {
    if (scrollRef.current) {
      const scrollAmount = direction === 'left' ? -400 : 400;
      scrollRef.current.scrollBy({ left: scrollAmount, behavior: 'smooth' });
    }
  };

  return (
    <section className="py-8">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Section Header */}
        <div className="flex items-center justify-between mb-6">
          <h2 className="font-display text-2xl font-bold text-text-primary flex items-center gap-2.5">
            {icon && <span className="text-gold flex-shrink-0">{icon}</span>}
            {title}
          </h2>
          {seeAllLink && (
            <a
              href={seeAllLink}
              className="text-text-muted hover:text-gold text-sm font-medium transition-colors duration-300"
            >
              See All →
            </a>
          )}
        </div>

        {/* Scrollable Row */}
        <div className="relative group">
          {/* Left Scroll Button */}
          <button
            onClick={() => scroll('left')}
            className="hidden md:flex absolute left-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full items-center justify-center text-text-primary hover:text-gold hover:bg-gold/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
          >
            <ChevronIcon direction="left" size={24} />
          </button>

          {/* Movies Container */}
          <div
            ref={scrollRef}
            className="flex gap-3 overflow-x-auto pb-4 movie-row-scroll"
            style={{
              WebkitOverflowScrolling: 'touch',
              scrollbarWidth: 'thin',
              scrollbarColor: '#E8B84B #0F1120',
            }}
          >
            {isLoading
              ? Array.from({ length: 6 }).map((_, i) => (
                  <SkeletonCard key={i} />
                ))
              : movies.map((movie) => <MovieCard key={movie.id} movie={movie} />)}
          </div>

          {/* Right Scroll Button */}
          <button
            onClick={() => scroll('right')}
            className="hidden md:flex absolute right-0 top-1/2 -translate-y-1/2 z-10 w-12 h-12 bg-background/80 backdrop-blur-sm rounded-full items-center justify-center text-text-primary hover:text-gold hover:bg-gold/20 transition-all duration-300 opacity-0 group-hover:opacity-100"
            style={{ boxShadow: '0 0 20px rgba(0,0,0,0.5)' }}
          >
            <ChevronIcon direction="right" size={24} />
          </button>
        </div>
      </div>
    </section>
  );
};

export default MovieRow;
