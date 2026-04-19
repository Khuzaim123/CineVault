const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_KEY;

export const getTrending = () => fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}`);
export const getPopular = () => fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}`);
export const getTopRated = () => fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}`);
export const getByGenre = (genreId) => fetch(`${BASE_URL}/discover/movie?with_genres=${genreId}&api_key=${API_KEY}`);
export const getMovieDetail = (id) => fetch(`${BASE_URL}/movie/${id}?append_to_response=videos,credits&api_key=${API_KEY}`);
export const searchMovies = (query) => fetch(`${BASE_URL}/search/movie?query=${query}&api_key=${API_KEY}`);
export const getTVTrending = () => fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}`);
export const getNowPlaying = () => fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}`);
export const getSimilar = (id) => fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`);
export const getGenres = () => fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);

export const IMAGE_BASE = 'https://image.tmdb.org/t/p/';
export const getImageUrl = (path, size = 'w500') => `${IMAGE_BASE}${size}${path}`;
