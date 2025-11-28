import { apiRequest } from '../../../composables/api-client';

export const actions = {
	getPopularMovies: async (locale = 'uk') => {
		return apiRequest(`/movies/popular?locale=${locale}`);
	},

	getTrending: async (locale = 'uk', time = 'week') => {
		return apiRequest(`/home/trending?locale=${locale}&time=${time}`);
	},

	getNowPlaying: async (locale = 'uk') => {
		return apiRequest(`/home/now-playing?locale=${locale}`);
	},

	getUpcoming: async (locale = 'uk') => {
		return apiRequest(`/home/upcoming?locale=${locale}`);
	},

	getTopRated: async (locale = 'uk') => {
		return apiRequest(`/home/top-rated?locale=${locale}`);
	},

	getOnTheAir: async (locale = 'uk') => {
		return apiRequest(`/home/on-the-air?locale=${locale}`);
	},

	getPopularShows: async (locale = 'uk') => {
		return apiRequest(`/home/popular-shows?locale=${locale}`);
	}
};
