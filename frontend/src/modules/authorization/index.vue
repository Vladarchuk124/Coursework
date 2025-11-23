<script setup>
import { computed, ref } from 'vue';
import { useI18n } from 'vue-i18n';
import LoginFrom from './components/login.vue';
import RegisterForm from './components/register.vue';
import ForgotPassword from './components/forgot-password.vue';
import { actions } from './store/actions';

const { t } = useI18n();

const activeView = ref('login');
const statusMessage = ref('');

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
		<div class="auth-layout">
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
	</section>
</template>

<style lang="scss" scoped>
.auth-page {
	background: var(--bg-color);
	position: relative;
	min-height: calc(100vh - 190px);
	padding: 3rem 1.5rem 4rem;
	overflow: hidden;
	color: #f5f6f9;

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
			background: var(--header-color);
			border: 1px solid rgba(255, 255, 255, 0.06);
			border-radius: 24px;
			padding: 1.25rem;
			box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
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
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 30px 80px rgba(0, 0, 0, 0.4);
	background: var(--header-color);
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

		.accent {
			color: var(--accent-color);
			display: inline-block;
			margin-left: 0.4rem;
		}
	}

	.subtitle {
		margin: 0;
		color: rgba(255, 255, 255, 0.72);
		font-size: 1.05rem;
		max-width: 90%;
	}

	.hero-list {
		list-style: none;
		padding: 0;
		margin: 0.5rem 0 0;
		display: grid;
		gap: 0.6rem;

		li {
			display: inline-flex;
			align-items: center;
			gap: 0.6rem;
			color: rgba(255, 255, 255, 0.8);
			font-weight: 500;
		}

		.dot {
			width: 10px;
			height: 10px;
			border-radius: 50%;
			background: linear-gradient(135deg, #00bbf9, #6d7cff);
			box-shadow: 0 0 10px rgba(0, 187, 249, 0.7);
		}
	}
}

.tab-btn {
	background: transparent;
	border: none;
	color: white;
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
		color: #0a0c10;
		background: var(--card-color);
		box-shadow: 0 10px 25px rgba(0, 187, 249, 0.35);
	}
}

.card-body {
	flex: 1;
	background: linear-gradient(180deg, rgba(255, 255, 255, 0.09), rgba(255, 255, 255, 0.15));
	border-radius: 18px;
	padding: 1.5rem;
	border: 1px solid rgba(255, 255, 255, 0.05);
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
		}

		.input-shell {
			display: flex;
			align-items: center;
			background: var(--input-color);
			border: 1px solid rgba(255, 255, 255, 0.08);
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
			}

			&:focus-within {
				border-color: rgba(0, 187, 249, 0.5);
				box-shadow: 0 0 0 4px rgba(0, 187, 249, 0.12);
			}
		}
	}

	.form-row {
		display: flex;
		align-items: center;
		justify-content: space-between;
		flex-wrap: wrap;
		gap: 0.75rem;
		color: rgba(255, 255, 255, 0.8);

		.checkbox {
			display: inline-flex;
			align-items: center;
			gap: 0.5rem;
			cursor: pointer;
			color: rgba(255, 255, 255, 0.85);

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
		background: linear-gradient(135deg, #00bbf9, #4cb1ff);
		color: white;
		border-radius: 14px;
		padding: 0.95rem 1rem;
		font-weight: 700;
		font-size: 1rem;
		cursor: pointer;
		box-shadow: 0 1px 20px rgba(0, 187, 249, 0.3);
		transition: transform 0.15s ease, box-shadow 0.2s ease;

		&:hover {
			transform: translateY(-2px);
			box-shadow: 0 20px 25px rgba(0, 187, 249, 0.35);
		}
	}
	.form-footer {
		display: flex;
		align-items: center;
		justify-content: center;
		gap: 0.5rem;
		margin: 0.3rem 0 0;
		color: rgba(255, 255, 255, 0.8);
	}
	.warning {
		margin: 0;
		padding: 0.8rem 1rem;
		border-radius: 12px;
		font-size: 0.95rem;
		border: 1px solid rgba(0, 187, 249, 0.35);
		border-color: rgba(255, 193, 7, 0.5);
		background: rgba(255, 193, 7, 0.12);
		color: #ffe7a0;
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
