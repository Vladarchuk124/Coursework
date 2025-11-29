<script setup>
import { useI18n } from 'vue-i18n';
import { ref, watch, computed, onMounted, onBeforeUnmount } from 'vue';
import { useRouter } from 'vue-router';
import { contentTypes } from '../../../../enums/content-type';

const router = useRouter();
const { t } = useI18n();

let debounceTimeout = null;
const query = ref('');
const contentResults = ref([]);
const actorResults = ref([]);
const isOpen = ref(false);
const loading = ref(false);

const searchBarRef = ref(null);

const props = defineProps({
	doSearch: Function
});

const hasResults = computed(() => contentResults.value.length > 0 || actorResults.value.length > 0);
const showList = computed(() => isOpen.value && hasResults.value);
const showLoadingAction = computed(() => isOpen.value && loading.value && !hasResults.value);
const showSearchError = computed(() => isOpen.value && !hasResults.value && !loading.value && query.value.length > 0);

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
		contentResults.value = [];
		actorResults.value = [];
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
				const { actors, content } = data;
				contentResults.value = content || [];
				actorResults.value = actors || [];
			})
			.finally(() => {
				loading.value = false;
			});
		if (contentResults.value.length || actorResults.value.length) {
			isOpen.value = true;
		}
	}, 400);
});

const handleContentClick = (id, name) => {
	let type = contentTypes.movie;
	if (name) {
		type = contentTypes.show;
	}
	query.value = '';
	router.push(`/content-details/${type}/${id}`);
};

const handleActorClick = (id) => {
	query.value = '';
	router.push(`/actor/${id}`);
};

const handleClickOutside = (event) => {
	if (searchBarRef.value && !searchBarRef.value.contains(event.target)) {
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
			<div class="search-input-container">
				<svg class="search-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
					<circle cx="11" cy="11" r="8" />
					<path d="M21 21l-4.35-4.35" />
				</svg>
				<input v-model="query" type="text" class="search-input" :placeholder="t('header.search')" />
			</div>

			<div v-if="showList" class="search-dropdown">
				<div class="dropdown-columns">
					<div v-if="contentResults.length" class="dropdown-column content-column">
						<div class="column-header">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="2" y="2" width="20" height="20" rx="2" />
								<path d="M10 8l6 4-6 4V8z" />
							</svg>
							<span>{{ t('header.searchContent') }}</span>
						</div>
						<ul class="results-list">
							<li v-for="item in contentResults" :key="item.id">
								<div
									v-if="item.poster_path"
									class="search-dropdown-item content-item"
									@click="() => handleContentClick(item.id, item.original_name)"
								>
									<img
										class="item-poster"
										:src="`https://image.tmdb.org/t/p/w92${item.poster_path}`"
										:alt="item.title || item.name"
									/>
									<div class="item-info">
										<h4 class="item-title">{{ item.title || item.name }}</h4>
										<span class="item-original">{{ item.original_title || item.original_name }}</span>
										<span class="rating-badge" :style="{ backgroundColor: getRatingColor(item.vote_average) }">
											{{ item.vote_average?.toFixed(1) }}
										</span>
									</div>
								</div>
							</li>
						</ul>
					</div>

					<div v-if="actorResults.length" class="dropdown-column actors-column">
						<div class="column-header">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
								<circle cx="12" cy="7" r="4" />
							</svg>
							<span>{{ t('header.searchActors') }}</span>
						</div>
						<ul class="results-list">
							<li v-for="actor in actorResults" :key="actor.id">
								<div class="search-dropdown-item actor-item" @click="() => handleActorClick(actor.id)">
									<img
										class="actor-photo"
										:src="`https://image.tmdb.org/t/p/w92${actor.profile_path}`"
										:alt="actor.name"
									/>
									<div class="actor-info">
										<h4 class="actor-name">{{ actor.name }}</h4>
										<span class="actor-locale-name">
											{{ actor.original_name }}
										</span>
									</div>
								</div>
							</li>
						</ul>
					</div>
				</div>
			</div>

			<div v-if="showLoadingAction" class="search-dropdown loading-dropdown">
				<div class="loading-container">
					<span class="loading-spinner"></span>
					<span class="loading-text">{{ t('header.searching') }}</span>
				</div>
			</div>

			<div v-if="showSearchError" class="search-dropdown error-dropdown">
				<div class="error-container">
					<svg class="error-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
						<circle cx="12" cy="12" r="10" />
						<path d="M8 15h8M9 9h.01M15 9h.01" />
					</svg>
					<span class="search-error">{{ t('header.searchError') }}</span>
				</div>
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
	background: linear-gradient(135deg, rgba(0, 0, 0, 0.6) 0%, rgba(20, 20, 40, 0.7) 100%);
	backdrop-filter: blur(4px);
	z-index: 5;
	animation: fadeIn 0.2s ease;
}

@keyframes fadeIn {
	from {
		opacity: 0;
	}
	to {
		opacity: 1;
	}
}

.search-bar {
	display: flex;
	justify-content: center;
	width: 40%;
	position: relative;
	z-index: 6;

	.input-wrapper {
		display: flex;
		flex-direction: column;
		width: 100%;
		max-width: 32rem;
	}

	.search-input-container {
		display: flex;
		align-items: center;
		background: linear-gradient(135deg, #ffffff 0%, #f8f9fa 100%);
		padding: 0.5rem 1rem;
		border-radius: 16px;
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.1), inset 0 1px 0 rgba(255, 255, 255, 0.8);
		border: 1px solid rgba(255, 255, 255, 0.3);
		transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

		&:focus-within {
			box-shadow: 0 6px 30px rgba(0, 187, 249, 0.25), inset 0 1px 0 rgba(255, 255, 255, 0.8);
			border-color: rgba(0, 187, 249, 0.4);
			transform: translateY(-1px);
		}
	}

	.search-icon {
		width: 1.4rem;
		height: 1.4rem;
		color: #6b7280;
		flex-shrink: 0;
		transition: color 0.2s ease;
	}

	.search-input-container:focus-within .search-icon {
		color: #00bbf9;
	}

	.search-input {
		background: none;
		border: 0;
		width: 100%;
		margin-left: 0.75rem;
		outline: none;
		box-shadow: none;
		font-size: 1rem;
		font-weight: 500;
		color: #1f2937;

		&::placeholder {
			color: #9ca3af;
			font-weight: 400;
		}
	}

	.search-dropdown {
		position: absolute;
		top: 100%;
		left: 50%;
		transform: translateX(-50%);
		margin-top: 0.75rem;
		width: max-content;
		min-width: 100%;
		max-width: 56rem;
		max-height: 70vh;
		overflow-y: auto;
		overflow-x: hidden;
		background: linear-gradient(145deg, #ffffff 0%, #f8fafc 100%);
		border-radius: 20px;
		box-shadow: 0 25px 60px rgba(0, 0, 0, 0.15), 0 10px 20px rgba(0, 0, 0, 0.1);
		border: 1px solid rgba(255, 255, 255, 0.8);
		z-index: 20;
		animation: slideDown 0.25s cubic-bezier(0.4, 0, 0.2, 1);

		&::-webkit-scrollbar {
			width: 6px;
		}

		&::-webkit-scrollbar-track {
			background: transparent;
		}

		&::-webkit-scrollbar-thumb {
			background: rgba(0, 0, 0, 0.15);
			border-radius: 3px;
		}
	}

	@keyframes slideDown {
		from {
			opacity: 0;
			transform: translateX(-50%) translateY(-10px);
		}
		to {
			opacity: 1;
			transform: translateX(-50%) translateY(0);
		}
	}

	.dropdown-columns {
		display: flex;
		gap: 0;
	}

	.dropdown-column {
		flex: 1;
		min-width: 280px;
		padding: 0.75rem 0;

		&:not(:last-child) {
			border-right: 1px solid rgba(0, 0, 0, 0.06);
		}
	}

	.column-header {
		display: flex;
		align-items: center;
		gap: 0.5rem;
		padding: 0.5rem 1rem 0.75rem;
		font-size: 0.75rem;
		font-weight: 700;
		text-transform: uppercase;
		letter-spacing: 0.08em;
		color: #6b7280;

		svg {
			width: 1rem;
			height: 1rem;
			opacity: 0.7;
		}
	}

	.content-column .column-header {
		color: #00bbf9;

		svg {
			stroke: #00bbf9;
		}
	}

	.actors-column .column-header {
		color: #f472b6;

		svg {
			stroke: #f472b6;
		}
	}

	.results-list {
		list-style: none;
		margin: 0;
		padding: 0;
	}

	.search-dropdown-item {
		display: flex;
		align-items: center;
		padding: 0.6rem 1rem;
		cursor: pointer;
		transition: all 0.15s ease;
		border-radius: 0;
		margin: 0;

		&:hover {
			background: linear-gradient(90deg, rgba(0, 187, 249, 0.08) 0%, rgba(0, 187, 249, 0.02) 100%);
		}
	}

	.content-item {
		.item-poster {
			width: 42px;
			height: 63px;
			object-fit: cover;
			border-radius: 6px;
			flex-shrink: 0;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
		}

		.item-info {
			margin-left: 0.75rem;
			display: flex;
			flex-direction: column;
			gap: 0.15rem;
			min-width: 0;
		}

		.item-title {
			margin: 0;
			font-size: 0.9rem;
			font-weight: 600;
			color: #1f2937;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.item-original {
			font-size: 0.75rem;
			color: #6b7280;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}

		.rating-badge {
			display: inline-flex;
			align-items: center;
			justify-content: center;
			width: fit-content;
			padding: 0.15rem 0.5rem;
			border-radius: 20px;
			font-size: 0.7rem;
			font-weight: 700;
			color: #ffffff;
			margin-top: 0.2rem;
		}
	}

	.actor-item {
		&:hover {
			background: linear-gradient(90deg, rgba(244, 114, 182, 0.08) 0%, rgba(244, 114, 182, 0.02) 100%);
		}

		.actor-photo {
			width: 48px;
			height: 48px;
			object-fit: cover;
			border-radius: 50%;
			flex-shrink: 0;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
			border: 2px solid #fff;
		}

		.actor-info {
			margin-left: 0.75rem;
			display: flex;
			flex-direction: column;
			gap: 0.1rem;
			min-width: 0;
		}

		.actor-name {
			margin: 0;
			font-size: 0.9rem;
			font-weight: 600;
			color: #1f2937;
		}

		.actor-locale-name {
			font-size: 0.75rem;
			color: #6b7280;
			white-space: nowrap;
			overflow: hidden;
			text-overflow: ellipsis;
		}
	}

	.loading-dropdown,
	.error-dropdown {
		padding: 2.5rem 1.5rem;
	}

	.loading-container,
	.error-container {
		display: flex;
		flex-direction: column;
		align-items: center;
		gap: 0.75rem;
	}

	.loading-spinner {
		display: block;
		width: 32px;
		height: 32px;
		border-radius: 50%;
		border: 3px solid rgba(0, 187, 249, 0.15);
		border-top-color: #00bbf9;
		animation: spin 0.8s linear infinite;
	}

	.loading-text {
		font-size: 0.9rem;
		color: #6b7280;
		font-weight: 500;
	}

	.error-icon {
		width: 40px;
		height: 40px;
		color: #9ca3af;
	}

	.search-error {
		color: #6b7280;
		font-size: 0.95rem;
		font-weight: 500;
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

@media (max-width: 768px) {
	.search-bar {
		width: 100%;

		.search-dropdown {
			max-width: calc(100vw - 2rem);
		}

		.dropdown-columns {
			flex-direction: column;
		}

		.dropdown-column {
			min-width: auto;

			&:not(:last-child) {
				border-right: none;
				border-bottom: 1px solid rgba(0, 0, 0, 0.06);
			}
		}
	}
}
</style>
