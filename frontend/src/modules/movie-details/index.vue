<script setup>
import { ref, onMounted, watch } from 'vue';
import { useRoute } from 'vue-router';
import { actions } from './store/actions';
import { useI18n } from 'vue-i18n';

const route = useRoute();
const movie = ref(null);
const loading = ref(false);

const { locale, t } = useI18n();

const loadMovieDetails = async () => {
	const movieId = route.params.id;
	if (!movieId) return;

	loading.value = true;
	try {
		movie.value = await actions.getMovieById(movieId, locale.value);
		console.log(movie);
	} catch (error) {
		console.error('Error loading movie details:', error);
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	loadMovieDetails();
});

watch(locale, () => {
	loadMovieDetails();
});
</script>

<template>
	<div v-if="movie" class="movie-details">
		<img :src="movie.poster_path ? 'https://image.tmdb.org/t/p/w500' + movie.poster_path : ''" alt="Movie Poster" />
		<div class="info">
			<h1>{{ movie.title }}</h1>
			<p>{{ movie.overview }}</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.movie-details {
	display: flex;
	flex-direction: row;
	align-items: center;
	gap: 2rem;
	padding: 2rem;
}
</style>
