<script setup>
import { ref, computed, watch, onMounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import ContentGrid from './components/content-grid.vue';
import Pagination from './components/pagination.vue';
import CatalogFilters from './components/catalog-filters.vue';
import { actions } from './store/actions';

const route = useRoute();
const router = useRouter();
const { locale, t } = useI18n();

const items = ref([]);
const loading = ref(false);
const totalPages = ref(1);

const getFiltersFromQuery = () => {
	const query = route.query;
	return {
		sortBy: query.sortBy || '',
		genres: query.genres || '',
		yearGte: query.yearGte || '',
		yearLte: query.yearLte || '',
		ratingGte: query.ratingGte || '',
		ratingLte: query.ratingLte || '',
		country: query.country || ''
	};
};

const currentPage = computed({
	get: () => parseInt(route.query.page) || 1,
	set: (value) => updateQueryParams({ page: value > 1 ? value : undefined })
});

const filters = ref(getFiltersFromQuery());

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

const updateQueryParams = (newParams) => {
	const query = { ...route.query, ...newParams };

	Object.keys(query).forEach((key) => {
		if (!query[key] || query[key] === '') {
			delete query[key];
		}
	});

	router.replace({ query });
};

const fetchContent = async () => {
	loading.value = true;
	try {
		const page = parseInt(route.query.page) || 1;
		const data = await categoryConfig.value.fetchFn(locale.value, page, filters.value);
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

	updateQueryParams({
		page: undefined,
		sortBy: newFilters.sortBy || undefined,
		genres: newFilters.genres || undefined,
		yearGte: newFilters.yearGte || undefined,
		yearLte: newFilters.yearLte || undefined,
		ratingGte: newFilters.ratingGte || undefined,
		ratingLte: newFilters.ratingLte || undefined,
		country: newFilters.country || undefined
	});
};

watch(
	() => route.params.category,
	(newCategory, oldCategory) => {
		if (newCategory !== oldCategory) {
			filters.value = {};
			router.replace({ params: { category: newCategory }, query: {} });
		}
	}
);

watch(
	() => route.query,
	() => {
		filters.value = getFiltersFromQuery();
		fetchContent();
	},
	{ deep: true }
);

watch(locale, () => {
	fetchContent();
});

onMounted(() => {
	filters.value = getFiltersFromQuery();
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
			background: var(--accent-gradient);
			-webkit-background-clip: text;
			-webkit-text-fill-color: transparent;
			background-clip: text;
		}

		p {
			margin: 0.5rem 0 0;
			font-size: 1.1rem;
			color: var(--text-color-secondary);
		}
	}
}

.catalog-content {
	padding: 0 4rem;
}

:root[data-theme='light'] {
	.catalog-page {
		background: transparent;
	}

	.catalog-header {
		.header-content {
			h1 {
				background: linear-gradient(135deg, #1e88e5, #42a5f5);
				-webkit-background-clip: text;
				-webkit-text-fill-color: transparent;
				background-clip: text;
			}

			p {
				color: rgba(0, 0, 0, 0.6);
			}
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
