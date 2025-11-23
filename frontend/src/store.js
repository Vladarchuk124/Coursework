import { createStore } from 'vuex';

export default createStore({
	state: {
		session: {
			user: null,
			token: null,
			expiresAt: null
		},
		loading: false
	},
	getters: {
		isAuthenticated: (state) => !!state.session.token,
		userInitials: (state) => (state.session.user ? state.session.user.name?.slice(0, 2).toUpperCase() : '')
	},
	mutations: {
		setSession(state, payload) {
			state.session = { ...state.session, ...payload };
		},
		clearSession(state) {
			state.session = { user: null, token: null, expiresAt: null };
		},
		setLoading(state, flag) {
			state.loading = flag;
		}
	},
	actions: {
		async bootstrapSession({ commit }) {
			commit('setLoading', true);
			try {
				const cached = JSON.parse(localStorage.getItem('session'));
				if (cached) commit('setSession', cached);
			} finally {
				commit('setLoading', false);
			}
		}
	}
});
