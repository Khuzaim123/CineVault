import { useState, useEffect } from 'react';
import { getTVTrending } from '../lib/tmdb';
import MovieCard from '../components/MovieCard';
import SkeletonCard from '../components/SkeletonCard';
import Footer from '../components/Footer';

const TV = () => {
  const [shows, setShows] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchShows = async () => {
      try {
        const response = await getTVTrending();
        const data = await response.json();
        if (data.results) {
          setShows(data.results);
        }
      } catch (error) {
        console.error('Failed to fetch TV shows:', error);
      } finally {
        setIsLoading(false);
      }
    };
    fetchShows();
    window.scrollTo(0, 0);
  }, []);

  return (
    <div className="min-h-screen bg-background pt-24 pb-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <h1 className="font-display text-4xl font-bold text-text-primary mb-8">
          TV Shows
        </h1>

        {isLoading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {Array.from({ length: 18 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-4">
            {shows.map((show) => (
              <MovieCard key={show.id} movie={show} />
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
};

export default TV;
