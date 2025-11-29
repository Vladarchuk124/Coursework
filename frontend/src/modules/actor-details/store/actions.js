import { apiRequest } from '../../../composables/api-client';

export const actions = {
	getActorById: async (id, locale) => {
		return apiRequest(`/actors/${id}?locale=${locale}`);
	},
	getActorCredits: async (id, locale) => {
		return apiRequest(`/actors/${id}/credits?locale=${locale}`);
	}
};
