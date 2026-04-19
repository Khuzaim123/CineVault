import { useNavigate } from 'react-router-dom';
import HeroSection from '../components/HeroSection';
import MovieRow from '../components/MovieRow';
import Footer from '../components/Footer';
import {
  FireIcon, TrophyIcon, SparkleIcon, TVIcon,
  FilmIcon, RocketIcon, ZapIcon, SmileIcon, CategoryIcon,
} from '../components/CustomIcons';
import {
  getTrending, getTopRated, getNowPlaying, getTVTrending, getByGenre,
} from '../lib/tmdb';

// ─── Genre categories shown as clickable cards ─────────────────────────────
const GENRES = [
  { id: 28,    name: 'Action',    Icon: ZapIcon,     color: '#E84B4B' },
  { id: 18,    name: 'Drama',     Icon: FilmIcon,    color: '#E8B84B' },
  { id: 35,    name: 'Comedy',    Icon: SmileIcon,   color: '#4BE8A0' },
  { id: 27,    name: 'Horror',    Icon: FilmIcon,    color: '#9B4BE8' },
  { id: 878,   name: 'Sci-Fi',    Icon: RocketIcon,  color: '#4BB8E8' },
  { id: 53,    name: 'Thriller',  Icon: ZapIcon,     color: '#E87B4B' },
  { id: 16,    name: 'Animation', Icon: SparkleIcon, color: '#E84BB8' },
  { id: 10749, name: 'Romance',   Icon: FilmIcon,    color: '#E84B6A' },
  { id: 12,    name: 'Adventure', Icon: RocketIcon,  color: '#4BE8D4' },
  { id: 10402, name: 'Music',     Icon: SparkleIcon, color: '#B84BE8' },
  { id: 9648,  name: 'Mystery',   Icon: FilmIcon,    color: '#6A4BE8' },
  { id: 36,    name: 'History',   Icon: TrophyIcon,  color: '#C9A84B' },
];

// ─── Genre card component ───────────────────────────────────────────────────
const GenreCard = ({ genre }) => {
  const navigate = useNavigate();
  const { Icon, color, name, id } = genre;

  return (
    <button
      onClick={() => navigate(`/genre/${id}`)}
      className="group relative flex flex-col items-center justify-center gap-3 p-6 rounded-2xl transition-all duration-300 hover:scale-105"
      style={{
        background: `linear-gradient(135deg, ${color}18, ${color}08)`,
        border:     `1px solid ${color}30`,
      }}
      onMouseEnter={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}28, ${color}12)`;
        e.currentTarget.style.boxShadow  = `0 0 24px ${color}25`;
      }}
      onMouseLeave={e => {
        e.currentTarget.style.background = `linear-gradient(135deg, ${color}18, ${color}08)`;
        e.currentTarget.style.boxShadow  = 'none';
      }}
    >
      <div
        className="w-12 h-12 rounded-xl flex items-center justify-center transition-transform duration-300 group-hover:scale-110"
        style={{ background: `${color}20`, border: `1px solid ${color}35` }}
      >
        <Icon size={22} color={color} />
      </div>
      <span className="text-text-primary text-sm font-semibold text-center">{name}</span>
    </button>
  );
};

// ─── Main Home page ─────────────────────────────────────────────────────────
const Home = () => (
  <div className="min-h-screen bg-background">
    <HeroSection />

    {/* ── Genre Categories Section ── */}
    <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
      <div className="flex items-center gap-3 mb-6">
        <CategoryIcon size={22} color="#E8B84B" />
        <h2 className="font-display text-2xl font-bold text-text-primary">Browse by Genre</h2>
      </div>
      <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-6 lg:grid-cols-6 gap-3">
        {GENRES.map(g => <GenreCard key={g.id} genre={g} />)}
      </div>
    </section>

    {/* ── Movie rows ── */}
    <MovieRow
      title="Trending Now"
      icon={<FireIcon size={22} color="#E8B84B" />}
      fetchFunction={getTrending}
      seeAllLink="/movies?tab=trending"
    />

    <MovieRow
      title="Top Rated"
      icon={<TrophyIcon size={22} color="#E8B84B" />}
      fetchFunction={getTopRated}
      seeAllLink="/movies?tab=top_rated"
    />

    <MovieRow
      title="New Releases"
      icon={<SparkleIcon size={22} color="#E8B84B" />}
      fetchFunction={getNowPlaying}
      seeAllLink="/movies?tab=now_playing"
    />

    <MovieRow
      title="Popular TV Shows"
      icon={<TVIcon size={22} color="#E8B84B" />}
      fetchFunction={getTVTrending}
      seeAllLink="/tv"
    />

    <MovieRow
      title="Action"
      icon={<ZapIcon size={22} color="#E8B84B" />}
      fetchFunction={() => getByGenre(28)}
      seeAllLink="/genre/28"
    />

    <MovieRow
      title="Drama"
      icon={<FilmIcon size={22} color="#E8B84B" />}
      fetchFunction={() => getByGenre(18)}
      seeAllLink="/genre/18"
    />

    <MovieRow
      title="Sci-Fi"
      icon={<RocketIcon size={22} color="#E8B84B" />}
      fetchFunction={() => getByGenre(878)}
      seeAllLink="/genre/878"
    />

    <MovieRow
      title="Comedy"
      icon={<SmileIcon size={22} color="#E8B84B" />}
      fetchFunction={() => getByGenre(35)}
      seeAllLink="/genre/35"
    />

    <Footer />
  </div>
);

export default Home;
