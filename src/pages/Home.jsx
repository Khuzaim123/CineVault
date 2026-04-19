import { useState } from 'react';
import HeroSection from '../components/HeroSection';
import GenreFilter from '../components/GenreFilter';
import MovieRow from '../components/MovieRow';
import Footer from '../components/Footer';
import {
  FireIcon,
  TrophyIcon,
  SparkleIcon,
  TVIcon,
  FilmIcon,
  RocketIcon,
  ZapIcon,
  SmileIcon,
} from '../components/CustomIcons';
import {
  getTrending,
  getTopRated,
  getNowPlaying,
  getTVTrending,
  getByGenre,
} from '../lib/tmdb';

const GENRE_LABELS = {
  18:    { label: 'Drama',     Icon: FilmIcon    },
  28:    { label: 'Action',    Icon: ZapIcon     },
  35:    { label: 'Comedy',    Icon: SmileIcon   },
  27:    { label: 'Horror',    Icon: FilmIcon    },
  878:   { label: 'Sci-Fi',    Icon: RocketIcon  },
  53:    { label: 'Thriller',  Icon: FilmIcon    },
  16:    { label: 'Animation', Icon: SparkleIcon },
  10749: { label: 'Romance',   Icon: FilmIcon    },
};

const Home = () => {
  const [selectedGenre, setSelectedGenre] = useState('all');

  const genreInfo = GENRE_LABELS[selectedGenre] || { label: 'Movies', Icon: FilmIcon };

  return (
    <div className="min-h-screen bg-background">
      <HeroSection />
      <GenreFilter selectedGenre={selectedGenre} onGenreChange={setSelectedGenre} />

      {/* Trending Now */}
      <MovieRow
        title="Trending Now"
        icon={<FireIcon size={22} color="#E8B84B" />}
        fetchFunction={getTrending}
        seeAllLink="/search?trending=true"
      />

      {/* Top Rated */}
      <MovieRow
        title="Top Rated"
        icon={<TrophyIcon size={22} color="#E8B84B" />}
        fetchFunction={getTopRated}
        seeAllLink="/search?top_rated=true"
      />

      {/* New Releases */}
      <MovieRow
        title="New Releases"
        icon={<SparkleIcon size={22} color="#E8B84B" />}
        fetchFunction={getNowPlaying}
        seeAllLink="/search?now_playing=true"
      />

      {/* Popular TV Shows */}
      <MovieRow
        title="Popular TV Shows"
        icon={<TVIcon size={22} color="#E8B84B" />}
        fetchFunction={getTVTrending}
        seeAllLink="/tv"
      />

      {/* Genre-based row based on selection */}
      {selectedGenre !== 'all' && (
        <MovieRow
          title={genreInfo.label}
          icon={<genreInfo.Icon size={22} color="#E8B84B" />}
          fetchFunction={() => getByGenre(selectedGenre)}
        />
      )}

      {/* Drama */}
      <MovieRow
        title="Drama"
        icon={<FilmIcon size={22} color="#E8B84B" />}
        fetchFunction={() => getByGenre(18)}
      />

      {/* Sci-Fi */}
      <MovieRow
        title="Sci-Fi"
        icon={<RocketIcon size={22} color="#E8B84B" />}
        fetchFunction={() => getByGenre(878)}
      />

      {/* Action */}
      <MovieRow
        title="Action"
        icon={<ZapIcon size={22} color="#E8B84B" />}
        fetchFunction={() => getByGenre(28)}
      />

      {/* Comedy */}
      <MovieRow
        title="Comedy"
        icon={<SmileIcon size={22} color="#E8B84B" />}
        fetchFunction={() => getByGenre(35)}
      />

      <Footer />
    </div>
  );
};

export default Home;
