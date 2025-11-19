import axios from 'axios';
import '../config/env.js';

const tmdbApi = axios.create({
	baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
	params: {
		api_key: process.env.TMDB_API_KEY
	}
});

const contentFilter = (results) => {
	return results
		.filter((item) => item.poster_path)
		.filter((item) => item.overview)
		.filter((item) => item.vote_count > 100)
		.filter((item) => item.popularity > 2)
		.sort((a, b) => b.popularity - a.popularity);
};

export const tmdb = {
	getPopularMovies: async (page = 1, language = 'en-US') => {
		const res = await tmdbApi.get('/movie/popular', { params: { page, language } });
		const movies = contentFilter(res.data.results);
		return movies;
	},
	getMovieById: async (id, language = 'en-US') => {
		const res = await tmdbApi.get(`/movie/${id}`, { params: { language } });
		return res.data;
	},
	searchContent: async (query, language = 'en-US') => {
		if (!query || query.trim().length === 0) {
			return [];
		}

		let [movieRes, tvRes] = await Promise.all([
			tmdbApi.get('/search/movie', { params: { query, language } }),
			tmdbApi.get('/search/tv', { params: { query, language } })
		]);

		movieRes = contentFilter(movieRes.data.results);
		tvRes = contentFilter(tvRes.data.results);

		const movies = movieRes.slice(0, 5) || [];
		const tvs = tvRes.slice(0, 5) || [];
		const combined = [...movies, ...tvs].sort((a, b) => (b.popularity ?? 0) - (a.popularity ?? 0)).slice(0, 10);

		return combined;
	}
};
