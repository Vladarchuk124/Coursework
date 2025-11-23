const API_BASE_URL = 'http://localhost:3000/api';

const makeData = (data) => {
	return {
		headers: {
			'Content-Type': 'application/json'
		},
		body: JSON.stringify({ ...data })
	};
};

export const actions = {
	login: async (data) => {
		const newData = makeData(data);
		const response = await fetch(`${API_BASE_URL}/auth/login`, {
			method: 'POST',
			...newData
		});
		return response.json();
	},
	register: async (data) => {
		const newData = makeData(data);
		const response = await fetch(`${API_BASE_URL}/auth/register`, {
			method: 'POST',
			...newData
		});
		return response.json();
	}
};
