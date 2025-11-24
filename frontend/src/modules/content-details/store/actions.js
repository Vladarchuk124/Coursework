const API_BASE_URL = 'http://localhost:3000/api';
import { contentTypes } from '../../../../enums/content-type';

export const actions = {
	getContentById: async (id, type, locale) => {
		switch (type) {
			case contentTypes.movie:
				const resMovie = await fetch(`${API_BASE_URL}/movies/${id}?locale=${locale}`);
				return resMovie.json();
			case contentTypes.show:
				const resShow = await fetch(`${API_BASE_URL}/shows/${id}?locale=${locale}`);
				return resShow.json();
			default:
				break;
		}
	},
	getUserLists: async (user_id) => {
		const response = await fetch(`${API_BASE_URL}/lists/user-lists/${user_id}`);
		return response.json();
	},
	addToList: async (data) => {
		const response = await fetch(`${API_BASE_URL}/lists/add-to-list`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
		return response.json();
	}
};
