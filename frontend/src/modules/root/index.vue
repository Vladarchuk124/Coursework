<script setup>
import { ref, onMounted, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import PopularMovies from './components/popular-movies.vue';
import ContentRow from './components/content-row.vue';
import Recommendations from './components/recomendations.vue';
import { actions } from './store/actions';

const { locale, t } = useI18n();

const trending = ref([]);
const nowPlaying = ref([]);
const topRated = ref([]);
const onTheAir = ref([]);
const popularShows = ref([]);

const loadingTrending = ref(true);
const loadingNowPlaying = ref(true);
const loadingTopRated = ref(true);
const loadingOnTheAir = ref(true);
const loadingPopularShows = ref(true);

const loadData = async () => {
	loadingTrending.value = true;
	loadingNowPlaying.value = true;
	loadingTopRated.value = true;
	loadingOnTheAir.value = true;
	loadingPopularShows.value = true;

	try {
		const [trendingData, nowPlayingData, topRatedData, onTheAirData, popularShowsData] = await Promise.all([
			actions.getTrending(locale.value),
			actions.getNowPlaying(locale.value),
			actions.getTopRated(locale.value),
			actions.getOnTheAir(locale.value),
			actions.getPopularShows(locale.value)
		]);

		trending.value = trendingData.results?.slice(0, 20) || [];
		nowPlaying.value = nowPlayingData.results?.slice(0, 20) || [];
		topRated.value = topRatedData.results?.slice(0, 20) || [];
		onTheAir.value = onTheAirData.results?.slice(0, 20) || [];
		popularShows.value = popularShowsData.results?.slice(0, 20) || [];
	} catch (error) {
		console.error('Error loading home data:', error);
	} finally {
		loadingTrending.value = false;
		loadingNowPlaying.value = false;
		loadingTopRated.value = false;
		loadingOnTheAir.value = false;
		loadingPopularShows.value = false;
	}
};

onMounted(() => {
	loadData();
});

watch(locale, () => {
	loadData();
});
</script>

<template>
	<div class="root-page">
		<PopularMovies />

		<div class="content-sections">
			<Recommendations />

			<ContentRow :title="t('home.trending')" :items="trending" :loading="loadingTrending" />

			<ContentRow
				:title="t('home.nowPlaying')"
				:items="nowPlaying"
				:loading="loadingNowPlaying"
				link="/catalog/movies"
			/>

			<ContentRow :title="t('home.topRated')" :items="topRated" :loading="loadingTopRated" link="/catalog/top" />

			<ContentRow
				:title="t('home.popularShows')"
				:items="popularShows"
				:loading="loadingPopularShows"
				link="/catalog/shows"
			/>

			<ContentRow :title="t('home.onTheAir')" :items="onTheAir" :loading="loadingOnTheAir" link="/catalog/shows" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.root-page {
	min-height: 100vh;
}

.content-sections {
	padding: 2rem 0 4rem;
	display: flex;
	flex-direction: column;
	gap: 1rem;
}
</style>
