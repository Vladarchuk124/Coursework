import { apiRequest } from '../../../composables/api-client';

export const actions = {
	getReports: async (admin_id) => {
		return apiRequest(`/admin/reports?admin_id=${admin_id}`);
	},

	deleteReport: async (report_id, admin_id) => {
		return apiRequest(`/admin/reports/${report_id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ admin_id })
		});
	},

	blockUser: async (user_id, admin_id) => {
		return apiRequest(`/admin/block-user/${user_id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ admin_id })
		});
	},

	unblockUser: async (user_id, admin_id) => {
		return apiRequest(`/admin/unblock-user/${user_id}`, {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ admin_id })
		});
	},

	deleteReview: async (review_id, admin_id) => {
		return apiRequest(`/admin/reviews/${review_id}`, {
			method: 'DELETE',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify({ admin_id })
		});
	},

	createReport: async (data) => {
		return apiRequest('/reports', {
			method: 'POST',
			headers: {
				'Content-Type': 'application/json'
			},
			body: JSON.stringify(data)
		});
	}
};
