<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { actions } from '../store/actions';

const props = defineProps({
	contentId: {
		type: [String, Number],
		required: true
	},
	contentType: {
		type: String,
		required: true
	}
});

const store = useStore();
const { t } = useI18n();

const loading = ref(false);
const saving = ref(false);
const hoverValue = ref(0);
const userRating = ref(null);
const averageRating = ref(0);
const ratingsCount = ref(0);
const feedback = ref('');

const isAuthenticated = computed(() => store.getters.isAuthenticated);
const userId = computed(() => store.state.session.user?.id);

const stars = computed(() => {
	const displayValue = hoverValue.value || userRating.value || 0;
	return Array.from({ length: 10 }, (_, i) => ({
		value: i + 1,
		filled: i + 1 <= displayValue
	}));
});

const loadRating = async () => {
	if (!props.contentId || !props.contentType) return;
	loading.value = true;
	feedback.value = '';
	try {
		const data = await actions.getRating(props.contentId, props.contentType, userId.value);
		averageRating.value = data?.average || 0;
		ratingsCount.value = data?.count || 0;
		userRating.value = data?.userRating || null;
	} catch (error) {
		feedback.value = error.message;
	} finally {
		loading.value = false;
	}
};

const handleStarClick = async (value) => {
	feedback.value = '';
	if (!isAuthenticated.value || !userId.value) {
		feedback.value = t('contentDetails.rating.loginRequired');
		return;
	}

	if (userRating.value === value) {
		await removeRating();
		return;
	}

	saving.value = true;
	try {
		await actions.setRating({
			user_id: userId.value,
			content_id: props.contentId,
			content_type: props.contentType,
			value
		});
		userRating.value = value;
		await loadRating();
	} catch (error) {
		feedback.value = error.message;
	} finally {
		saving.value = false;
	}
};

const removeRating = async () => {
	if (!userId.value) return;

	saving.value = true;
	try {
		await actions.deleteRating({
			user_id: userId.value,
			content_id: props.contentId,
			content_type: props.contentType
		});
		userRating.value = null;
		await loadRating();
	} catch (error) {
		feedback.value = error.message;
	} finally {
		saving.value = false;
	}
};

const handleMouseEnter = (value) => {
	if (isAuthenticated.value && !saving.value) {
		hoverValue.value = value;
	}
};

const handleMouseLeave = () => {
	hoverValue.value = 0;
};

onMounted(loadRating);
watch(
	() => [props.contentId, props.contentType, userId.value],
	() => {
		loadRating();
	}
);
</script>

<template>
	<div class="rating-panel">
		<div class="rating-panel__header">
			<div class="rating-panel__title">
				<p class="eyebrow">{{ t('contentDetails.rating.title') }}</p>
				<h3>{{ t('contentDetails.rating.cta') }}</h3>
			</div>
			<div class="rating-panel__stats">
				<div class="stat">
					<span class="stat__value">{{ averageRating.toFixed(1) }}</span>
					<span class="stat__label">{{ t('contentDetails.rating.average') }}</span>
				</div>
				<div class="stat">
					<span class="stat__value">{{ ratingsCount }}</span>
					<span class="stat__label">{{ t('contentDetails.rating.votes') }}</span>
				</div>
			</div>
		</div>

		<div class="rating-panel__content">
			<div v-if="loading" class="loader">
				<div class="loader__spinner" />
			</div>
			<template v-else>
				<div class="stars" :class="{ 'stars--disabled': !isAuthenticated || saving }" @mouseleave="handleMouseLeave">
					<button
						v-for="star in stars"
						:key="star.value"
						type="button"
						class="star"
						:class="{ 'star--filled': star.filled, 'star--user': userRating === star.value }"
						:disabled="!isAuthenticated || saving"
						:aria-label="`${t('contentDetails.rating.rate')} ${star.value}`"
						@click="handleStarClick(star.value)"
						@mouseenter="handleMouseEnter(star.value)"
					>
						<svg viewBox="0 0 24 24" class="star__icon">
							<path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
						</svg>
					</button>
				</div>
				<div class="rating-panel__info">
					<template v-if="userRating">
						<span class="user-rating">
							{{ t('contentDetails.rating.yourRating') }}: <strong>{{ userRating }}</strong
							>/10
						</span>
						<button type="button" class="btn ghost danger" :disabled="saving" @click="removeRating">
							{{ t('contentDetails.rating.remove') }}
						</button>
					</template>
					<span v-else-if="!isAuthenticated" class="muted">
						{{ t('contentDetails.rating.loginRequired') }}
					</span>
					<span v-else class="muted">
						{{ t('contentDetails.rating.clickToRate') }}
					</span>
				</div>
			</template>
		</div>

		<p v-if="feedback" class="rating-panel__feedback">{{ feedback }}</p>
	</div>
</template>

<style scoped lang="scss">
.rating-panel {
	margin-top: 0.5rem;
	padding: 1.5rem;
	border-radius: 20px;
	background: var(--surface-color);
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-md);
	color: var(--text-color);
	display: flex;
	flex-direction: column;
	gap: 1rem;

	&__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;

		h3 {
			margin: 0.2rem 0 0;
			font-size: 1.5rem;
			color: var(--text-color);
		}
	}

	&__title {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
	}

	&__stats {
		display: flex;
		gap: 1.5rem;
	}

	&__content {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
		align-items: flex-start;
	}

	&__info {
		display: flex;
		align-items: center;
		gap: 0.75rem;
		flex-wrap: wrap;
	}

	&__feedback {
		margin: 0;
		color: var(--warning-color);
		font-weight: 700;
		background: var(--warning-bg);
		border: 1px solid var(--warning-border);
		padding: 0.65rem 0.9rem;
		border-radius: 12px;
	}
}

.stat {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.15rem;

	&__value {
		font-size: 1.6rem;
		font-weight: 800;
		color: var(--warning-color);
	}

	&__label {
		font-size: 0.75rem;
		color: var(--text-color-secondary);
		text-transform: uppercase;
		letter-spacing: 0.05em;
	}
}

.stars {
	display: flex;
	gap: 0.25rem;

	&--disabled {
		opacity: 0.6;
		pointer-events: none;
	}
}

.star {
	background: none;
	border: none;
	padding: 0;
	cursor: pointer;
	transition: transform 0.15s ease;

	&:hover:not(:disabled) {
		transform: scale(1.15);
	}

	&:disabled {
		cursor: not-allowed;
	}

	&__icon {
		width: 28px;
		height: 28px;
		fill: var(--surface-color-hover);
		stroke: var(--text-color-tertiary);
		stroke-width: 1;
		transition: fill 0.15s ease, stroke 0.15s ease, filter 0.15s ease;
	}

	&--filled &__icon {
		fill: var(--warning-color);
		stroke: var(--warning-color);
		filter: drop-shadow(0 0 6px var(--warning-border));
	}

	&--user &__icon {
		filter: drop-shadow(0 0 10px var(--warning-color));
	}
}

.user-rating {
	font-size: 0.95rem;
	color: var(--text-color);

	strong {
		color: var(--warning-color);
		font-size: 1.1rem;
	}
}

.muted {
	color: var(--text-color-secondary);
	font-size: 0.9rem;
}

.loader {
	display: flex;
	align-items: center;
	gap: 0.6rem;

	&__spinner {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 3px solid var(--spinner-color);
		border-top-color: var(--warning-color);
		animation: spin 1s linear infinite;
	}
}

.btn {
	&.ghost.danger {
		padding: 0.5rem 0.85rem;
		font-size: 0.85rem;
		border-color: var(--error-border);
		color: var(--error-color);
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
