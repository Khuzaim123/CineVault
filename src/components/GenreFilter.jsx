import { useState, useEffect } from 'react';
import { getGenres } from '../lib/tmdb';

const genresList = [
  { id: 'all', name: 'All' },
  { id: 28, name: 'Action' },
  { id: 18, name: 'Drama' },
  { id: 35, name: 'Comedy' },
  { id: 27, name: 'Horror' },
  { id: 878, name: 'Sci-Fi' },
  { id: 53, name: 'Thriller' },
  { id: 16, name: 'Animation' },
  { id: 10749, name: 'Romance' },
];

const GenreFilter = ({ selectedGenre, onGenreChange }) => {
  const [genres, setGenres] = useState(genresList);

  useEffect(() => {
    const fetchGenres = async () => {
      try {
        const response = await getGenres();
        const data = await response.json();
        if (data.genres) {
          setGenres([{ id: 'all', name: 'All' }, ...data.genres.slice(0, 8)]);
        }
      } catch (error) {
        console.error('Failed to fetch genres:', error);
      }
    };
    fetchGenres();
  }, []);

  return (
    <div className="sticky top-16 z-30 bg-background/80 backdrop-blur-md py-4 border-b border-white/5">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex gap-3 overflow-x-auto scrollbar-hide">
          {genres.map((genre) => (
            <button
              key={genre.id}
              onClick={() => onGenreChange(genre.id)}
              className={`px-5 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-all duration-300 ${
                selectedGenre === genre.id
                  ? 'bg-gold text-background shadow-[0_0_20px_rgba(232,184,75,0.3)]'
                  : 'bg-white/5 text-text-muted hover:text-text-primary hover:bg-white/10 border border-white/10'
              }`}
            >
              {genre.name}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default GenreFilter;
