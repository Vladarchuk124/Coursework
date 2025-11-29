<script setup>
import { ref, computed, onMounted } from 'vue';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { actions } from './store/actions';

const store = useStore();
const router = useRouter();
const { t, locale } = useI18n();

const reports = ref([]);
const loading = ref(true);
const processingId = ref(null);

const isAdmin = computed(() => store.getters.isAdmin);
const userId = computed(() => store.state.session.user?.id);

const formatDate = (dateValue) => {
	if (!dateValue) return '';
	try {
		return new Intl.DateTimeFormat(locale.value, {
			year: 'numeric',
			month: 'short',
			day: 'numeric',
			hour: '2-digit',
			minute: '2-digit'
		}).format(new Date(dateValue));
	} catch {
		return dateValue;
	}
};

const loadReports = async () => {
	if (!isAdmin.value || !userId.value) return;
	loading.value = true;
	const data = await actions.getReports(userId.value);
	reports.value = data || [];
	loading.value = false;
};

const goToContent = (report) => {
	router.push(`/content-details/${report.content_type}/${report.content_id}?highlight_review=${report.review.id}`);
};

const handleBlockUser = async (report) => {
	if (!userId.value) return;
	const confirmed = window.confirm(t('admin.blockConfirm', { name: report.reported_user.name }));
	if (!confirmed) return;

	processingId.value = report.id;
	await actions.blockUser(report.reported_user.id, userId.value);
	await loadReports();
	processingId.value = null;
};

const handleUnblockUser = async (report) => {
	if (!userId.value) return;
	processingId.value = report.id;
	await actions.unblockUser(report.reported_user.id, userId.value);
	await loadReports();
	processingId.value = null;
};

const handleDeleteReview = async (report) => {
	if (!userId.value) return;
	const confirmed = window.confirm(t('admin.deleteReviewConfirm'));
	if (!confirmed) return;

	processingId.value = report.id;
	await actions.deleteReview(report.review.id, userId.value);
	await loadReports();
	processingId.value = null;
};

const handleDismissReport = async (report) => {
	if (!userId.value) return;
	const confirmed = window.confirm(t('admin.dismissConfirm'));
	if (!confirmed) return;

	processingId.value = report.id;
	await actions.deleteReport(report.id, userId.value);
	await loadReports();
	processingId.value = null;
};

onMounted(() => {
	if (!isAdmin.value) {
		router.push('/');
		return;
	}
	loadReports();
});
</script>

<template>
	<div class="admin-page">
		<div class="admin-page__container">
			<div class="admin-page__header">
				<div class="admin-page__title-section">
					<span class="badge">{{ t('admin.badge') }}</span>
					<h1>{{ t('admin.title') }}</h1>
					<p class="subtitle">{{ t('admin.subtitle') }}</p>
				</div>
				<div class="admin-page__stats">
					<div class="stat-card">
						<span class="stat-value">{{ reports.length }}</span>
						<span class="stat-label">{{ t('admin.totalReports') }}</span>
					</div>
				</div>
			</div>

			<div v-if="loading" class="loader">
				<div class="loader__spinner" />
				<span>{{ t('admin.loading') }}</span>
			</div>

			<div v-else-if="!reports.length" class="empty-state">
				<div class="empty-state__icon">✓</div>
				<h3>{{ t('admin.noReports') }}</h3>
				<p>{{ t('admin.noReportsDescription') }}</p>
			</div>

			<div v-else class="reports-list">
				<article v-for="report in reports" :key="report.id" class="report-card">
					<div class="report-card__header">
						<div class="report-card__users">
							<div class="user-info">
								<span class="user-label">{{ t('admin.reporter') }}:</span>
								<span class="user-name">{{ report.reporter.name }}</span>
							</div>
							<span class="arrow">→</span>
							<div class="user-info">
								<span class="user-label">{{ t('admin.reportedUser') }}:</span>
								<span class="user-name" :class="{ blocked: report.reported_user.is_blocked }">
									{{ report.reported_user.name }}
									<span v-if="report.reported_user.is_blocked" class="blocked-badge">{{ t('admin.blocked') }}</span>
								</span>
							</div>
						</div>
						<span class="report-card__date">{{ formatDate(report.created_at) }}</span>
					</div>

					<div class="report-card__reason">
						<span class="reason-label">{{ t('admin.reason') }}:</span>
						<p class="reason-text">{{ report.reason }}</p>
					</div>

					<div class="report-card__review">
						<span class="review-label">{{ t('admin.reviewContent') }}:</span>
						<p class="review-text">{{ report.review.body }}</p>
						<button class="btn link" @click="goToContent(report)">{{ t('admin.viewInContext') }} →</button>
					</div>

					<div class="report-card__actions">
						<button class="btn danger" :disabled="processingId === report.id" @click="handleDeleteReview(report)">
							{{ t('admin.deleteReview') }}
						</button>
						<button
							v-if="!report.reported_user.is_blocked"
							class="btn warning"
							:disabled="processingId === report.id"
							@click="handleBlockUser(report)"
						>
							{{ t('admin.blockUser') }}
						</button>
						<button
							v-else
							class="btn success"
							:disabled="processingId === report.id"
							@click="handleUnblockUser(report)"
						>
							{{ t('admin.unblockUser') }}
						</button>
						<button class="btn ghost" :disabled="processingId === report.id" @click="handleDismissReport(report)">
							{{ t('admin.dismiss') }}
						</button>
					</div>
				</article>
			</div>
		</div>
	</div>
</template>

<style scoped lang="scss">
.admin-page {
	padding: 2rem;

	&__container {
		max-width: 1000px;
		margin: 0 auto;
	}

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: flex-start;
		margin-bottom: 2rem;
		gap: 2rem;
		flex-wrap: wrap;
	}

	&__title-section {
		.badge {
			display: inline-block;
			padding: 0.35rem 0.8rem;
			background: linear-gradient(135deg, #ff6b6b, #ee5a24);
			color: white;
			font-size: 0.75rem;
			font-weight: 700;
			text-transform: uppercase;
			letter-spacing: 0.1em;
			border-radius: 20px;
			margin-bottom: 0.75rem;
		}

		h1 {
			margin: 0 0 0.5rem;
			font-size: 2.2rem;
			background: linear-gradient(135deg, #fff, #a0aec0);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		.subtitle {
			margin: 0;
			color: rgba(255, 255, 255, 0.6);
			font-size: 1rem;
		}
	}

	&__stats {
		.stat-card {
			display: flex;
			flex-direction: column;
			align-items: center;
			padding: 1rem 1.5rem;
			background: rgba(255, 107, 107, 0.1);
			border: 1px solid rgba(255, 107, 107, 0.3);
			border-radius: 16px;

			.stat-value {
				font-size: 2rem;
				font-weight: 700;
				color: #ff6b6b;
			}

			.stat-label {
				font-size: 0.85rem;
				color: rgba(255, 255, 255, 0.7);
			}
		}
	}
}

.loader {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 1rem;
	padding: 3rem;
	color: rgba(255, 255, 255, 0.8);

	&__spinner {
		width: 24px;
		height: 24px;
		border-radius: 50%;
		border: 3px solid rgba(255, 255, 255, 0.2);
		border-top-color: #ff6b6b;
		animation: spin 1s linear infinite;
	}
}

.error-message {
	padding: 1.5rem;
	background: rgba(255, 107, 107, 0.1);
	border: 1px solid rgba(255, 107, 107, 0.3);
	border-radius: 12px;
	color: #ff6b6b;
	text-align: center;
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	padding: 4rem 2rem;
	text-align: center;

	&__icon {
		width: 80px;
		height: 80px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 2.5rem;
		background: linear-gradient(135deg, rgba(72, 187, 120, 0.2), rgba(72, 187, 120, 0.1));
		border: 2px solid rgba(72, 187, 120, 0.4);
		border-radius: 50%;
		margin-bottom: 1.5rem;
		color: #48bb78;
	}

	h3 {
		margin: 0 0 0.5rem;
		color: #fff;
		font-size: 1.4rem;
	}

	p {
		margin: 0;
		color: rgba(255, 255, 255, 0.6);
	}
}

.reports-list {
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
}

.report-card {
	padding: 1.5rem;
	background: linear-gradient(145deg, rgba(255, 255, 255, 0.04), rgba(255, 255, 255, 0.01));
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 20px;
	display: flex;
	flex-direction: column;
	gap: 1rem;
	position: relative;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 3px;
		background: linear-gradient(90deg, #ff6b6b, #ee5a24);
	}

	&__header {
		display: flex;
		justify-content: space-between;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;
	}

	&__users {
		display: flex;
		align-items: center;
		gap: 1rem;
		flex-wrap: wrap;

		.user-info {
			display: flex;
			flex-direction: column;
			gap: 0.2rem;

			.user-label {
				font-size: 0.75rem;
				color: rgba(255, 255, 255, 0.5);
				text-transform: uppercase;
				letter-spacing: 0.05em;
			}

			.user-name {
				color: #fff;
				font-weight: 600;

				&.blocked {
					color: #ff6b6b;
				}

				.blocked-badge {
					display: inline-block;
					margin-left: 0.5rem;
					padding: 0.15rem 0.5rem;
					background: rgba(255, 107, 107, 0.2);
					border: 1px solid rgba(255, 107, 107, 0.4);
					border-radius: 10px;
					font-size: 0.7rem;
					font-weight: 700;
					text-transform: uppercase;
				}
			}
		}

		.arrow {
			color: rgba(255, 255, 255, 0.4);
			font-size: 1.2rem;
		}
	}

	&__date {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.5);
	}

	&__reason {
		.reason-label {
			display: block;
			font-size: 0.75rem;
			color: rgba(255, 255, 255, 0.5);
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 0.4rem;
		}

		.reason-text {
			margin: 0;
			padding: 0.75rem 1rem;
			background: rgba(255, 107, 107, 0.08);
			border-left: 3px solid #ff6b6b;
			border-radius: 0 8px 8px 0;
			color: rgba(255, 255, 255, 0.9);
			font-style: italic;
		}
	}

	&__review {
		.review-label {
			display: block;
			font-size: 0.75rem;
			color: rgba(255, 255, 255, 0.5);
			text-transform: uppercase;
			letter-spacing: 0.05em;
			margin-bottom: 0.4rem;
		}

		.review-text {
			margin: 0 0 0.75rem;
			padding: 0.75rem 1rem;
			background: rgba(0, 0, 0, 0.3);
			border-radius: 8px;
			color: rgba(255, 255, 255, 0.85);
			line-height: 1.5;
			white-space: pre-wrap;
			word-break: break-word;
		}
	}

	&__actions {
		display: flex;
		gap: 0.75rem;
		flex-wrap: wrap;
		padding-top: 0.5rem;
		border-top: 1px solid rgba(255, 255, 255, 0.08);
	}
}

.btn {
	border: none;
	border-radius: 10px;
	padding: 0.6rem 1rem;
	font-weight: 600;
	font-size: 0.9rem;
	cursor: pointer;
	transition: all 0.2s ease;

	&.danger {
		background: linear-gradient(135deg, #ff6b6b, #ee5a24);
		color: white;

		&:hover:not(:disabled) {
			transform: translateY(-1px);
			box-shadow: 0 4px 15px rgba(255, 107, 107, 0.4);
		}
	}

	&.warning {
		background: linear-gradient(135deg, #f6ad55, #ed8936);
		color: #1a1a2e;

		&:hover:not(:disabled) {
			transform: translateY(-1px);
			box-shadow: 0 4px 15px rgba(246, 173, 85, 0.4);
		}
	}

	&.success {
		background: linear-gradient(135deg, #48bb78, #38a169);
		color: white;

		&:hover:not(:disabled) {
			transform: translateY(-1px);
			box-shadow: 0 4px 15px rgba(72, 187, 120, 0.4);
		}
	}

	&.ghost {
		background: transparent;
		color: rgba(255, 255, 255, 0.7);
		border: 1px solid rgba(255, 255, 255, 0.2);

		&:hover:not(:disabled) {
			background: rgba(255, 255, 255, 0.05);
			border-color: rgba(255, 255, 255, 0.3);
		}
	}

	&.link {
		background: transparent;
		color: #00bbf9;
		padding: 0;

		&:hover {
			text-decoration: underline;
		}
	}

	&:disabled {
		opacity: 0.5;
		cursor: not-allowed;
		transform: none !important;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 640px) {
	.admin-page {
		padding: 1rem;

		&__header {
			flex-direction: column;
		}
	}

	.report-card__users {
		flex-direction: column;
		align-items: flex-start;

		.arrow {
			transform: rotate(90deg);
		}
	}
}
</style>
