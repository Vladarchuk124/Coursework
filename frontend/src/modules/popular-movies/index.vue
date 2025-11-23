<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { actions } from './store/actions';
import { contentTypes } from '../../../enums/content-type';

const { locale, t } = useI18n();
const router = useRouter();
const movies = ref([]);
const loading = ref(false);
const currentIndex = ref(0);
let intervalId = null;

const backgroundStyle = computed(() => {
	const currentMovie = movies.value[currentIndex.value];
	if (currentMovie?.backdrop_path) {
		return {
			backgroundImage: `url("https://image.tmdb.org/t/p/original${currentMovie.backdrop_path}")`
		};
	}
	return {};
});

const ratingColor = computed(() => {
	const currentMovie = movies.value[currentIndex.value];
	if (!currentMovie) return '#808080';

	const rating = currentMovie.vote_average;
	if (rating < 3) {
		return '#dc3545';
	} else if (rating < 5) {
		return '#ff9800';
	} else if (rating < 7) {
		return '#ffc107';
	} else if (rating < 9) {
		return '#28a745';
	} else {
		return '#17a2b8';
	}
});

const loadPopular = async () => {
	loading.value = true;
	try {
		const data = await actions.getPopularMovies(1, locale.value);
		movies.value = data;
	} catch (error) {
		console.error('Error loading movies:', error);
	} finally {
		loading.value = false;
	}
};

const startSlideshow = () => {
	intervalId = setInterval(() => {
		currentIndex.value = currentIndex.value + 1;
		if (currentIndex.value === 10) {
			currentIndex.value = 0;
		}
	}, 10000);
};

const goToMovieDetails = () => {
	const currentMovie = movies.value[currentIndex.value];
	if (currentMovie?.id) {
		router.push(`/content-details/${contentTypes.movie}/${currentMovie.id}`);
	}
};

const goToSlide = (index) => {
	currentIndex.value = index;
	if (intervalId) {
		clearInterval(intervalId);
	}
	startSlideshow();
};

const handlePaginationClick = (difference) => {
	currentIndex.value += difference;
	if (currentIndex.value === 10) {
		currentIndex.value = 0;
	}
	if (currentIndex.value === -1) {
		currentIndex.value = 9;
	}
};

onMounted(() => {
	loadPopular().then(() => {
		startSlideshow();
	});
});

onUnmounted(() => {
	if (intervalId) {
		clearInterval(intervalId);
	}
});

watch(locale, () => {
	if (movies.value.length > 0) {
		loadPopular().then(() => {
			if (intervalId) {
				clearInterval(intervalId);
			}
			startSlideshow();
		});
	}
});
</script>

<template>
	<div class="popular-movies">
		<div class="pagination-btn left" @click="() => handlePaginationClick(-1)" />
		<div class="pagination-btn right" @click="() => handlePaginationClick(1)" />
		<div v-if="movies.length > 0 && movies[currentIndex]" class="movie">
			<div class="pagination-dots">
				<div
					v-for="(movie, index) in movies.slice(0, 10)"
					:key="index"
					class="dot"
					:class="{ active: index === currentIndex }"
					@click="goToSlide(index)"
				/>
			</div>
			<div class="movie-details">
				<div class="movie-rating">{{ movies[currentIndex].vote_average.toFixed(1) }}</div>
				<h1>{{ movies[currentIndex].title }}</h1>
				<h2>{{ t('popularMovies.releaseDate') + movies[currentIndex].release_date }}</h2>
				<button class="details-btn" @click="goToMovieDetails">{{ t('popularMovies.details') }}</button>
			</div>
			<div class="background-img" :style="backgroundStyle"><div class="dark-background" /></div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.popular-movies {
	display: flex;
	height: 50rem;
	color: #ffffff;
	position: relative;

	.pagination-btn {
		position: absolute;
		width: 20rem;
		height: 50rem;
		cursor: pointer;
		z-index: 2;

		&.left {
			left: 0;
		}
		&.right {
			right: 0;
		}
	}
	.movie {
		position: relative;
		display: flex;
		justify-content: end;
		width: 100%;
		height: 100%;

		.movie-details {
			display: flex;
			flex-direction: column;
			position: relative;
			z-index: 3;
			pointer-events: none;
			margin-right: 4rem;
			justify-content: center;
			align-items: end;
			text-align: end;

			.movie-rating {
				border-radius: 25px;
				margin: 0.5rem 0;
				padding: 0.2rem 1rem;
				background-color: v-bind(ratingColor);
			}

			.details-btn {
				z-index: 1;
				margin: 0.5rem 0;
				background-color: #00bbf9;
				height: 3rem;
				width: 10rem;
				border-radius: 15rem;
				border: 0;
				color: white;
				font-size: large;
				font-weight: 700;
				transition: transform 0.1s ease;
				pointer-events: auto;

				&:hover {
					cursor: pointer;
					transform: scale(1.03);
				}
			}
		}

		.background-img {
			position: absolute;
			background-size: cover;
			box-shadow: inset 0 -30px 30px -10px rgba(0, 0, 0, 0.7), inset 0 30px 30px -10px rgba(0, 0, 0, 0.7);
			width: 100%;
			height: 100%;
			z-index: 0;

			.dark-background {
				background-color: rgba(0, 0, 0, 0.5);
				width: 100%;
				height: 100%;
			}
		}

		.pagination-dots {
			position: absolute;
			display: flex;
			bottom: 15%;
			left: 15%;
			transform: translateX(-50%);

			gap: 0.75rem;
			z-index: 2;
			align-items: center;
			justify-content: center;

			.dot {
				width: 0.5rem;
				height: 0.5rem;
				border-radius: 50%;
				background-color: rgba(255, 255, 255, 0.4);
				transition: all 0.3s ease;
				cursor: pointer;

				&.active {
					width: 0.75rem;
					height: 0.75rem;
					background-color: rgb(255, 255, 255);
					box-shadow: 0 0 0.5rem rgba(255, 255, 255, 0.8);
				}
			}
		}
	}
}
</style>
