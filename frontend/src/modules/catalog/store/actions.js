import { apiRequest } from '../../../composables/api-client';

const buildQueryString = (locale, page, filters = {}) => {
	const params = new URLSearchParams({ locale, page });

	if (filters.sortBy) {
		params.append('sort_by', filters.sortBy);
	}
	if (filters.genres) {
		params.append('with_genres', filters.genres);
	}
	if (filters.yearGte) {
		params.append('year_gte', filters.yearGte);
	}
	if (filters.yearLte) {
		params.append('year_lte', filters.yearLte);
	}
	if (filters.ratingGte) {
		params.append('vote_average_gte', filters.ratingGte);
	}
	if (filters.ratingLte) {
		params.append('vote_average_lte', filters.ratingLte);
	}

	return params.toString();
};

export const actions = {
	getMovies: async (locale = 'uk', page = 1, filters = {}) => {
		const query = buildQueryString(locale, page, filters);
		return apiRequest(`/catalog/movies?${query}`);
	},

	getShows: async (locale = 'uk', page = 1, filters = {}) => {
		const query = buildQueryString(locale, page, filters);
		return apiRequest(`/catalog/shows?${query}`);
	},

	getCartoons: async (locale = 'uk', page = 1, filters = {}) => {
		const query = buildQueryString(locale, page, filters);
		return apiRequest(`/catalog/cartoons?${query}`);
	},

	getTopRated: async (locale = 'uk', page = 1, filters = {}) => {
		const query = buildQueryString(locale, page, filters);
		return apiRequest(`/catalog/top?${query}`);
	},

	getMovieGenres: async (locale = 'uk') => {
		return apiRequest(`/catalog/genres/movie?locale=${locale}`);
	},

	getTvGenres: async (locale = 'uk') => {
		return apiRequest(`/catalog/genres/tv?locale=${locale}`);
	}
};
