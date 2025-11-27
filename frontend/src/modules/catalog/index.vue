<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ContentGrid from './components/content-grid.vue';
import Pagination from './components/pagination.vue';
import CatalogFilters from './components/catalog-filters.vue';
import { actions } from './store/actions';

const route = useRoute();
const { locale, t } = useI18n();

const items = ref([]);
const loading = ref(false);
const currentPage = ref(1);
const totalPages = ref(1);
const filters = ref({});

const currentCategory = computed(() => route.params.category || 'movies');

const categoryConfig = computed(() => {
	const category = currentCategory.value;

	const configs = {
		movies: {
			title: t('catalog.movies.title'),
			subtitle: t('catalog.movies.subtitle'),
			fetchFn: actions.getMovies
		},
		shows: {
			title: t('catalog.shows.title'),
			subtitle: t('catalog.shows.subtitle'),
			fetchFn: actions.getShows
		},
		cartoons: {
			title: t('catalog.cartoons.title'),
			subtitle: t('catalog.cartoons.subtitle'),
			fetchFn: actions.getCartoons
		},
		top: {
			title: t('catalog.top.title'),
			subtitle: t('catalog.top.subtitle'),
			fetchFn: actions.getTopRated
		}
	};

	return configs[category] || configs.movies;
});

const fetchContent = async () => {
	loading.value = true;
	try {
		const data = await categoryConfig.value.fetchFn(locale.value, currentPage.value, filters.value);
		items.value = data.results || [];
		totalPages.value = data.totalPages || 1;
	} catch (error) {
		console.error('Error fetching catalog:', error);
		items.value = [];
	} finally {
		loading.value = false;
	}
};

const handlePageChange = (page) => {
	currentPage.value = page;
	window.scrollTo({ top: 0, behavior: 'smooth' });
};

const handleFiltersChange = (newFilters) => {
	filters.value = newFilters;
	currentPage.value = 1;
	fetchContent();
};

// Watch for category changes
watch(
	() => route.params.category,
	() => {
		currentPage.value = 1;
		filters.value = {};
		fetchContent();
	}
);

// Watch for page changes
watch(currentPage, () => {
	fetchContent();
});

// Watch for locale changes
watch(locale, () => {
	fetchContent();
});

onMounted(() => {
	fetchContent();
});
</script>

<template>
	<div class="catalog-page">
		<div class="catalog-header">
			<div class="header-content">
				<h1>{{ categoryConfig.title }}</h1>
				<p>{{ categoryConfig.subtitle }}</p>
			</div>
		</div>

		<div class="catalog-content">
			<CatalogFilters :category="currentCategory" :model-value="filters" @update:model-value="handleFiltersChange" />

			<ContentGrid :items="items" :loading="loading" />

			<Pagination
				v-if="!loading && items.length > 0"
				:current-page="currentPage"
				:total-pages="totalPages"
				@update:current-page="handlePageChange"
			/>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.catalog-page {
	min-height: 100vh;
	padding-bottom: 3rem;
}

.catalog-header {
	padding: 3rem 4rem 1.5rem;

	.header-content {
		h1 {
			margin: 0;
			font-size: 2.5rem;
			font-weight: 700;
			color: var(--text-color);
			letter-spacing: -0.02em;
			background: linear-gradient(135deg, #ffffff, rgba(255, 255, 255, 0.8));
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		p {
			margin: 0.5rem 0 0;
			font-size: 1.1rem;
			color: rgba(255, 255, 255, 0.6);
		}
	}
}

.catalog-content {
	padding: 0 4rem;
}

/* Light theme */
:root[data-theme='light'] {
	.catalog-header .header-content {
		h1 {
			background: linear-gradient(135deg, #1565c0, #1e88e5);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		p {
			color: rgba(0, 0, 0, 0.5);
		}
	}
}

/* Responsive */
@media (max-width: 768px) {
	.catalog-header {
		padding: 2rem 1.5rem;

		.header-content h1 {
			font-size: 1.8rem;
		}

		.header-content p {
			font-size: 0.95rem;
		}
	}

	.catalog-content {
		padding: 0 1.5rem;
	}
}
</style>
