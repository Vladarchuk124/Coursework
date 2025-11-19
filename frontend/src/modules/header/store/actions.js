const API_BASE_URL = 'http://localhost:3000/api';

export const actions = {
	doSearch: async (query, locale = 'uk') => {
		const response = await fetch(`${API_BASE_URL}/search?query=${query}&locale=${locale}`);
		return response.json();
	}
};
