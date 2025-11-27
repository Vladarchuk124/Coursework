import { apiRequest } from '../../../composables/api-client.js';

export const actions = {
	getUser: async (user_id) => {
		return apiRequest(`/users/${user_id}`);
	}
};
