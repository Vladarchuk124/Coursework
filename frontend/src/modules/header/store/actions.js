import { apiRequest } from '../../../composables/api-client';

export const actions = {
	doSearch: async (query, locale = 'uk') => {
		return apiRequest(`/search?query=${query}&locale=${locale}`);
	}
};
