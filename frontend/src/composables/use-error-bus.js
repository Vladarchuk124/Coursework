import { reactive, readonly } from 'vue';

const state = reactive({
	visible: false,
	message: '',
	timeoutId: null
});

export const useErrorBus = () => {
	const showError = (message, duration = 4000) => {
		state.message = message;
		state.visible = true;

		if (state.timeoutId) {
			clearTimeout(state.timeoutId);
		}

		state.timeoutId = setTimeout(() => {
			state.visible = false;
			state.message = '';
			state.timeoutId = null;
		}, duration);
	};

	const hideError = () => {
		state.visible = false;
		state.message = '';
		if (state.timeoutId) {
			clearTimeout(state.timeoutId);
			state.timeoutId = null;
		}
	};

	return {
		state: readonly(state),
		showError,
		hideError
	};
};
