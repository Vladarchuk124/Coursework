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
		<span class="rating-panel__glow rating-panel__glow--one" aria-hidden="true" />
		<span class="rating-panel__glow rating-panel__glow--two" aria-hidden="true" />

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
	padding: 1rem 1.25rem;
	border-radius: 20px;
	background: radial-gradient(120% 140% at 90% 20%, rgba(255, 200, 55, 0.12), transparent 50%),
		radial-gradient(120% 140% at 20% 80%, rgba(255, 107, 107, 0.1), transparent 40%),
		linear-gradient(145deg, rgba(13, 18, 30, 0.8), rgba(14, 20, 31, 0.9));
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 20px 70px rgba(0, 0, 0, 0.45);
	color: #f5f7fb;
	display: flex;
	flex-direction: column;
	gap: 0.9rem;
	position: relative;
	overflow: hidden;

	&__header {
		display: flex;
		align-items: flex-start;
		justify-content: space-between;
		gap: 1rem;
		flex-wrap: wrap;

		h3 {
			margin: 0.2rem 0 0;
			font-size: 1.5rem;
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
		color: #ffcb6b;
		font-weight: 700;
		background: rgba(255, 200, 55, 0.12);
		border: 1px solid rgba(255, 200, 55, 0.28);
		padding: 0.65rem 0.9rem;
		border-radius: 12px;
	}

	&__glow {
		position: absolute;
		width: 200px;
		border-radius: 50%;
		filter: blur(80px);
		opacity: 0.3;
		z-index: 0;
		pointer-events: none;

		&--one {
			background: #ffc837;
			top: -60px;
			left: -50px;
		}

		&--two {
			background: #ff6b6b;
			bottom: -70px;
			right: -40px;
		}
	}
}

.rating-panel * {
	position: relative;
	z-index: 1;
}

.stat {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 0.15rem;

	&__value {
		font-size: 1.6rem;
		font-weight: 800;
		background: linear-gradient(135deg, #ffc837, #ff8008);
		-webkit-background-clip: text;
		-webkit-text-fill-color: transparent;
		background-clip: text;
	}

	&__label {
		font-size: 0.75rem;
		color: rgba(255, 255, 255, 0.6);
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
		fill: rgba(255, 255, 255, 0.2);
		stroke: rgba(255, 255, 255, 0.4);
		stroke-width: 1;
		transition: fill 0.15s ease, stroke 0.15s ease, filter 0.15s ease;
	}

	&--filled &__icon {
		fill: #ffc837;
		stroke: #ff8008;
		filter: drop-shadow(0 0 6px rgba(255, 200, 55, 0.5));
	}

	&--user &__icon {
		filter: drop-shadow(0 0 10px rgba(255, 200, 55, 0.8));
	}
}

.user-rating {
	font-size: 0.95rem;
	color: rgba(255, 255, 255, 0.9);

	strong {
		color: #ffc837;
		font-size: 1.1rem;
	}
}

.muted {
	color: rgba(255, 255, 255, 0.6);
	font-size: 0.9rem;
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgba(255, 255, 255, 0.75);
	font-size: 0.85rem;
	margin: 0;
}

.loader {
	display: flex;
	align-items: center;
	gap: 0.6rem;

	&__spinner {
		width: 20px;
		height: 20px;
		border-radius: 50%;
		border: 3px solid rgba(255, 255, 255, 0.3);
		border-top-color: #ffc837;
		animation: spin 1s linear infinite;
	}
}

.btn {
	border: none;
	border-radius: 10px;
	padding: 0.5rem 0.85rem;
	font-weight: 600;
	font-size: 0.85rem;
	cursor: pointer;
	display: inline-flex;
	align-items: center;
	gap: 0.3rem;
	transition: transform 0.12s ease, opacity 0.2s ease;

	&.ghost {
		background: transparent;
		color: #e5e7eb;
		border: 1px solid rgba(255, 255, 255, 0.25);
	}

	&.danger {
		border-color: rgba(255, 107, 107, 0.6);
		color: #ffb0b0;
	}

	&:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	&:disabled {
		opacity: 0.6;
		cursor: not-allowed;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}
</style>
