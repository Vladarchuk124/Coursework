<script setup>
import { useI18n } from 'vue-i18n';
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';

const router = useRouter();
const { t } = useI18n();

let debounceTimeout = null;
const query = ref('');
const results = ref([]);
const isOpen = ref(false);
const loading = ref(false);

const searchBarRef = ref(null);

const props = defineProps({
	doSearch: Function
});

const showList = computed(() => isOpen.value && results.value.length > 0);
const showLoadingAction = computed(() => isOpen.value && loading.value && results.value.length === 0);
const showSearchError = computed(() => isOpen.value && results.value.length === 0 && !loading.value);

const getRatingColor = (rating) => {
	const value = Number(rating);
	if (!Number.isFinite(value)) {
		return '#808080';
	}
	if (value < 3) {
		return '#dc3545';
	}
	if (value < 5) {
		return '#ff9800';
	}
	if (value < 7) {
		return '#ffc107';
	}
	if (value < 9) {
		return '#28a745';
	}
	return '#17a2b8';
};

watch(query, (newValue) => {
	clearTimeout(debounceTimeout);
	if (!newValue) {
		results.value = [];
		isOpen.value = false;
		loading.value = false;
		return;
	}
	loading.value = true;
	isOpen.value = true;
	debounceTimeout = setTimeout(() => {
		props
			.doSearch(newValue)
			.then((data) => {
				results.value = data || [];
			})
			.finally(() => {
				loading.value = false;
			});
		if (results) {
			isOpen.value = true;
		}
	}, 400);
});

const handleClick = (id) => {
	query.value = '';
	router.push(`/movie-details/${id}`);
};

const handleClickOutside = (event) => {
	if (!searchBarRef.value) return;
	if (!searchBarRef.value.contains(event.target)) {
		isOpen.value = false;
	}
};

onMounted(() => {
	document.addEventListener('click', handleClickOutside);
});

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
	<div v-if="isOpen" class="backdrop" />
	<div class="search-bar">
		<div class="input-wrapper" ref="searchBarRef">
			<img class="search-img" src="../../../assets/images/search-icon.png" alt="search-img" />
			<input v-model="query" type="text" class="search-input" :placeholder="t('header.search')" />
			<ul v-if="showList" class="search-dropdown">
				<li v-for="(item, index) in results" :key="item.id || index">
					<div v-if="item.poster_path" class="search-dropdown-item" @click="() => handleClick(item.id)">
						<img
							class="item-img"
							:src="item.poster_path ? `https://image.tmdb.org/t/p/w500${item.poster_path}` : ''"
							alt="item-img"
						/>
						<div>
							<h4>{{ item.original_title || item.original_name }} / {{ item.title || item.name }}</h4>
							<h4 class="rating" :style="{ backgroundColor: getRatingColor(item.vote_average) }">
								{{ item.vote_average }}
							</h4>
						</div>
					</div>
				</li>
			</ul>
			<div v-if="showLoadingAction" class="search-dropdown">
				<span class="loading-spinner"></span>
			</div>
			<div v-if="showSearchError" class="search-dropdown">
				<span class="search-error">{{ t('header.searchError') }}</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.backdrop {
	position: fixed;
	top: 0;
	left: 0;
	right: 0;
	bottom: 0;
	background-color: rgba(0, 0, 0, 0.5);
	z-index: 5;
}
.search-bar {
	position: relative;
	z-index: 6;

	.input-wrapper {
		display: flex;
		background-color: #ffffff;
		width: 25rem;
		padding: 0.3rem 1rem;
		border-radius: 25px;
		.search-img {
			height: 2rem;
		}
		.search-input {
			background: none;
			border: 0;
			width: 100%;
			margin-left: 1rem;
			outline: none;
			box-shadow: none;
			font-size: 1.05rem;
			font-weight: 500;
			color: #222;
		}
		.search-input:focus {
			outline: none;
			box-shadow: none;
		}
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 0;
		margin-top: 0.3rem;
		width: 100%;
		max-height: 15rem;
		overflow-y: auto;
		background-color: #ffffff;
		border-radius: 12px;
		box-shadow: 0 4px 12px rgba(0, 0, 0, 0.08);
		padding: 0.3rem 0;
		list-style: none;
		z-index: 20;
	}

	.loading-spinner {
		display: block;
		width: 24px;
		height: 24px;
		margin: 0.5rem auto;
		border-radius: 50%;
		border: 3px solid #e0e0e0;
		border-top-color: #222;
		animation: spin 0.6s linear infinite;
	}

	.search-error {
		display: flex;
		justify-self: center;
		align-self: center;
		color: black;
		padding: 5rem 0;
	}

	.search-dropdown-item {
		display: flex;
		align-items: center;
		padding: 0.5rem 1rem;
		font-size: 0.95rem;
		cursor: pointer;
		color: #222;
		transition: background-color 0.15s ease;
		.rating {
			border-radius: 25px;
			padding: 0.2rem;
			font-weight: 500;
			max-width: 4rem;
			text-align: center;
			color: #ffffff;
			background-color: #808080;
			transition: background-color 0.3s ease;
		}
		.item-img {
			width: 3rem;
			margin-right: 1rem;
		}

		&:hover {
			background-color: #f4f4f4;
		}
	}
}
@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
