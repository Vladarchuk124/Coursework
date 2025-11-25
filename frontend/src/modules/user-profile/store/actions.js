import { apiRequest } from '../../../composables/api-client';

export const actions = {
	getUserLists: async (user_id) => {
		return apiRequest(`/lists/user-lists/${user_id}`);
	},
	createUserList: async ({ user_id, title }) => {
		return apiRequest('/lists/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ user_id, title })
		});
	}
};
