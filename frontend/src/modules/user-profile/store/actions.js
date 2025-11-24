const API_BASE_URL = 'http://localhost:3000/api';

export const actions = {
	getUserLists: async (user_id) => {
		const response = await fetch(`${API_BASE_URL}/lists/user-lists/${user_id}`);
		return response.json();
	},
	createUserList: async ({ user_id, title }) => {
		const response = await fetch(`${API_BASE_URL}/lists/create`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ user_id, title })
		});
		return response.json();
	}
};
