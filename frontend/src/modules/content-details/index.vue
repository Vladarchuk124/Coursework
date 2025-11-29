<script setup>
import SaveToListModal from './components/save-to-list-modal.vue';
import ActorsModal from './components/actors-modal.vue';
import ReviewsPanel from './components/reviews-panel.vue';
import RatingStars from './components/rating-stars.vue';
import upArrow from '../../assets/images/up-arrow.png';

import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import { useRoute } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import { actions } from './store/actions';

import { contentTypes } from '../../../enums/content-type';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const route = useRoute();
const store = useStore();

const content = ref(null);
const loading = ref(false);
const error = ref(null);
const isAddModalOpen = ref(false);
const isActorsModalOpen = ref(false);
const userLists = ref([]);
const actors = ref([]);
const listFeedback = ref('');
const listsLoading = ref(false);
const actorsLoading = ref(false);
const showScrollTop = ref(false);

const { locale, t } = useI18n();

const contentId = computed(() => route.params.id);
const contentType = computed(() => route.params.type);
const isAuthenticated = computed(() => store.getters.isAuthenticated);
const userId = computed(() => store.state.session.user?.id);

const posterUrl = computed(() => {
	const path = content.value?.poster_path;
	return path ? `${IMAGE_BASE}/w500${path}` : '';
});

const heroStyle = computed(() => {
	const path = content.value?.backdrop_path || content.value?.poster_path;
	if (!path) return {};
	return {
		backgroundImage: `url("${IMAGE_BASE}/original${path}")`
	};
});

const formattedRuntime = computed(() => {
	const runtime = content.value?.runtime;
	if (!runtime) return null;
	const hours = Math.floor(runtime / 60);
	const minutes = runtime % 60;

	if (!hours) {
		return `${minutes}m`;
	}
	if (!minutes) {
		return `${hours}h`;
	}
	return `${hours}h ${minutes}m`;
});

const formattedReleaseDate = computed(() => {
	const date = content.value?.release_date;
	if (!date) return null;
	try {
		return new Intl.DateTimeFormat(locale.value, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(date));
	} catch (err) {
		return date;
	}
});

const releaseYear = computed(() => {
	if (!content.value?.release_date) return null;
	return new Date(content.value.release_date).getFullYear();
});

const ratingColor = computed(() => {
	const value = Number(content.value?.vote_average);
	if (!Number.isFinite(value)) return '#4c566a';
	if (value < 4) return '#dc3545';
	if (value < 6) return '#ff9800';
	if (value < 8) return '#ffc107';
	if (value < 9) return '#28a745';
	return '#17a2b8';
});

const genresList = computed(() => {
	const genres = content.value?.genres?.map((genre) => genre.name);
	return genres?.length ? genres.join(', ') : null;
});

const spokenLanguages = computed(() => {
	const languages = content.value?.spoken_languages?.map((lang) => lang.english_name || lang.name);
	return languages?.length ? languages.join(', ') : null;
});

const productionCountries = computed(() => {
	const countries = content.value?.production_countries?.map((country) => country.name);
	return countries?.length ? countries.join(', ') : null;
});

const overviewParagraphs = computed(() => {
	if (!content.value?.overview) return [];
	return content.value.overview
		.split('\n')
		.map((paragraph) => paragraph.trim())
		.filter((paragraph) => paragraph.length > 0);
});

const formatCurrency = (amount) => {
	if (!amount) return null;
	try {
		return new Intl.NumberFormat(locale.value, {
			style: 'currency',
			currency: 'USD',
			maximumFractionDigits: 0
		}).format(amount);
	} catch (err) {
		return `$${amount.toLocaleString()}`;
	}
};

const factSheet = computed(() => {
	const facts = [
		{ label: t('contentDetails.status'), value: content.value?.status },
		{ label: t('contentDetails.languages'), value: spokenLanguages.value },
		{ label: t('contentDetails.countries'), value: productionCountries.value }
	];

	if (contentType.value === contentTypes.movie) {
		facts.push(
			{ label: t('contentDetails.budget'), value: formatCurrency(content.value?.budget) },
			{ label: t('contentDetails.revenue'), value: formatCurrency(content.value?.revenue) }
		);
	} else if (contentType.value === contentTypes.show) {
		facts.push(
			{ label: t('contentDetails.seasons'), value: content.value?.number_of_seasons },
			{ label: t('contentDetails.episodes'), value: content.value?.number_of_episodes }
		);
	}
	return facts.map((fact) => ({
		...fact,
		value: fact.value ?? t('contentDetails.noData')
	}));
});

const loadContentDetails = async () => {
	if (!contentId.value) return;

	loading.value = true;
	error.value = null;
	try {
		content.value = await actions.getContentById(contentId.value, contentType.value, locale.value);
	} catch (err) {
		error.value = true;
		console.error('Error loading movie details:', err);
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	loadContentDetails();
	loadUserLists();
	window.addEventListener('scroll', handleScroll, { passive: true });
});

watch([contentId, locale], () => {
	loadContentDetails();
});

onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll);
});

const loadUserLists = async () => {
	if (!userId.value) return;

	listsLoading.value = true;
	const data = await actions.getUserLists(userId.value, contentId.value, contentType.value);
	userLists.value = Array.isArray(data) ? data : [];
	listsLoading.value = false;
};

const openAddModal = async () => {
	listFeedback.value = '';

	if (!isAuthenticated.value || !userId.value) {
		listFeedback.value = t('contentDetails.listModal.authRequired');
		return;
	}

	if (!userLists.value.length) {
		await loadUserLists();
	}

	isAddModalOpen.value = true;
};

const handleCloseAddModal = () => {
	isAddModalOpen.value = false;
};

const openActorsModal = async () => {
	isActorsModalOpen.value = true;

	actorsLoading.value = true;
	const creditsData = await actions.getContentCredits(contentId.value, contentType.value, locale.value);
	actors.value = creditsData?.cast || [];

	actorsLoading.value = false;
};

const handleCloseActorsModal = () => {
	isActorsModalOpen.value = false;
};

const handleConfirmAddModal = async (ids) => {
	const localizeContent = await actions.getContentById(contentId.value, contentType.value, 'uk');
	const data = {
		list_ids: ids,
		...localizeContent
	};
	await actions.addToList(data);
	userLists.value = userLists.value.filter((list) => !ids.includes(Number(list.id)));
	isAddModalOpen.value = false;
};

const handleScroll = () => {
	showScrollTop.value = window.scrollY > 320;
};

const scrollToTop = () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
};
</script>

<template>
	<section class="content-details">
		<div v-if="content" class="background" :style="heroStyle" aria-hidden="true">
			<div class="background-overlay" />
		</div>

		<div v-if="loading" class="loader">
			<div class="loader__spinner" />
			<p>{{ t('contentDetails.loading') }}</p>
		</div>
		<div v-else-if="error" class="loader loader--error">
			<p>{{ t('contentDetails.error') }}</p>
		</div>

		<div v-else-if="content" class="content-section">
			<div class="head-info">
				<div class="poster">
					<img v-if="posterUrl" :src="posterUrl" :alt="content.title" loading="lazy" />
				</div>
				<div class="summary">
					<p class="eyebrow">
						<span v-if="releaseYear">{{ releaseYear }}</span>
						<span v-if="formattedRuntime"> • {{ formattedRuntime }}</span>
						<span v-if="genresList"> • {{ genresList }}</span>
					</p>
					<div class="title">
						<h1>{{ content.title || content.name }}</h1>
						<span class="rating" :style="{ backgroundColor: ratingColor }">
							{{ content.vote_average.toFixed(1) || 0 }}
						</span>
					</div>
					<p class="tagline">
						{{ content.tagline || '' }}
					</p>
					<div class="chips">
						<span v-if="formattedReleaseDate"> {{ t('contentDetails.releaseDate') }}: {{ formattedReleaseDate }} </span>
						<span v-if="formattedRuntime"> {{ t('contentDetails.runtime') }}: {{ formattedRuntime }} </span>
						<span v-if="genresList"> {{ t('contentDetails.genres') }}: {{ genresList }} </span>
					</div>
					<div class="actions">
						<button type="button" class="btn secondary" @click="openActorsModal">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
								<circle cx="9" cy="7" r="4" />
								<path d="M23 21v-2a4 4 0 0 0-3-3.87" />
								<path d="M16 3.13a4 4 0 0 1 0 7.75" />
							</svg>
							{{ t('contentDetails.actors.button') }}
						</button>
						<button v-if="userLists.length" type="button" class="btn primary" @click="openAddModal">
							{{ t('contentDetails.addToList') }}
						</button>
						<span v-if="listFeedback" class="status-note">{{ listFeedback }}</span>
					</div>
				</div>
			</div>

			<div class="foot-info">
				<div class="overview">
					<h2>{{ t('contentDetails.overview') }}</h2>
					<p v-if="overviewParagraphs.length === 0">{{ t('contentDetails.noData') }}</p>
					<p v-for="(paragraph, index) in overviewParagraphs" :key="index">{{ paragraph }}</p>
				</div>
				<div class="key-facts">
					<h2>{{ t('contentDetails.facts') }}</h2>
					<dl>
						<template v-for="fact in factSheet" :key="fact.label">
							<dt>{{ fact.label }}</dt>
							<dd>{{ fact.value }}</dd>
						</template>
					</dl>
				</div>
			</div>
			<RatingStars :content-id="contentId" :content-type="contentType" />
			<ReviewsPanel :content-id="contentId" :content-type="contentType" />
		</div>
		<div v-else class="loader">
			<p>{{ t('contentDetails.notFound') }}</p>
		</div>
		<SaveToListModal
			:show="isAddModalOpen"
			:lists="userLists"
			:loading="listsLoading"
			@close="handleCloseAddModal"
			@confirm="handleConfirmAddModal"
		/>
		<ActorsModal :show="isActorsModalOpen" :actors="actors" :loading="actorsLoading" @close="handleCloseActorsModal" />
		<button v-if="showScrollTop" type="button" class="scroll-top" @click="scrollToTop" aria-label="Back to top">
			<img class="scroll-top__icon" :src="upArrow" alt="" aria-hidden="true" />
		</button>
	</section>
</template>

<style lang="scss" scoped>
.content-details {
	background: var(--bg-color);
	position: relative;
	min-height: 100vh;
	padding: 4rem 2rem;
	color: var(--text-color);
	overflow: hidden;

	.background {
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 100%;
		background-size: cover;
		background-position: center;
		filter: blur(12px);
		transform: scale(1.1);
		opacity: 0.45;

		.background-overlay {
			background: var(--overlay-color);
			position: absolute;
			inset: 0;
		}
	}

	.loader {
		color: var(--text-color);
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		text-align: center;

		&__spinner {
			width: 48px;
			height: 48px;
			border-radius: 50%;
			border-top-color: var(--spinner-accent);
			animation: spin 1s linear infinite;
			border: 4px solid var(--spinner-color);
		}

		&--error {
			color: var(--error-color);
		}
	}

	.content-section {
		position: relative;
		z-index: 1;
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem;
		border-radius: 24px;
		background: var(--card-bg);
		backdrop-filter: blur(12px);
		border: 1px solid var(--card-border);
		box-shadow: var(--shadow-xl);
		display: flex;
		flex-direction: column;
		gap: 2rem;

		.head-info {
			display: flex;
			gap: 2rem;
			align-items: stretch;
			flex-wrap: wrap;
		}

		.foot-info {
			display: grid;
			grid-template-columns: minmax(0, 1fr) minmax(260px, 0.8fr);
			gap: 2rem;
			align-items: start;

			h2 {
				margin-top: 0;
				margin-bottom: 0.6rem;
				font-size: 1.4rem;
			}
		}
	}
}

.poster {
	flex: 0 0 240px;
	border-radius: 20px;
	overflow: hidden;
	background: var(--surface-color);
	box-shadow: var(--shadow-lg);

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}
}

.summary {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 0.8rem;

	h1 {
		font-size: clamp(2rem, 4vw, 3rem);
		margin: 0;
		color: var(--text-color);
	}
}

.eyebrow {
	margin: 0;
	font-size: 0.95rem;
	color: var(--text-color-secondary);
	letter-spacing: 1px;
	text-transform: uppercase;
}

.tagline {
	font-size: 1.2rem;
	font-weight: 500;
	margin: 0;
	color: var(--text-color-secondary);
}

.title {
	display: flex;
	align-items: center;
	gap: 0.7rem;
	font-size: 1rem;
	color: var(--text-color);

	.rating {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.2rem;
		height: 2rem;
		border-radius: 25px;
		font-size: 1.2rem;
		font-weight: 700;
		color: var(--text-color-inverted);
		box-shadow: var(--shadow-md);
	}
}

.chips {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-top: 1rem;

	span {
		background: var(--surface-color-hover);
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		font-size: 0.9rem;
		color: var(--text-color);
	}
}

.actions {
	display: flex;
	flex-wrap: wrap;
	align-items: center;
	gap: 0.75rem;
	margin-top: 1rem;

	.status-note {
		color: var(--text-color);
		font-weight: 600;
	}

	.btn svg {
		width: 1.1rem;
		height: 1.1rem;
	}
}

.overview {
	font-size: 1rem;
	line-height: 1.8;
	color: var(--text-color-secondary);

	h2 {
		color: var(--text-color);
	}

	p {
		margin-bottom: 1rem;
	}
}

.key-facts {
	padding: 1.5rem;
	border-radius: 20px;
	background: var(--surface-color-hover);
	border: 1px solid var(--border-color-light);

	h2 {
		color: var(--text-color);
	}

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.4rem 1rem;
		margin: 0;
	}

	dt {
		font-weight: 600;
		color: var(--text-color-secondary);
	}

	dd {
		margin: 0;
		color: var(--text-color);
		font-weight: 500;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.scroll-top {
	position: fixed;
	bottom: 22px;
	right: 22px;
	background: var(--accent-gradient);
	color: var(--btn-primary-text);
	border: none;
	border-radius: 50%;
	width: 48px;
	height: 48px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	box-shadow: var(--btn-primary-shadow);
	cursor: pointer;
	transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
	z-index: 20;

	&:hover {
		transform: translateY(-2px);
	}

	&__icon {
		width: 22px;
		height: 22px;
		object-fit: contain;
		display: block;
	}
}

@media (max-width: 768px) {
	.content-details {
		padding: 2rem 1rem;

		.content-section {
			padding: 1.5rem;

			.head-info {
				flex-direction: column;
			}

			.foot-info {
				grid-template-columns: 1fr;
			}
		}
	}

	.poster {
		flex: 0 0 auto;
		max-width: 200px;
		margin: 0 auto;
	}
}
</style>
