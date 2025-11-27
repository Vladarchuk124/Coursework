import { apiRequest } from '../../../composables/api-client';
import { contentTypes } from '../../../../enums/content-type';
import { i18n } from '../../../main.js';

export const actions = {
	getContentById: async (id, type, locale) => {
		if (type === contentTypes.movie) {
			return apiRequest(`/movies/${id}?locale=${locale}`);
		} else if (type === contentTypes.show) {
			return apiRequest(`/shows/${id}?locale=${locale}`);
		}
		const errorMessage = i18n.global.t('errors.unsupportedContentType');
		throw new Error(errorMessage);
	},
	getUserLists: async (user_id, content_id, content_type) => {
		return apiRequest(`/lists/user-lists/${user_id}`, {
			method: 'POST',
			body: JSON.stringify({ content_id, content_type })
		});
	},
	addToList: async (data) => {
		return apiRequest('/lists/add-to-list', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	}
};
