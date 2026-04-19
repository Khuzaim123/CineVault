const BASE_URL = 'https://api.themoviedb.org/3';
const API_KEY = import.meta.env.VITE_TMDB_KEY;

export const getTrending    = (page = 1) => fetch(`${BASE_URL}/trending/movie/week?api_key=${API_KEY}&page=${page}`);
export const getPopular     = (page = 1) => fetch(`${BASE_URL}/movie/popular?api_key=${API_KEY}&page=${page}`);
export const getTopRated    = (page = 1) => fetch(`${BASE_URL}/movie/top_rated?api_key=${API_KEY}&page=${page}`);
export const getByGenre     = (genreId, page = 1) => fetch(`${BASE_URL}/discover/movie?with_genres=${genreId}&api_key=${API_KEY}&page=${page}`);
export const getMovieDetail = (id) => fetch(`${BASE_URL}/movie/${id}?append_to_response=videos,credits&api_key=${API_KEY}`);
export const searchMovies   = (query, page = 1) => fetch(`${BASE_URL}/search/movie?query=${query}&api_key=${API_KEY}&page=${page}`);
export const getTVTrending  = (page = 1) => fetch(`${BASE_URL}/trending/tv/week?api_key=${API_KEY}&page=${page}`);
export const getTVPopular   = (page = 1) => fetch(`${BASE_URL}/tv/popular?api_key=${API_KEY}&page=${page}`);
export const getTVTopRated  = (page = 1) => fetch(`${BASE_URL}/tv/top_rated?api_key=${API_KEY}&page=${page}`);
export const getNowPlaying  = (page = 1) => fetch(`${BASE_URL}/movie/now_playing?api_key=${API_KEY}&page=${page}`);
export const getSimilar     = (id) => fetch(`${BASE_URL}/movie/${id}/similar?api_key=${API_KEY}`);
export const getGenres      = () => fetch(`${BASE_URL}/genre/movie/list?api_key=${API_KEY}`);

export const IMAGE_BASE  = 'https://image.tmdb.org/t/p/';
export const getImageUrl = (path, size = 'w500') => `${IMAGE_BASE}${size}${path}`;
