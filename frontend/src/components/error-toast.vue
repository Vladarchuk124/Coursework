<script setup>
import { useI18n } from 'vue-i18n';
import { useErrorBus } from '../composables/use-error-bus.js';

const { t } = useI18n();
const { state, hideError } = useErrorBus();
</script>

<template>
	<transition name="toast-fade">
		<div v-if="state.visible" class="toast" role="alert">
			<div class="toast__icon">⚠️</div>
			<div class="toast__content">
				<p class="toast__title">{{ t('errors.title') }}</p>
				<p class="toast__message">{{ state.message }}</p>
			</div>
			<button type="button" class="toast__close" @click="hideError">Х</button>
		</div>
	</transition>
</template>

<style scoped lang="scss">
.toast {
	position: fixed;
	right: 3rem;
	top: 6rem;
	z-index: 9999;

	display: flex;
	align-items: flex-start;
	gap: 0.75rem;

	max-width: 360px;
	padding: 0.9rem 1rem;
	border-radius: 16px;
	background: rgba(127, 29, 29, 0.98);
	backdrop-filter: blur(8px);
	box-shadow: 0 18px 45px rgba(0, 0, 0, 0.7);
	border: 1px solid rgba(248, 113, 113, 0.9);
	color: #fee2e2;

	&__icon {
		font-size: 1.4rem;
		margin-top: 0.1rem;
	}

	&__content {
		flex: 1;
	}

	&__title {
		margin: 0 0 0.15rem;
		font-weight: 700;
		font-size: 0.9rem;
		letter-spacing: 0.04em;
		text-transform: uppercase;
		color: #fee2e2;
	}

	&__message {
		margin: 0;
		font-size: 0.95rem;
		color: #fee2e2;
	}

	&__close {
		margin-left: 0.25rem;
		border: none;
		background: transparent;
		color: #fecaca;
		cursor: pointer;
		font-size: 0.95rem;
		font-weight: 700;
		padding: 0.1rem;
		border-radius: 999px;
		transition: background-color 0.15s ease, transform 0.12s ease;

		&:hover {
			background: rgba(248, 250, 252, 0.12);
			transform: translateY(-1px);
		}
	}
}

.toast-fade-enter-active,
.toast-fade-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.toast-fade-enter-from,
.toast-fade-leave-to {
	opacity: 0;
	transform: translateY(-8px);
}
</style>
