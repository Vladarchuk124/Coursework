<script setup>
import { computed, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';

const { t } = useI18n();
const router = useRouter();
const store = useStore();

const nameDraft = ref('');
const user = computed(() => store.state.session.user);
const initials = computed(() => store.getters.userInitials || 'U');
const isAuthenticated = computed(() => store.getters.isAuthenticated);

watch(
	user,
	(value) => {
		nameDraft.value = value?.name || '';
	},
	{ immediate: true }
);

const goToMovies = () => router.push('/popular-movies');
const goToAuth = () => router.push('/authorization');
const handleLogout = async () => {
	await store.dispatch('logout');
	goToMovies();
};
</script>

<template>
	<section class="user-profile">
		<div v-if="isAuthenticated" class="card">
			<div class="user-info">
				<div class="avatar">{{ initials }}</div>
				<div class="profile-body">
					<p class="eyebrow">{{ t('header.userProfile') }}</p>
					<h1>{{ user?.name || t('userProfile.anonymous') }}</h1>
					<p class="subtitle">{{ t('userProfile.subtitle') }}</p>
					<div class="pill-row">
						<span v-if="user?.is_activated" class="pill success">{{ t('userProfile.statusActive') }}</span>
						<span v-else class="pill warning">{{ t('userProfile.statusPending') }}</span>
						<span class="pill muted">ID #{{ user?.id || '—' }}</span>
					</div>
					<div class="actions_btn">
						<button type="button" class="btn primary" @click="goToMovies">{{ t('userProfile.ctaMovies') }}</button>
						<button type="button" class="btn ghost" @click="handleLogout">{{ t('userProfile.ctaLogout') }}</button>
					</div>
				</div>
			</div>
			<div class="user-info">TODO : Add lists</div>
		</div>

		<div v-else class="empty-state">
			<div class="empty-card">
				<p class="eyebrow">{{ t('header.userProfile') }}</p>
				<h2>{{ t('userProfile.emptyState.title') }}</h2>
				<p class="subtitle">{{ t('userProfile.emptyState.description') }}</p>
				<div class="actions_btn">
					<button type="button" class="btn primary" @click="goToAuth">
						{{ t('userProfile.emptyState.ctaLogin') }}
					</button>
					<button type="button" class="btn ghost" @click="goToMovies">{{ t('userProfile.ctaMovies') }}</button>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.user-profile {
	min-height: calc(100vh - 180px);
	padding: 3rem 1.5rem 4rem;
	color: var(--text-color);
	display: flex;
	justify-content: center;

	.card {
		display: flex;
		flex-direction: row;
		gap: 1.25rem;

		.user-info {
			display: flex;
			background: var(--header-color);
			border: 1px solid rgba(255, 255, 255, 0.08);
			padding: 1.75rem;
			border-radius: 24px;
			backdrop-filter: blur(12px);
			box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
		}

		.tab-card {
			display: flex;
			flex-direction: column;
			position: relative;
			width: 100%;
			box-sizing: border-box;
			background: var(--header-color);
			border: 1px solid rgba(255, 255, 255, 0.06);
			border-radius: 24px;
			padding: 1.25rem;
			box-shadow: 0 20px 60px rgba(0, 0, 0, 0.45);
			backdrop-filter: blur(12px);
			gap: 1.25rem;

			.tabs {
				display: flex;
				width: 100%;
				justify-content: space-between;
				gap: 0.5rem;
				padding: 0.35rem;
				border-radius: 16px;

				.tab-btn {
					background: transparent;
					border: none;
					color: white;
					width: 100%;
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
			}

			.card-body {
				background: rgba(255, 255, 255, 0.05);
				border: 1px solid rgba(255, 255, 255, 0.08);
				border-radius: 18px;
				padding: 1.25rem;
				min-height: 220px;
				display: grid;
				align-items: start;
			}
		}

		.avatar {
			width: 74px;
			height: 74px;
			margin: 1rem;
			border-radius: 18px;
			background: linear-gradient(135deg, #00bbf9, #4cb1ff);
			display: grid;
			place-items: center;
			color: #0a0c10;
			font-weight: 800;
			font-size: 1.5rem;
			text-transform: uppercase;
			box-shadow: 0 12px 30px rgba(0, 187, 249, 0.35);
		}

		.profile-body {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;

			h1 {
				margin: 0;
				font-size: clamp(1.8rem, 4vw, 2.4rem);
			}

			.subtitle {
				margin: 0;
				color: rgba(255, 255, 255, 0.8);
			}
		}
	}

	.pill-row {
		display: flex;
		gap: 0.5rem;
		flex-wrap: wrap;
	}

	.pill {
		display: inline-flex;
		align-items: center;
		gap: 0.35rem;
		padding: 0.35rem 0.75rem;
		border-radius: 12px;
		font-weight: 700;
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(255, 255, 255, 0.1);

		&.success {
			color: #0a2012;
			background: linear-gradient(135deg, #34e89e, #0acffe);
			border-color: transparent;
		}

		&.warning {
			color: #2e1605;
			background: linear-gradient(135deg, #ffd89b, #f8b500);
			border-color: transparent;
		}

		&.muted {
			color: rgba(255, 255, 255, 0.8);
			background: rgba(255, 255, 255, 0.05);
		}
	}

	.actions_btn {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;
		margin-top: 0.5rem;
	}

	.btn {
		border: none;
		border-radius: 12px;
		padding: 0.85rem 1.2rem;
		font-weight: 700;
		cursor: pointer;
		color: #0a0c10;
		transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.2s ease;

		&.primary {
			background: linear-gradient(135deg, #00bbf9, #4cb1ff);
			box-shadow: 0 12px 30px rgba(0, 187, 249, 0.35);
		}

		&.ghost {
			background: transparent;
			color: var(--text-color);
			border: 1px solid rgba(255, 255, 255, 0.16);
		}

		&:hover {
			transform: translateY(-1px);
		}
	}

	.eyebrow {
		margin: 0;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		font-size: 0.82rem;
		font-weight: 800;
		color: var(--link-color);
	}

	.empty-state {
		display: flex;
		justify-content: center;
		width: 100%;

		.empty-card {
			display: flex;
			flex-direction: column;
			align-items: center;
			text-align: center;
			gap: 0.75rem;
			padding: 2rem;
			border-radius: 24px;
			background: var(--header-color);
			border: 1px solid rgba(255, 255, 255, 0.1);
			width: min(560px, 100%);
			box-shadow: 0 18px 44px rgba(0, 0, 0, 0.32);

			h2 {
				margin: 0;
				font-size: clamp(1.6rem, 4vw, 2rem);
			}

			.subtitle {
				margin: 0;
				color: rgba(255, 255, 255, 0.8);
			}
		}
	}
}
</style>
