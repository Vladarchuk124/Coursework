<script setup>
// todo : refactor this page
import { ref, onMounted, watch, computed } from 'vue';
import { useRoute } from 'vue-router';
import { actions } from './store/actions';
import { useI18n } from 'vue-i18n';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const route = useRoute();
const movie = ref(null);
const loading = ref(false);
const error = ref(null);

const { locale, t } = useI18n();

const movieId = computed(() => route.params.id);

const posterUrl = computed(() => {
	const path = movie.value?.poster_path;
	return path ? `${IMAGE_BASE}/w500${path}` : '';
});

const heroStyle = computed(() => {
	const path = movie.value?.backdrop_path || movie.value?.poster_path;
	if (!path) return {};
	return {
		backgroundImage: `url("${IMAGE_BASE}/original${path}")`
	};
});

const formattedRuntime = computed(() => {
	const runtime = movie.value?.runtime;
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
	const date = movie.value?.release_date;
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
	if (!movie.value?.release_date) return null;
	return new Date(movie.value.release_date).getFullYear();
});

const ratingValue = computed(() => {
	if (!movie.value?.vote_average) return null;
	return movie.value.vote_average.toFixed(1);
});

const voteCount = computed(() => {
	if (!movie.value?.vote_count) return null;
	try {
		return new Intl.NumberFormat(locale.value).format(movie.value.vote_count);
	} catch (err) {
		return movie.value.vote_count;
	}
});

const ratingColor = computed(() => {
	const rating = movie.value?.vote_average ?? 0;
	if (!rating) return '#4c566a';
	if (rating < 4) return '#dc3545';
	if (rating < 6) return '#ff9800';
	if (rating < 8) return '#ffc107';
	if (rating < 9) return '#28a745';
	return '#17a2b8';
});

const genresList = computed(() => {
	const genres = movie.value?.genres?.map((genre) => genre.name);
	return genres?.length ? genres.join(', ') : null;
});

const spokenLanguages = computed(() => {
	const languages = movie.value?.spoken_languages?.map((lang) => lang.english_name || lang.name);
	return languages?.length ? languages.join(', ') : null;
});

const productionCountries = computed(() => {
	const countries = movie.value?.production_countries?.map((country) => country.name);
	return countries?.length ? countries.join(', ') : null;
});

const overviewParagraphs = computed(() => {
	if (!movie.value?.overview) return [];
	return movie.value.overview
		.split('\n')
		.map((paragraph) => paragraph.trim())
		.filter((paragraph) => paragraph.length > 0);
});

const titleInitial = computed(() => movie.value?.title?.charAt(0) ?? '?');

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
		{ label: t('movie-details.status'), value: movie.value?.status },
		{ label: t('movie-details.languages'), value: spokenLanguages.value },
		{ label: t('movie-details.countries'), value: productionCountries.value },
		{ label: t('movie-details.budget'), value: formatCurrency(movie.value?.budget) },
		{ label: t('movie-details.revenue'), value: formatCurrency(movie.value?.revenue) }
	];

	return facts.map((fact) => ({
		...fact,
		value: fact.value ?? t('movie-details.noData')
	}));
});

const loadMovieDetails = async () => {
	if (!movieId.value) return;

	loading.value = true;
	error.value = null;
	try {
		movie.value = await actions.getMovieById(movieId.value, locale.value);
	} catch (err) {
		error.value = true;
		console.error('Error loading movie details:', err);
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	loadMovieDetails();
});

watch([movieId, locale], () => {
	loadMovieDetails();
});
</script>

<template>
	<section class="movie-details-page">
		<div v-if="movie" class="movie-details-page__hero" :style="heroStyle" aria-hidden="true">
			<div class="movie-details-page__overlay" />
		</div>

		<div v-if="loading" class="movie-details-state">
			<div class="movie-details-state__spinner" />
			<p>{{ t('movie-details.loading') }}</p>
		</div>
		<div v-else-if="error" class="movie-details-state movie-details-state--error">
			<p>{{ t('movie-details.loadError') }}</p>
		</div>
		<div v-else-if="movie" class="movie-details">
			<div class="movie-details__header">
				<div class="movie-details__poster">
					<img v-if="posterUrl" :src="posterUrl" :alt="movie.title" loading="lazy" />
					<div v-else class="movie-details__poster--placeholder">
						<span>{{ titleInitial }}</span>
					</div>
				</div>
				<div class="movie-details__summary">
					<p class="movie-details__eyebrow">
						<span v-if="releaseYear">{{ releaseYear }}</span>
						<span v-if="formattedRuntime"> • {{ formattedRuntime }}</span>
						<span v-if="genresList"> • {{ genresList }}</span>
					</p>
					<h1>{{ movie.title }}</h1>
					<p class="movie-details__tagline" :class="{ 'movie-details__tagline--muted': !movie.tagline }">
						{{ movie.tagline || t('movie-details.taglineFallback') }}
					</p>
					<div v-if="ratingValue" class="movie-details__rating">
						<span class="movie-details__rating-badge" :style="{ backgroundColor: ratingColor }">{{ ratingValue }}</span>
						<span>{{ t('movie-details.rating') }}</span>
						<span v-if="voteCount">({{ voteCount }})</span>
					</div>
					<div class="movie-details__chips">
						<span v-if="formattedReleaseDate">{{ t('movie-details.releaseDate') }}: {{ formattedReleaseDate }}</span>
						<span v-if="formattedRuntime">{{ t('movie-details.runtime') }}: {{ formattedRuntime }}</span>
						<span v-if="genresList">{{ t('movie-details.genres') }}: {{ genresList }}</span>
					</div>
				</div>
			</div>

			<div class="movie-details__body">
				<div class="movie-details__overview">
					<h2>{{ t('movie-details.overview') }}</h2>
					<p v-if="overviewParagraphs.length === 0">{{ t('movie-details.noData') }}</p>
					<p v-for="(paragraph, index) in overviewParagraphs" :key="index">{{ paragraph }}</p>
				</div>
				<div class="movie-details__facts">
					<h2>{{ t('movie-details.facts') }}</h2>
					<dl>
						<template v-for="fact in factSheet" :key="fact.label">
							<dt>{{ fact.label }}</dt>
							<dd>{{ fact.value }}</dd>
						</template>
					</dl>
				</div>
			</div>
		</div>
		<div v-else class="movie-details-state">
			<p>{{ t('movie-details.missing') }}</p>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.movie-details-page {
	position: relative;
	min-height: 100vh;
	padding: 4rem 2rem;
	color: #f4f4f4;
	background-color: #050608;
	overflow: hidden;
}

.movie-details-page__hero {
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
}

.movie-details-page__overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(120deg, rgba(5, 6, 8, 0.8) 20%, rgba(5, 6, 8, 0.9) 70%);
}

.movie-details {
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
}

.movie-details__header {
	display: flex;
	gap: 2rem;
	align-items: stretch;
	flex-wrap: wrap;
}

.movie-details__poster {
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

	&--placeholder {
		width: 100%;
		height: 100%;
		min-height: 360px;
		display: flex;
		align-items: center;
		justify-content: center;
		font-size: 4rem;
		color: #10131b;
		background: linear-gradient(135deg, #7f8c8d, #95a5a6);
	}
}

.movie-details__summary {
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

.movie-details__eyebrow {
	margin: 0;
	font-size: 0.95rem;
	color: rgba(255, 255, 255, 0.65);
	letter-spacing: 1px;
	text-transform: uppercase;
}

.movie-details__tagline {
	font-size: 1.2rem;
	font-weight: 500;
	margin: 0;

	&--muted {
		color: rgba(255, 255, 255, 0.6);
		font-style: italic;
	}
}

.movie-details__rating {
	display: flex;
	align-items: center;
	gap: 0.7rem;
	font-size: 1rem;
	color: rgba(255, 255, 255, 0.85);
}

.movie-details__rating-badge {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	width: 3.2rem;
	height: 3.2rem;
	border-radius: 999px;
	font-size: 1.2rem;
	font-weight: 700;
	color: #050608;
	box-shadow: 0 10px 25px rgba(0, 0, 0, 0.35);
}

.movie-details__chips {
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

.movie-details__body {
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

.movie-details__overview {
	font-size: 1rem;
	line-height: 1.8;
	color: rgba(255, 255, 255, 0.85);

	p {
		margin-bottom: 1rem;
	}
}

.movie-details__facts {
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

.movie-details-state {
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

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

@media (max-width: 900px) {
	.movie-details__body {
		grid-template-columns: 1fr;
	}
}

@media (max-width: 700px) {
	.movie-details-page {
		padding: 2rem 1.5rem;
	}

	.movie-details {
		padding: 1.5rem;
	}

	.movie-details__header {
		flex-direction: column;
	}

	.movie-details__poster {
		width: 100%;
	}
}
</style>
