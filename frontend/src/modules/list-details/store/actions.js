import { apiRequest } from '../../../composables/api-client';

export const actions = {
	getList: async (list_id) => {
		return apiRequest(`${API_BASE_URL}/lists/${list_id}`);
	},
	removeItemFromList: async (id) => {
		return apiRequest(`/lists/remove-from-list?id=${id}`, {
			method: 'DELETE'
		});
	}
};
