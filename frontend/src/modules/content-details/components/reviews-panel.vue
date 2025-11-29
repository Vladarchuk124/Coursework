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
								@click="() => handleAdminDelete(review.id)"
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
		align-items: center;
		justify-content: space-between;
		gap: 1rem;

		h3 {
			margin: 0.2rem 0 0;
			font-size: 1.6rem;
			color: var(--text-color);
		}
	}

	&__title {
		display: flex;
		flex-direction: column;
		gap: 0.5rem;
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
		background: var(--surface-color-hover);
		border-radius: 16px;
		border: 1px solid var(--border-color);
		padding: 1.1rem;
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
			background: var(--input-bg);
			border: 1px solid var(--input-border);
			color: var(--text-color);
			font-size: 1rem;
			resize: vertical;
			transition: border-color 0.18s ease, box-shadow 0.18s ease;

			&:focus {
				outline: none;
				border-color: var(--input-focus-border);
				box-shadow: var(--input-focus-shadow);
			}

			&:disabled {
				opacity: 0.7;
			}

			&::placeholder {
				color: var(--text-color-tertiary);
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
		color: var(--info-color);
		font-weight: 700;
		background: var(--info-bg);
		border: 1px solid var(--info-border);
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
	color: var(--text-color-secondary);
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
		border: 3px solid var(--spinner-color);
		border-top-color: var(--spinner-accent);
		animation: spin 1s linear infinite;
	}
}

.empty {
	margin: 0.5rem 0;
	color: var(--text-color-secondary);
}

.review-card {
	padding: 1.1rem;
	border-radius: 16px;
	background: var(--surface-color-hover);
	border: 1px solid var(--border-color);
	display: flex;
	flex-direction: column;
	gap: 0.5rem;

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
		color: var(--text-color);
		white-space: pre-wrap;
		overflow-wrap: break-word;
		word-break: break-word;
	}

	.avatar {
		width: 40px;
		height: 40px;
		border-radius: 12px;
		background: var(--accent-gradient);
		color: var(--btn-primary-text);
		font-weight: 800;
		display: inline-flex;
		align-items: center;
		justify-content: center;
		box-shadow: var(--shadow-sm);
	}
}

.btn {
	&.ghost {
		padding: 0.5rem 0.75rem;
		font-size: 0.85rem;

		&.danger {
			border-color: var(--error-border);
			color: var(--error-color);
		}

		&.warning {
			border-color: var(--warning-border);
			color: var(--warning-color);
		}
	}

	&__spinner {
		width: 16px;
		height: 16px;
		border-radius: 50%;
		border: 3px solid var(--spinner-color);
		border-top-color: var(--btn-primary-text);
		animation: spin 0.9s linear infinite;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.review-card--highlighted {
	animation: highlight-pulse 2s ease-out;
	border-color: var(--error-color) !important;
}

@keyframes highlight-pulse {
	0% {
		box-shadow: 0 0 0 0 var(--error-border);
	}
	50% {
		box-shadow: 0 0 20px 5px var(--error-border);
	}
	100% {
		box-shadow: 0 0 0 0 transparent;
	}
}

.modal-overlay {
	position: fixed;
	inset: 0;
	background: var(--modal-backdrop);
	backdrop-filter: blur(4px);
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;
	padding: 1rem;
}

.modal {
	background: var(--modal-bg);
	border: 1px solid var(--border-color);
	border-radius: 20px;
	width: 100%;
	max-width: 480px;
	overflow: hidden;
	box-shadow: var(--shadow-xl);

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		padding: 1.25rem 1.5rem;
		border-bottom: 1px solid var(--border-color);

		h3 {
			margin: 0;
			color: var(--text-color);
			font-size: 1.2rem;
		}
	}

	&__close {
		background: transparent;
		border: none;
		color: var(--text-color-secondary);
		font-size: 1.8rem;
		cursor: pointer;
		line-height: 1;
		padding: 0;
		transition: color 0.2s;

		&:hover {
			color: var(--text-color);
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
		color: var(--text-color-secondary);
		font-size: 0.95rem;
	}

	&__review-preview {
		padding: 1rem;
		background: var(--input-bg);
		border-radius: 12px;
		border-left: 3px solid var(--error-color);

		.eyebrow {
			margin: 0 0 0.5rem;
			font-size: 0.8rem;
		}

		.review-text {
			margin: 0;
			color: var(--text-color);
			font-size: 0.95rem;
			line-height: 1.5;
		}
	}

	&__textarea {
		width: 92%;
		padding: 1rem;
		background: var(--input-bg);
		border: 1px solid var(--input-border);
		border-radius: 12px;
		color: var(--text-color);
		font-size: 1rem;
		resize: vertical;
		min-height: 80px;

		&:focus {
			outline: none;
			border-color: var(--error-color);
		}

		&::placeholder {
			color: var(--text-color-tertiary);
		}
	}

	&__footer {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
		padding: 1rem 1.5rem;
		border-top: 1px solid var(--border-color);
		background: var(--surface-color);
	}
}
</style>
