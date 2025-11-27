<script setup>
import { computed, onMounted } from 'vue';
import { useRouter, useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { actions } from './store/actions';

const router = useRouter();
const route = useRoute();
const store = useStore();
const { t } = useI18n();

const isActivated = computed(() => store.state.session.user?.is_activated || false);

onMounted(async () => {
	if (route.query.activated === 'true') {
		const result = await actions.getUser(route.query.id);
		console.log(result);
		const session = {
			user: { id: result.id, name: result.name, email: result.email, is_activated: result.is_activated },
			token: result.access_token,
			expiresAt: Date.now() + 30 * 60 * 1000
		};
		store.commit('setSession', session);
		localStorage.setItem('session', JSON.stringify(session));
		router.replace({ query: {} });
	}
});

const openInbox = () => window.open('https://mail.google.com', '_blank');
const backToAuth = () => router.push('/authorization');
const goToMovies = () => router.push('/');
</script>

<template>
	<section class="confirm-mail">
		<div class="shell">
			<div class="envelope">
				<div class="stamp">{{ isActivated ? t('confirmMail.activated') : t('confirmMail.verification') }}</div>
				<div class="flap" :class="{ success: isActivated }"></div>
			</div>
			<div class="text-block">
				<h1 v-if="isActivated">{{ t('confirmMail.successTitle') }}</h1>
				<h1 v-else>{{ t('confirmMail.pendingTitle') }}</h1>
				<p v-if="isActivated" class="success-message">{{ t('confirmMail.successMessage') }}</p>
				<p v-else class="pending-message">{{ t('confirmMail.pendingMessage') }}</p>
				<div class="actions">
					<button v-if="isActivated" type="button" class="btn primary" @click="goToMovies">
						{{ t('confirmMail.goToMovies') }}
					</button>
					<button v-else type="button" class="btn primary" @click="openInbox">
						{{ t('confirmMail.openInbox') }}
					</button>
					<button v-if="!isActivated" type="button" class="btn link" @click="backToAuth">
						{{ t('confirmMail.backToAuth') }}
					</button>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.confirm-mail {
	display: flex;
	justify-content: center;
	height: 60dvh;
	align-items: center;
	position: relative;
	padding: 3.5rem 1.5rem 4.5rem;
	overflow: hidden;
	color: var(--text-color);

	.shell {
		display: flex;
		flex-direction: column;
		position: relative;
		z-index: 1;
		gap: 2rem;
		max-width: 1200px;
		margin: 0 auto;
		align-items: center;

		.envelope {
			position: relative;
			display: grid;
			width: 100%;
			place-items: center;
			border-radius: 18px;
			padding: 1.5rem;
			background: linear-gradient(135deg, rgba(0, 187, 249, 0.18), rgba(0, 187, 249, 0.05));
			border: 1px solid rgba(0, 187, 249, 0.3);

			.flap {
				position: absolute;
				width: 180px;
				height: 120px;
				border-radius: 12px;
				background: linear-gradient(135deg, #00bbf9, #4cb1ff);
				box-shadow: 0 15px 35px rgba(0, 187, 249, 0.35);
				clip-path: polygon(0 0, 100% 0, 50% 55%);
				opacity: 0.9;
				animation: sway 4s ease-in-out infinite;

				&.success {
					background: linear-gradient(135deg, #34e89e, #0acffe);
					box-shadow: 0 15px 35px rgba(52, 232, 158, 0.35);
				}
			}

			.stamp {
				position: relative;
				z-index: 1;
				padding: 0.45rem 0.9rem;
				border-radius: 10px;
				background: #0a0c10;
				color: #e9f8ff;
				text-transform: uppercase;
				font-weight: 800;
				letter-spacing: 0.08em;
				box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
			}
		}

		.text-block {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;

			h1 {
				margin: 0;
				font-size: clamp(2.2rem, 4vw, 3rem);
				letter-spacing: -0.01em;
				color: white;
			}

			.success-message,
			.pending-message {
				margin: 0;
				color: rgba(255, 255, 255, 0.8);
				font-size: 1.1rem;
				text-align: center;
				max-width: 500px;
			}

			.success-message {
				color: rgba(52, 232, 158, 0.9);
			}

			.actions {
				display: flex;
				flex-wrap: wrap;
				gap: 0.75rem;
				margin-top: 0.5rem;
			}

			.btn {
				border: none;
				border-radius: 14px;
				padding: 0.95rem 1.2rem;
				font-weight: 700;
				cursor: pointer;
				transition: transform 0.15s ease, box-shadow 0.2s ease, background-color 0.2s ease;
				font-size: 1rem;

				&:hover {
					transform: translateY(-2px);
				}

				&.primary {
					color: var(--text-color);
					background: linear-gradient(135deg, #00bbf9, #4cb1ff);
					box-shadow: 0 20px 35px rgba(0, 187, 249, 0.35);
				}

				&.link {
					background: transparent;
					padding-left: 0;
					padding-right: 0;
					color: var(--link-color);
					box-shadow: none;
					text-decoration: underline;

					&:hover {
						color: var(--link-text-hover);
					}
				}
			}
		}
	}
}
@keyframes sway {
	0%,
	100% {
		transform: translateY(0) rotate(-1deg);
	}
	50% {
		transform: translateY(6px) rotate(1deg);
	}
}
</style>
