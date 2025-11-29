<script setup>
import { computed, onMounted, ref, watch, nextTick } from 'vue';
import { useStore } from 'vuex';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { actions } from '../store/actions';
import { actions as adminActions } from '../../admin/store/actions';

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
const route = useRoute();
const { t, locale } = useI18n();

const reviews = ref([]);
const form = ref({ text: '' });
const loading = ref(false);
const saving = ref(false);
const deletingId = ref(null);
const reportingId = ref(null);
const reportReason = ref('');
const showReportModal = ref(false);
const selectedReviewForReport = ref(null);
const feedback = ref('');

const isAuthenticated = computed(() => store.getters.isAuthenticated);
const userId = computed(() => store.state.session.user?.id);
const isAdmin = computed(() => store.getters.isAdmin);
const highlightReviewId = computed(() => (route.query.highlight_review ? Number(route.query.highlight_review) : null));

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

const openReportModal = (review) => {
	if (!isAuthenticated.value) {
		feedback.value = t('contentDetails.reviews.loginRequired');
		return;
	}
	selectedReviewForReport.value = review;
	reportReason.value = '';
	showReportModal.value = true;
};

const closeReportModal = () => {
	showReportModal.value = false;
	selectedReviewForReport.value = null;
	reportReason.value = '';
};

const handleReport = async () => {
	if (!userId.value || !selectedReviewForReport.value) return;
	if (!reportReason.value.trim()) {
		feedback.value = t('contentDetails.reviews.reportReasonRequired');
		return;
	}

	reportingId.value = selectedReviewForReport.value.id;
	try {
		await adminActions.createReport({
			reporter_id: userId.value,
			review_id: selectedReviewForReport.value.id,
			reason: reportReason.value.trim(),
			content_id: props.contentId,
			content_type: props.contentType
		});
		feedback.value = t('contentDetails.reviews.reportSent');
		closeReportModal();
	} catch (error) {
		feedback.value = error.message;
	} finally {
		reportingId.value = null;
	}
};

const handleAdminDelete = async (reviewId) => {
	if (!userId.value || !isAdmin.value) return;
	const confirmed = window.confirm(t('admin.deleteReviewConfirm'));
	if (!confirmed) return;

	deletingId.value = reviewId;
	try {
		await adminActions.deleteReview(reviewId, userId.value);
		await loadReviews();
	} catch (error) {
		feedback.value = error.message;
	} finally {
		deletingId.value = null;
	}
};

const scrollToHighlightedReview = () => {
	if (!highlightReviewId.value) return;
	nextTick(() => {
		setTimeout(() => {
			const el = document.getElementById(`review-${highlightReviewId.value}`);
			if (el) {
				const currentScrollY = window.scrollY || window.pageYOffset;
				const rect = el.getBoundingClientRect();
				const headerOffset = 100;
				const targetY = currentScrollY + rect.top - window.innerHeight / 2 + rect.height / 2 + headerOffset;

				window.scrollTo({
					top: Math.max(0, targetY),
					behavior: 'smooth'
				});

				el.classList.add('highlighted');
			}
		}, 300);
	});
};

onMounted(async () => {
	await loadReviews();
	if (highlightReviewId.value) {
		if (document.readyState === 'complete') {
			scrollToHighlightedReview();
		} else {
			window.addEventListener(
				'load',
				() => {
					scrollToHighlightedReview();
				},
				{ once: true }
			);
		}
	}
});
watch(
	() => [props.contentId, props.contentType, userId.value],
	async () => {
		await loadReviews();
		if (highlightReviewId.value) {
			setTimeout(() => {
				scrollToHighlightedReview();
			}, 200);
		}
	}
);

watch(
	() => highlightReviewId.value,
	(newVal) => {
		if (newVal && !loading.value && reviews.value.length > 0) {
			scrollToHighlightedReview();
		}
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
				<article
					v-for="review in reviews"
					:key="review.id"
					:id="`review-${review.id}`"
					class="review-card"
					:class="{ 'review-card--highlighted': highlightReviewId === review.id }"
				>
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
								v-if="isAdmin && !review.is_owner"
								type="button"
								class="btn ghost danger"
								:disabled="deletingId === review.id"
								@click="handleAdminDelete(review.id)"
							>
								{{ t('admin.deleteReview') }}
							</button>
							<button
								v-if="review.is_owner"
								type="button"
								class="btn ghost danger"
								:disabled="deletingId === review.id"
								@click="handleDelete(review.id)"
							>
								{{ t('contentDetails.reviews.delete') }}
							</button>
							<button
								v-if="isAuthenticated && !review.is_owner"
								type="button"
								class="btn ghost warning"
								:disabled="reportingId === review.id"
								@click="openReportModal(review)"
							>
								{{ t('contentDetails.reviews.report') }}
							</button>
						</div>
					</div>
					<p class="review-card__text">{{ review.body }}</p>
				</article>
			</template>
		</div>
	</section>

	<Teleport to="body">
		<div v-if="showReportModal" class="modal-overlay" @click.self="closeReportModal">
			<div class="modal">
				<div class="modal__header">
					<h3>{{ t('contentDetails.reviews.reportTitle') }}</h3>
					<button class="modal__close" @click="closeReportModal">×</button>
				</div>
				<div class="modal__body">
					<p class="modal__subtitle">{{ t('contentDetails.reviews.reportSubtitle') }}</p>
					<div class="modal__review-preview">
						<p class="eyebrow">{{ selectedReviewForReport?.user_name }}</p>
						<p class="review-text">{{ selectedReviewForReport?.body }}</p>
					</div>
					<textarea
						v-model="reportReason"
						class="modal__textarea"
						:placeholder="t('contentDetails.reviews.reportPlaceholder')"
						rows="3"
					></textarea>
				</div>
				<div class="modal__footer">
					<button class="btn ghost" @click="closeReportModal">
						{{ t('contentDetails.listModal.cancelButton') }}
					</button>
					<button class="btn danger" :disabled="reportingId !== null || !reportReason.trim()" @click="handleReport">
						{{ t('contentDetails.reviews.sendReport') }}
					</button>
				</div>
			</div>
		</div>
	</Teleport>
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

	&.warning {
		border-color: rgba(246, 173, 85, 0.7);
		color: #f6ad55;
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

.review-card--highlighted {
	animation: highlight-pulse 2s ease-out;
	border-color: rgba(255, 107, 107, 0.5) !important;

	&::before {
		background: linear-gradient(135deg, rgba(255, 107, 107, 0.5), rgba(255, 143, 58, 0.4)) !important;
	}
}

@keyframes highlight-pulse {
	0% {
		box-shadow: 0 0 0 0 rgba(255, 107, 107, 0.6);
	}
	50% {
		box-shadow: 0 0 20px 5px rgba(255, 107, 107, 0.4);
	}
	100% {
		box-shadow: 0 0 0 0 rgba(255, 107, 107, 0);
	}
}

.modal-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 1rem;
}

.modal {
	background: linear-gradient(145deg, rgba(20, 25, 35, 0.98), rgba(15, 20, 30, 0.98));
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 20px;
	width: 100%;
	max-width: 480px;
	overflow: hidden;
	box-shadow: 0 25px 80px rgba(0, 0, 0, 0.5);

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid rgba(255, 255, 255, 0.08);

		h3 {
			margin: 0;
			color: #fff;
			font-size: 1.2rem;
		}
	}

	&__close {
		background: transparent;
		border: none;
		color: rgba(255, 255, 255, 0.6);
		font-size: 1.8rem;
		cursor: pointer;
		line-height: 1;
		padding: 0;
		transition: color 0.2s;

		&:hover {
			color: #fff;
		}
	}

	&__body {
		padding: 1.5rem;
		display: flex;
		flex-direction: column;
		gap: 1rem;
	}

	&__subtitle {
		margin: 0;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.95rem;
	}

	&__review-preview {
		padding: 1rem;
		background: rgba(0, 0, 0, 0.3);
		border-radius: 12px;
		border-left: 3px solid rgba(255, 107, 107, 0.6);

		.eyebrow {
			margin: 0 0 0.5rem;
			font-size: 0.8rem;
		}

		.review-text {
			margin: 0;
			color: rgba(255, 255, 255, 0.85);
			font-size: 0.95rem;
			line-height: 1.5;
		}
	}

	&__textarea {
		width: 92%;
		padding: 1rem;
		background: rgba(0, 0, 0, 0.35);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 12px;
		color: #fff;
		font-size: 1rem;
		resize: vertical;
		min-height: 80px;

		&:focus {
			outline: none;
			border-color: rgba(255, 107, 107, 0.5);
		}

		&::placeholder {
			color: rgba(255, 255, 255, 0.4);
		}
	}

	&__footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
		background: rgba(0, 0, 0, 0.2);
	}
}

.btn.danger:not(.ghost) {
	background: linear-gradient(135deg, #ff6b6b, #ee5a24);
	color: white;
	border: none;

	&:hover:not(:disabled) {
		transform: translateY(-1px);
		box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
	}
}
</style>
