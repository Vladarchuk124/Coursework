<script setup>
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';

const { locale, t } = useI18n();
const router = useRouter();

const props = defineProps({
	show: Boolean,
	actors: Array,
	loading: Boolean
});

const emit = defineEmits(['close']);

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const handleActorClick = (actorId) => {
	emit('close');
	router.push(`/actor/${actorId}`);
};

const handleBackdropClick = (event) => {
	if (event.target === event.currentTarget) {
		emit('close');
	}
};
</script>

<template>
	<Teleport to="body">
		<Transition name="modal">
			<div v-if="show" class="modal-backdrop" @click="handleBackdropClick">
				<div class="modal-container">
					<div class="modal-header">
						<div class="header-title">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
							<h2>{{ t('contentDetails.actors.title') }}</h2>
						</div>
						<button class="close-btn" @click="emit('close')" :aria-label="t('contentDetails.listModal.cancelButton')">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M18 6L6 18M6 6l12 12" />
							</svg>
						</button>
					</div>

					<div class="modal-content">
						<div v-if="loading" class="loading-state">
							<span class="loading-spinner"></span>
							<p>{{ t('contentDetails.actors.loading') }}</p>
						</div>

						<div v-else-if="actors?.length" class="actors-grid">
							<div v-for="actor in actors" :key="actor.id" class="actor-card" @click="handleActorClick(actor.id)">
								<div class="actor-photo">
									<img
										v-if="actor.profile_path"
										:src="`${IMAGE_BASE}/w185${actor.profile_path}`"
										:alt="actor.name"
										loading="lazy"
									/>
									<div v-else class="no-photo">
										<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
											<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
											<circle cx="12" cy="7" r="4" />
										</svg>
									</div>
								</div>
								<div class="actor-info">
									<h3 class="actor-name">{{ actor.name }}</h3>
									<p v-if="actor.character" class="actor-character">{{ actor.character }}</p>
								</div>
							</div>
						</div>

						<div v-else class="empty-state">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
							<p>{{ t('contentDetails.actors.empty') }}</p>
						</div>
					</div>
				</div>
			</div>
		</Transition>
	</Teleport>
</template>

<style lang="scss" scoped>
.modal-backdrop {
	position: fixed;
	inset: 0;
	background: var(--modal-backdrop);
	backdrop-filter: blur(8px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 2rem;
}

.modal-container {
	background: var(--modal-bg);
	border-radius: 24px;
	width: 100%;
	max-width: 800px;
	max-height: 80vh;
	display: flex;
	flex-direction: column;
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-xl);
	overflow: hidden;
}

.modal-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.25rem 1.5rem;
	border-bottom: 1px solid var(--border-color);
	background: var(--surface-color);
}

.header-title {
	display: flex;
	align-items: center;
	gap: 0.75rem;

	svg {
		width: 1.5rem;
		height: 1.5rem;
		color: var(--secondary-accent);
	}

	h2 {
		margin: 0;
		font-size: 1.25rem;
		font-weight: 600;
		color: var(--text-color);
	}
}

.close-btn {
	background: var(--surface-color-hover);
	border: none;
	border-radius: 50%;
	width: 36px;
	height: 36px;
	display: flex;
	align-items: center;
	justify-content: center;
	cursor: pointer;
	transition: all 0.2s ease;

	svg {
		width: 18px;
		height: 18px;
		color: var(--text-color-secondary);
	}

	&:hover {
		background: var(--surface-color-elevated);

		svg {
			color: var(--text-color);
		}
	}
}

.modal-content {
	flex: 1;
	overflow-y: auto;
	padding: 1.5rem;

	&::-webkit-scrollbar {
		width: 6px;
	}

	&::-webkit-scrollbar-track {
		background: transparent;
	}

	&::-webkit-scrollbar-thumb {
		background: var(--scrollbar-thumb);
		border-radius: 3px;
	}
}

.loading-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 3rem;
	gap: 1rem;

	.loading-spinner {
		width: 40px;
		height: 40px;
		border: 3px solid var(--spinner-color);
		border-top-color: var(--secondary-accent);
		border-radius: 50%;
		animation: spin 0.8s linear infinite;
	}

	p {
		color: var(--text-color-secondary);
		margin: 0;
	}
}

.actors-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(160px, 1fr));
	gap: 1rem;
}

.actor-card {
	background: var(--surface-color);
	border-radius: 16px;
	padding: 1rem;
	cursor: pointer;
	transition: all 0.25s ease;
	border: 1px solid transparent;
	display: flex;
	flex-direction: column;
	align-items: center;
	text-align: center;

	&:hover {
		background: var(--secondary-accent-light);
		border-color: var(--secondary-accent);
		transform: translateY(-4px);

		.actor-photo img {
			transform: scale(1.05);
		}
	}
}

.actor-photo {
	width: 80px;
	height: 80px;
	border-radius: 50%;
	overflow: hidden;
	margin-bottom: 0.75rem;
	box-shadow: var(--shadow-md);
	border: 3px solid var(--border-color);

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.3s ease;
	}

	.no-photo {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--surface-color-elevated);

		svg {
			width: 40%;
			height: 40%;
			color: var(--text-color-tertiary);
		}
	}
}

.actor-info {
	.actor-name {
		margin: 0 0 0.25rem 0;
		font-size: 0.9rem;
		font-weight: 600;
		color: var(--text-color);
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.actor-character {
		margin: 0;
		font-size: 0.8rem;
		color: var(--secondary-accent);
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	padding: 3rem;
	gap: 1rem;

	svg {
		width: 60px;
		height: 60px;
		color: var(--text-color-tertiary);
	}

	p {
		color: var(--text-color-secondary);
		margin: 0;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.modal-enter-active,
.modal-leave-active {
	transition: all 0.3s ease;

	.modal-container {
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	}
}

.modal-enter-from,
.modal-leave-to {
	opacity: 0;

	.modal-container {
		transform: scale(0.95) translateY(20px);
		opacity: 0;
	}
}

@media (max-width: 600px) {
	.modal-backdrop {
		padding: 1rem;
	}

	.actors-grid {
		grid-template-columns: repeat(auto-fill, minmax(120px, 1fr));
	}

	.actor-photo {
		width: 60px;
		height: 60px;
	}
}
</style>
