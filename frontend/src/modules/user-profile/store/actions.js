import { apiRequest } from '../../../composables/api-client';

export const actions = {
	getUserLists: async (user_id) => {
		return apiRequest(`/lists/user-lists/${user_id}`, {
			method: 'POST'
		});
	},
	createUserList: async ({ user_id, list_title }) => {
		let title;
		switch (list_title) {
			case 'Favorites':
			case 'Обране':
				title = 'Favorites';
				break;
			case 'Watched':
			case 'Переглянуто':
				title = 'Watched';
				break;
			case 'Watchlist':
			case 'Хочу подивитися':
				title = 'Watchlist';
				break;
			default:
				title = list_title;
		}
		return apiRequest('/lists/create', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ user_id, title })
		});
	},
	deleteUserList: async (list_id) => {
		return apiRequest(`/lists/delete-list`, {
			method: 'DELETE',
			body: JSON.stringify({ list_id })
		});
	}
};
