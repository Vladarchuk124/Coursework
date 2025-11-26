import { apiRequest } from '../../../composables/api-client';

export const actions = {
	getPopularMovies: async (locale = 'uk') => {
		return apiRequest(`/movies/popular?locale=${locale}`);
	}
};
