<script setup>
import { computed, ref } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import LoginFrom from './components/login.vue';
import RegisterForm from './components/register.vue';
import ForgotPassword from './components/forgot-password.vue';
import { actions } from './store/actions';

const { t } = useI18n();
const store = useStore();

const activeView = ref('login');
const statusMessage = ref('');
const isAuthenticated = computed(() => store.getters.isAuthenticated);

const tabs = computed(() => [
	{ id: 'login', label: t('auth.signIn') },
	{ id: 'register', label: t('auth.signUp') },
	{ id: 'forgot', label: t('auth.recovery') }
]);

const setView = (view) => {
	activeView.value = view;
	statusMessage.value = '';
};
</script>

<template>
	<section class="auth-page">
		<div v-if="!isAuthenticated" class="auth-layout">
			<div class="welcoming-window">
				<h1>
					{{ t('auth.title') }}
					<span class="accent">{{ t('auth.signIn') }}</span>
				</h1>
				<p class="subtitle">
					{{ t('auth.description') }}
				</p>
			</div>

			<div class="auth-card">
				<div class="card-tabs">
					<button
						v-for="tab in tabs"
						:key="tab.id"
						:class="['tab-btn', { active: activeView === tab.id }]"
						type="button"
						@click="setView(tab.id)"
					>
						{{ tab.label }}
					</button>
				</div>

				<div class="card-body">
					<LoginFrom v-if="activeView === 'login'" @switch="setView" :login="actions.login" />
					<RegisterForm v-else-if="activeView === 'register'" @switch="setView" :register="actions.register" />
					<ForgotPassword v-else @switch="setView" />
				</div>
			</div>
		</div>
		<div v-else class="auth-locked">
			<div class="auth-locked__card">
				<h2>{{ t('errors.title') }}</h2>
				<p class="auth-locked__lead">
					{{ t('auth.signIn') }} недоступний, поки ви вже в акаунті.
				</p>
				<p class="auth-locked__hint">Спочатку вийдіть з профілю, щоб повернутися на сторінку авторизації.</p>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.auth-page {
	background: var(--bg-color);
	position: relative;
	min-height: calc(100vh - 190px);
	padding: 3rem 1.5rem 4rem;
	overflow: hidden;
	color: var(--text-color);

	.auth-layout {
		position: relative;
		z-index: 1;
		display: grid;
		grid-template-columns: 1fr minmax(360px, 420px);
		gap: 2rem;
		align-items: stretch;
		max-width: 1100px;
		margin: 0 auto;

		.auth-card {
			position: relative;
			background: var(--card-bg);
			border: 1px solid var(--border-color);
			border-radius: 24px;
			padding: 1.25rem;
			box-shadow: var(--shadow-xl);
			backdrop-filter: blur(12px);
			display: flex;
			flex-direction: column;
			gap: 1.25rem;

			.card-tabs {
				display: grid;
				grid-template-columns: repeat(3, 1fr);
				gap: 0.5rem;
				padding: 0.35rem;
				border-radius: 16px;
			}
		}
	}
}

.welcoming-window {
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-xl);
	background: var(--card-bg);
	border-radius: 28px;
	padding: 2rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	backdrop-filter: blur(10px);

	h1 {
		margin: 0;
		font-size: clamp(2rem, 4vw, 2.8rem);
		line-height: 1.1;
		color: var(--text-color);

		.accent {
			color: var(--accent-color);
			display: inline-block;
			margin-left: 0.4rem;
		}
	}

	.subtitle {
		margin: 0;
		color: var(--text-color-secondary);
		font-size: 1.05rem;
		max-width: 90%;
	}
}

.tab-btn {
	background: transparent;
	border: none;
	color: var(--text-color);
	padding: 0.9rem 0.75rem;
	border-radius: 12px;
	font-weight: 600;
	letter-spacing: 0.02em;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		color: var(--link-text-hover);
	}

	&.active {
		color: var(--btn-primary-text);
		background: var(--accent-gradient);
		box-shadow: var(--btn-primary-shadow);
	}
}

.card-body {
	flex: 1;
	background: var(--surface-color);
	border-radius: 18px;
	padding: 1.5rem;
	border: 1px solid var(--border-color-light);
}

:deep(.auth-form) {
	display: flex;
	flex-direction: column;
	gap: 1rem;

	.input-group {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;

		label {
			font-weight: 600;
			color: var(--text-color);
		}

		.input-shell {
			display: flex;
			align-items: center;
			background: var(--input-color);
			border: 1px solid var(--input-border);
			border-radius: 14px;
			padding: 0.85rem 1rem;
			transition: border-color 0.2s ease, box-shadow 0.2s ease;

			input {
				flex: 1;
				background: transparent;
				border: none;
				color: var(--text-color);
				font-size: 1rem;
				outline: none;

				&::placeholder {
					color: var(--text-color-tertiary);
				}
			}

			&:focus-within {
				border-color: var(--input-focus-border);
				box-shadow: var(--input-focus-shadow);
			}
		}
	}

	.form-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
		color: var(--text-color-secondary);

		.checkbox {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			cursor: pointer;
			color: var(--text-color);

			input {
				accent-color: var(--accent-color);
			}
		}
	}

	.link-btn {
		background: none;
		border: none;
		color: var(--link-color);
		font-weight: 600;
		cursor: pointer;
		padding: 0;
		transition: color 0.2s ease;

		&:hover {
			color: var(--link-text-hover);
		}
	}
	.primary-btn {
		width: 100%;
		border: none;
		background: var(--btn-primary-bg);
		color: var(--btn-primary-text);
		border-radius: 14px;
		padding: 0.95rem 1rem;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		box-shadow: var(--btn-primary-shadow);
		transition: transform 0.15s ease, box-shadow 0.2s ease;

		&:hover {
			transform: translateY(-2px);
		}
	}
	.form-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0.3rem 0 0;
		color: var(--text-color-secondary);
	}
	.warning {
		margin: 0;
		padding: 0.8rem 1rem;
		border-radius: 12px;
		font-size: 0.95rem;
		border: 1px solid var(--warning-border);
		background: var(--warning-bg);
		color: var(--warning-color);
	}
}

.auth-locked {
	display: flex;
	align-items: center;
	justify-content: center;
	min-height: 400px;

	&__card {
		max-width: 520px;
		width: 100%;
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: 22px;
		padding: 1.75rem;
		box-shadow: var(--shadow-lg);
		text-align: center;

		h2 {
			color: var(--text-color);
		}
	}

	&__lead {
		margin: 0.5rem 0 0.35rem;
		font-weight: 600;
		color: var(--text-color);
	}

	&__hint {
		margin: 0;
		color: var(--text-color-secondary);
	}
}

@media (max-width: 1024px) {
	.auth-layout {
		grid-template-columns: 1fr;
	}

	.welcoming-window {
		order: 2;
	}

	.auth-card {
		order: 1;
	}
}

@media (max-width: 640px) {
	.auth-page {
		padding: 2.5rem 1rem 3rem;
	}

	.card-body {
		padding: 1.1rem;
	}
}
</style>
