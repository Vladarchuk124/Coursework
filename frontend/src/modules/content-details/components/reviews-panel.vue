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
const { t, locale } = useI18n();

const reviews = ref([]);
const form = ref({ text: '' });
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const feedback = ref('');

const isAuthenticated = computed(() => store.getters.isAuthenticated);
const userId = computed(() => store.state.session.user?.id);

const formatDate = (dateValue) => {
	if (!dateValue) return '';
	try {
		return new Intl.DateTimeFormat(locale.value, {
			year: 'numeric',
			month: 'short',
			day: 'numeric'
		}).format(new Date(dateValue));
	} catch {
		return dateValue;
	}
};

const resetForm = () => {
	form.value.text = '';
};

const loadReviews = async () => {
	if (!props.contentId || !props.contentType) return;
	loading.value = true;
	feedback.value = '';
	try {
		const data = await actions.getReviews(props.contentId, props.contentType, userId.value);
		reviews.value = data?.reviews || [];
		resetForm();
	} catch (error) {
		feedback.value = error.message;
	} finally {
		loading.value = false;
	}
};

const handleSubmit = async () => {
	feedback.value = '';
	if (!isAuthenticated.value || !userId.value) {
		feedback.value = t('contentDetails.reviews.loginRequired');
		return;
	}

	const text = form.value.text.trim();
	if (!text) {
		feedback.value = t('contentDetails.reviews.textRequired');
		return;
	}

	saving.value = true;
	try {
		await actions.saveReview({
			user_id: userId.value,
			content_id: props.contentId,
			content_type: props.contentType,
			text
		});
		feedback.value = t('contentDetails.reviews.saved');
		await loadReviews();
	} catch (error) {
		feedback.value = error.message;
	} finally {
		saving.value = false;
	}
};

const handleDelete = async (reviewId) => {
	if (!userId.value) {
		feedback.value = t('contentDetails.reviews.loginRequired');
		return;
	}
	const confirmed = window.confirm(t('contentDetails.reviews.deleteConfirm'));
	if (!confirmed) return;

	deletingId.value = reviewId;
	try {
		await actions.deleteReview(reviewId, userId.value);
		await loadReviews();
	} catch (error) {
		feedback.value = error.message;
	} finally {
		deletingId.value = null;
	}
};

onMounted(loadReviews);
watch(
	() => [props.contentId, props.contentType, userId.value],
	() => {
		loadReviews();
	}
);
</script>

<template>
	<section class="reviews">
		<span class="reviews__glow reviews__glow--one" aria-hidden="true" />
		<span class="reviews__glow reviews__glow--two" aria-hidden="true" />

		<div class="reviews__header">
			<div class="reviews__title">
				<p class="eyebrow">{{ t('contentDetails.reviews.title') }}</p>
				<h3>{{ t('contentDetails.reviews.cta') }}</h3>
				<p class="muted">{{ reviews.length }} • {{ t('contentDetails.reviews.title') }}</p>
			</div>
		</div>

		<form class="reviews__form" @submit.prevent="handleSubmit">
			<div class="reviews__form-card">
				<div class="form__row">
					<textarea
						id="review-text"
						v-model="form.text"
						rows="3"
						:placeholder="t('contentDetails.reviews.placeholder')"
						:disabled="!isAuthenticated"
					/>
					<div class="form__actions">
						<span v-if="!isAuthenticated" class="muted">{{ t('contentDetails.reviews.loginRequired') }}</span>
						<button class="btn primary" type="submit" :disabled="saving || !isAuthenticated">
							<span v-if="saving" class="btn__spinner" aria-hidden="true" />
							{{ t('contentDetails.reviews.submit') }}
						</button>
					</div>
				</div>
			</div>
		</form>

		<p v-if="feedback" class="reviews__feedback">{{ feedback }}</p>

		<div class="reviews__list">
			<div v-if="loading" class="loader">
				<div class="loader__spinner" />
				<span>{{ t('contentDetails.reviews.loading') }}</span>
			</div>
			<template v-else>
				<p v-if="!reviews.length" class="empty">{{ t('contentDetails.reviews.empty') }}</p>
				<article v-for="review in reviews" :key="review.id" class="review-card">
					<div class="review-card__users">
						<div class="review-card__identity">
							<div class="avatar" aria-hidden="true">{{ review.user_name?.[0] || '•' }}</div>
							<div>
								<p class="eyebrow">{{ review.user_name }}</p>
								<p class="muted">{{ formatDate(review.created_at) }}</p>
							</div>
						</div>
						<div class="review-card__actions">
							<button
								v-if="review.is_owner"
								type="button"
								class="btn ghost danger"
								:disabled="deletingId === review.id"
								@click="handleDelete(review.id)"
							>
								{{ t('contentDetails.reviews.delete') }}
							</button>
						</div>
					</div>
					<p class="review-card__text">{{ review.body }}</p>
				</article>
			</template>
		</div>
	</section>
</template>

<style scoped lang="scss">
.reviews {
	margin-top: 0.5rem;
	padding: 1rem 1.25rem;
	border-radius: 20px;
	background: radial-gradient(120% 140% at 10% 20%, rgba(0, 187, 249, 0.15), transparent 50%),
		radial-gradient(120% 140% at 80% 0%, rgba(255, 143, 58, 0.14), transparent 40%),
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
		align-items: center;
		justify-content: space-between;
		gap: 1rem;

		h3 {
			margin: 0.2rem 0 0;
			font-size: 1.6rem;
		}
	}

	&__title {
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	&__form {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}

	&__form-card {
		display: flex;
		flex-direction: column;
		gap: 0.6rem;
		background: rgba(255, 255, 255, 0.02);
		border-radius: 16px;
		border: 1px solid rgba(255, 255, 255, 0.08);
		padding: 1.1rem;
		box-shadow: inset 0 1px 0 rgba(255, 255, 255, 0.07);
	}

	.form__row {
		display: flex;
		align-items: flex-end;
		gap: 0.75rem;
		flex-wrap: nowrap;

		textarea {
			flex: 1;
			width: 100%;
			min-height: 96px;
			border-radius: 12px;
			padding: 1rem;
			background: rgba(0, 0, 0, 0.35);
			border: 1px solid rgba(255, 255, 255, 0.12);
			color: #ffffff;
			font-size: 1rem;
			resize: vertical;
			transition: border-color 0.18s ease, box-shadow 0.18s ease;

			&:focus {
				outline: none;
				border-color: rgba(0, 187, 249, 0.6);
				box-shadow: 0 0 0 3px rgba(0, 187, 249, 0.15);
			}

			&:disabled {
				opacity: 0.7;
			}
		}
	}

	.form__actions {
		display: flex;
		flex-direction: column;
		gap: 0.35rem;
		align-items: flex-end;
		flex-shrink: 0;
		min-width: 140px;
		white-space: nowrap;

		.btn {
			align-self: stretch;
			justify-content: center;
		}

		.muted {
			white-space: normal;
			text-align: right;
		}
	}

	@media (max-width: 720px) {
		.form__row {
			flex-direction: column;
			align-items: stretch;
		}

		.form__actions {
			align-items: flex-start;
		}
	}

	&__feedback {
		margin: 0;
		color: #c2e7ff;
		font-weight: 700;
		background: rgba(0, 187, 249, 0.12);
		border: 1px solid rgba(0, 187, 249, 0.28);
		padding: 0.65rem 0.9rem;
		border-radius: 12px;
	}

	&__list {
		display: flex;
		flex-direction: column;
		gap: 0.75rem;
	}
}

.muted {
	color: rgba(255, 255, 255, 0.7);
	margin: 0;
	font-size: 0.95rem;
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
		border-top-color: #00bbf9;
		animation: spin 1s linear infinite;
	}
}

.empty {
	margin: 0.5rem 0;
	color: rgba(255, 255, 255, 0.8);
}

.review-card {
	padding: 1.1rem;
	border-radius: 16px;
	background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
	border: 1px solid rgba(255, 255, 255, 0.08);
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		inset: -1px;
		border-radius: inherit;
		padding: 1px;
		background: linear-gradient(135deg, rgba(0, 187, 249, 0.35), rgba(255, 143, 58, 0.3));
		mask: linear-gradient(#000, #000) content-box, linear-gradient(#000, #000);
		mask-composite: exclude;
	}

	&__users {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 0.5rem;

		.eyebrow {
			margin: 0;
		}
	}

	&__identity {
		display: flex;
		align-items: center;
		gap: 0.75rem;
	}

	&__actions {
		display: flex;
		gap: 0.5rem;
		align-items: center;
	}

	&__text {
		margin: 0;
		line-height: 1.6;
		color: rgba(255, 255, 255, 0.9);
		white-space: pre-wrap;
		overflow-wrap: break-word;
		word-break: break-word;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: linear-gradient(135deg, rgba(0, 187, 249, 0.8), rgba(49, 255, 194, 0.7));
		color: #0a0c10;
		font-weight: 800;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: 0 10px 30px rgba(0, 187, 249, 0.25);
	}
}

.btn {
	border: none;
	border-radius: 12px;
	padding: 0.65rem 1rem;
	font-weight: 700;
	cursor: pointer;
	color: #0a0c10;
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.2s ease, opacity 0.2s ease;

	&.primary {
		background: linear-gradient(135deg, #00bbf9, #4cb1ff);
		box-shadow: 0 12px 30px rgba(0, 187, 249, 0.35);
	}

	&.ghost {
		background: transparent;
		color: #e5e7eb;
		border: 1px solid rgba(255, 255, 255, 0.3);
	}

	&.danger {
		border-color: rgba(255, 107, 107, 0.7);
		color: #ffb0b0;
	}

	&:hover:not(:disabled) {
		transform: translateY(-1px);
	}

	&:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}

	&__spinner {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 3px solid rgba(255, 255, 255, 0.4);
		border-top-color: #0a0c10;
		animation: spin 0.9s linear infinite;
	}
}

.eyebrow {
	text-transform: uppercase;
	letter-spacing: 0.08em;
	color: rgba(255, 255, 255, 0.75);
	font-size: 0.85rem;
	margin: 0;
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.reviews__glow {
	position: absolute;
	width: 240px;
	border-radius: 50%;
	filter: blur(90px);
	opacity: 0.4;
	z-index: 0;
	pointer-events: none;

	&--one {
		background: #00bbf9;
		top: -60px;
		right: -70px;
	}

	&--two {
		background: #ff8f3a;
		bottom: -80px;
		left: -40px;
	}
}

.reviews * {
	position: relative;
	z-index: 1;
}
</style>
