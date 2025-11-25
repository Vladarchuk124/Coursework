import { apiRequest } from '../../../composables/api-client.js';

export const actions = {
	login: async (data) => {
		return apiRequest('/auth/login', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	},

	register: async (data) => {
		return apiRequest('/auth/register', {
			method: 'POST',
			body: JSON.stringify(data),
			headers: {
				'Content-Type': 'application/json'
			}
		});
	}
};
