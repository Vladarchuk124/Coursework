import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const tmdbApi = axios.create({
	baseURL: process.env.TMDB_BASE_URL || 'https://api.themoviedb.org/3',
	params: {
		api_key: process.env.TMDB_API_KEY,
	},
});

export const tmdb = {
	getPopularMovies: async (page = 1, language = 'en-US') => {
		const response = await tmdbApi.get('/movie/popular', { params: { page, language } });
		return response.data;
	},
	getMovieById: async (id, language = 'en-US') => {
		const response = await tmdbApi.get(`/movie/${id}`, { params: { language } });
		return response.data;
	},
};
