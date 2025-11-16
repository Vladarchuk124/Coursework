const API_BASE_URL = 'http://localhost:3000/api';

export const actions = {
	getPopularMovies: async (page = 1, locale = 'uk') => {
		const response = await fetch(`${API_BASE_URL}/movies/popular?page=${page}&locale=${locale}`);
		return response.json();
	},
};
