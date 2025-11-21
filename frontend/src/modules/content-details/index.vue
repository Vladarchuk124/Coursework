<script setup>
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { actions } from './store/actions';
import { useI18n } from 'vue-i18n';
import { contentTypes } from '../../../enums/content-type';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const route = useRoute();
const content = ref(null);
const loading = ref(false);
const error = ref(null);

const { locale, t } = useI18n();

const contentId = computed(() => route.params.id);
const contentType = computed(() => route.params.type);

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
	const rating = content.value?.vote_average ?? 0;
	if (!rating) return '#4c566a';
	if (rating < 4) return '#dc3545';
	if (rating < 6) return '#ff9800';
	if (rating < 8) return '#ffc107';
	if (rating < 9) return '#28a745';
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
		{ label: t('content-details.status'), value: content.value?.status },
		{ label: t('content-details.languages'), value: spokenLanguages.value },
		{ label: t('content-details.countries'), value: productionCountries.value }
	];

	if (contentType.value === contentTypes.movie) {
		facts.push(
			{ label: t('content-details.budget'), value: formatCurrency(content.value?.budget) },
			{ label: t('content-details.revenue'), value: formatCurrency(content.value?.revenue) }
		);
	} else if (contentType.value === contentTypes.show) {
		facts.push(
			{ label: t('content-details.seasons'), value: content.value?.number_of_seasons },
			{ label: t('content-details.episodes'), value: content.value?.number_of_episodes }
		);
	}
	return facts.map((fact) => ({
		...fact,
		value: fact.value ?? t('content-details.noData')
	}));
});

const loadContentDetails = async () => {
	if (!contentId.value) return;

	loading.value = true;
	error.value = null;
	try {
		content.value = await actions.getContentById(contentId.value, contentType.value, locale.value);
		console.log(content.value);
	} catch (err) {
		error.value = true;
		console.error('Error loading movie details:', err);
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	loadContentDetails();
});

watch([contentId, locale], () => {
	loadContentDetails();
});
</script>

<template>
	<section class="content-details">
		<div v-if="content" class="background" :style="heroStyle" aria-hidden="true">
			<div class="background-overlay" />
		</div>

		<div v-if="loading" class="loader">
			<div class="loader__spinner" />
			<p>{{ t('content-details.loading') }}</p>
		</div>
		<div v-else-if="error" class="loader loader--error">
			<p>{{ t('content-details.loadError') }}</p>
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
						<span v-if="formattedReleaseDate">{{ t('content-details.releaseDate') }}: {{ formattedReleaseDate }}</span>
						<span v-if="formattedRuntime">{{ t('content-details.runtime') }}: {{ formattedRuntime }}</span>
						<span v-if="genresList">{{ t('content-details.genres') }}: {{ genresList }}</span>
					</div>
				</div>
			</div>

			<div class="foot-info">
				<div class="overview">
					<h2>{{ t('content-details.overview') }}</h2>
					<p v-if="overviewParagraphs.length === 0">{{ t('content-details.noData') }}</p>
					<p v-for="(paragraph, index) in overviewParagraphs" :key="index">{{ paragraph }}</p>
				</div>
				<div class="key-facts">
					<h2>{{ t('content-details.facts') }}</h2>
					<dl>
						<template v-for="fact in factSheet" :key="fact.label">
							<dt>{{ fact.label }}</dt>
							<dd>{{ fact.value }}</dd>
						</template>
					</dl>
				</div>
			</div>
		</div>
		<div v-else class="loader">
			<p>{{ t('content-details.missing') }}</p>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.content-details {
	position: relative;
	min-height: 100vh;
	padding: 4rem 2rem;
	color: #f4f4f4;
	background-color: #050608;
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
			position: absolute;
			inset: 0;
			background: linear-gradient(120deg, rgba(5, 6, 8, 0.8) 20%, rgba(5, 6, 8, 0.9) 70%);
		}
	}

	.loader {
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		text-align: center;
		color: rgba(255, 255, 255, 0.85);

		&__spinner {
			width: 48px;
			height: 48px;
			border-radius: 50%;
			border: 4px solid rgba(255, 255, 255, 0.2);
			border-top-color: #00bbf9;
			animation: spin 1s linear infinite;
		}

		&--error {
			color: #ff6b6b;
		}
	}

	.content-section {
		position: relative;
		z-index: 1;
		max-width: 1100px;
		margin: 0 auto;
		padding: 2rem;
		border-radius: 24px;
		background: rgba(8, 10, 15, 0.8);
		backdrop-filter: blur(12px);
		box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
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
	background: rgba(255, 255, 255, 0.02);
	box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);

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
		color: #ffffff;
	}
}

.eyebrow {
	margin: 0;
	font-size: 0.95rem;
	color: rgba(255, 255, 255, 0.65);
	letter-spacing: 1px;
	text-transform: uppercase;
}

.tagline {
	font-size: 1.2rem;
	font-weight: 500;
	margin: 0;
}

.title {
	display: flex;
	align-items: center;
	gap: 0.7rem;
	font-size: 1rem;
	color: rgba(255, 255, 255, 0.85);

	.rating {
		display: inline-flex;
		align-items: center;
		justify-content: center;
		width: 3.2rem;
		height: 2rem;
		border-radius: 25px;
		font-size: 1.2rem;
		font-weight: 700;
		color: #ffffff;
		box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
	}
}

.chips {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	margin-top: 1rem;

	span {
		background: rgba(255, 255, 255, 0.08);
		padding: 0.4rem 0.9rem;
		border-radius: 999px;
		font-size: 0.9rem;
	}
}

.overview {
	font-size: 1rem;
	line-height: 1.8;
	color: rgba(255, 255, 255, 0.85);

	p {
		margin-bottom: 1rem;
	}
}

.key-facts {
	padding: 1.5rem;
	border-radius: 20px;
	background: rgba(255, 255, 255, 0.03);
	border: 1px solid rgba(255, 255, 255, 0.05);

	dl {
		display: grid;
		grid-template-columns: max-content 1fr;
		gap: 0.4rem 1rem;
		margin: 0;
	}

	dt {
		font-weight: 600;
		color: rgba(255, 255, 255, 0.75);
	}

	dd {
		margin: 0;
		color: #ffffff;
		font-weight: 500;
	}
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 900px) {
	.foot-info {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 700px) {
	.content-details {
		padding: 2rem 1.5rem;
	}

	.content-section {
		padding: 1.5rem;
	}

	.head-info {
		flex-direction: column;
	}

	.poster {
		width: 100%;
	}
}
</style>
