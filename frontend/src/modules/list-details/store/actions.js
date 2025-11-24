const API_BASE_URL = 'http://localhost:3000/api';

export const actions = {
	getList: async (list_id) => {
		const response = await fetch(`${API_BASE_URL}/lists/${list_id}`);
		return response.json();
	},
	removeItemFromList: async (id) => {
		await fetch(`${API_BASE_URL}/lists/remove-from-list?id=${id}`, {
			method: 'DELETE'
		});
	}
};
