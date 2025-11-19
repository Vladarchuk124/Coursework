import axios from 'axios';
import '../config/env.js';

const tmdbApi = axios.create({
	baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
	params: {
		api_key: process.env.TMDB_API_KEY
	}
});

export const tmdb = {
	getPopularMovies: async (page = 1, language = 'en-US') => {
		const res = await tmdbApi.get('/movie/popular', { params: { page, language } });
		return res.data;
	},
	getMovieById: async (id, language = 'en-US') => {
		const res = await tmdbApi.get(`/movie/${id}`, { params: { language } });
		return res.data;
	},
	searchContent: async (query, language = 'en-US') => {
		if (!query || query.trim().length === 0) {
			return [];
		}

		const [movieRes, tvRes] = await Promise.all([
			tmdbApi.get('/search/movie', { params: { query, language } }),
			tmdbApi.get('/search/tv', { params: { query, language } })
		]);

		const movies = movieRes.data.results?.slice(0, 5) || [];
		const tvs = tvRes.data.results?.slice(0, 5) || [];
		const combined = [...movies, ...tvs].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 10);

		return combined;
	}
};
