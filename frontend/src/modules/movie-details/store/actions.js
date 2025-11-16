const API_BASE_URL = 'http://localhost:3000/api';

export const actions = {
	getMovieById: async (id, locale) => {
		console.log(locale);
		const response = await fetch(`${API_BASE_URL}/movies/${id}?locale=${locale}`);
		return response.json();
	},
};
