<script setup>
import { ref, computed, watch, onMounted, onUnmounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { actions } from '../store/actions';

const props = defineProps({
	category: {
		type: String,
		required: true
	},
	modelValue: {
		type: Object,
		default: () => ({})
	}
});

const emit = defineEmits(['update:modelValue']);

const { locale, t } = useI18n();

const genres = ref([]);
const isOpen = ref(false);

const currentYear = new Date().getFullYear();
const minYear = 1970;

const ratingMin = ref(props.modelValue.ratingGte ? parseInt(props.modelValue.ratingGte) : 0);
const ratingMax = ref(props.modelValue.ratingLte ? parseInt(props.modelValue.ratingLte) : 10);
const yearMin = ref(props.modelValue.yearGte ? parseInt(props.modelValue.yearGte) : minYear);
const yearMax = ref(props.modelValue.yearLte ? parseInt(props.modelValue.yearLte) : currentYear);

const selectedGenres = ref(props.modelValue.genres ? props.modelValue.genres.split(',').map(Number) : []);

const localFilters = ref({
	sortBy: props.modelValue.sortBy || '',
	genres: props.modelValue.genres || '',
	yearGte: props.modelValue.yearGte || '',
	yearLte: props.modelValue.yearLte || '',
	ratingGte: props.modelValue.ratingGte || '',
	ratingLte: props.modelValue.ratingLte || ''
});

const sortOptions = computed(() => [
	{ value: '', label: t('filters.sort.default') },
	{ value: 'popularity.desc', label: t('filters.sort.popularityDesc') },
	{ value: 'popularity.asc', label: t('filters.sort.popularityAsc') },
	{ value: 'vote_average.desc', label: t('filters.sort.ratingDesc') },
	{ value: 'vote_average.asc', label: t('filters.sort.ratingAsc') },
	{ value: 'primary_release_date.desc', label: t('filters.sort.dateDesc') },
	{ value: 'primary_release_date.asc', label: t('filters.sort.dateAsc') }
]);

const ratingRangeStyle = computed(() => {
	const min = (ratingMin.value / 10) * 100;
	const max = (ratingMax.value / 10) * 100;
	return {
		left: `${min}%`,
		width: `${max - min}%`
	};
});

const yearRangeStyle = computed(() => {
	const range = currentYear - minYear;
	const min = ((yearMin.value - minYear) / range) * 100;
	const max = ((yearMax.value - minYear) / range) * 100;
	return {
		left: `${min}%`,
		width: `${max - min}%`
	};
});

const isRatingFiltered = computed(() => ratingMin.value > 0 || ratingMax.value < 10);
const isYearFiltered = computed(() => yearMin.value > minYear || yearMax.value < currentYear);

const activeFiltersCount = computed(() => {
	let count = 0;
	if (localFilters.value.sortBy) count++;
	if (selectedGenres.value.length > 0) count++;
	if (isYearFiltered.value) count++;
	if (isRatingFiltered.value) count++;
	return count;
});

const isGenreSelected = (genreId) => selectedGenres.value.includes(genreId);

const toggleGenre = (genreId) => {
	const index = selectedGenres.value.indexOf(genreId);
	if (index === -1) {
		selectedGenres.value.push(genreId);
	} else {
		selectedGenres.value.splice(index, 1);
	}
	localFilters.value.genres = selectedGenres.value.join(',');
};

const updateRatingMin = (e) => {
	let val = parseInt(e.target.value);
	const maxAllowed = ratingMax.value - 1;
	if (val > maxAllowed) {
		val = maxAllowed;
		e.target.value = val;
	}
	ratingMin.value = val;
	localFilters.value.ratingGte = val > 0 ? val.toString() : '';
};

const updateRatingMax = (e) => {
	let val = parseInt(e.target.value);
	const minAllowed = ratingMin.value + 1;
	if (val < minAllowed) {
		val = minAllowed;
		e.target.value = val;
	}
	ratingMax.value = val;
	localFilters.value.ratingLte = val < 10 ? val.toString() : '';
};

const updateYearMin = (e) => {
	let val = parseInt(e.target.value);
	const maxAllowed = yearMax.value - 1;
	if (val > maxAllowed) {
		val = maxAllowed;
		e.target.value = val;
	}
	yearMin.value = val;
	localFilters.value.yearGte = val > minYear ? val.toString() : '';
};

const updateYearMax = (e) => {
	let val = parseInt(e.target.value);
	const minAllowed = yearMin.value + 1;
	if (val < minAllowed) {
		val = minAllowed;
		e.target.value = val;
	}
	yearMax.value = val;
	localFilters.value.yearLte = val < currentYear ? val.toString() : '';
};

const loadGenres = async () => {
	try {
		if (props.category === 'movies' || props.category === 'cartoons') {
			genres.value = await actions.getMovieGenres(locale.value);
		} else if (props.category === 'shows') {
			genres.value = await actions.getTvGenres(locale.value);
		} else {
			const [movieGenres, tvGenres] = await Promise.all([
				actions.getMovieGenres(locale.value),
				actions.getTvGenres(locale.value)
			]);
			const genreMap = new Map();
			[...movieGenres, ...tvGenres].forEach((g) => genreMap.set(g.id, g));
			genres.value = Array.from(genreMap.values());
		}
	} catch (error) {
		console.error('Failed to load genres:', error);
	}
};

const openMenu = () => {
	isOpen.value = true;
	document.body.style.overflow = 'hidden';
};

const closeMenu = () => {
	isOpen.value = false;
	document.body.style.overflow = '';
};

const applyFilters = () => {
	emit('update:modelValue', { ...localFilters.value });
	closeMenu();
};

const clearFilters = () => {
	localFilters.value = {
		sortBy: '',
		genres: '',
		yearGte: '',
		yearLte: '',
		ratingGte: '',
		ratingLte: ''
	};
	selectedGenres.value = [];
	ratingMin.value = 0;
	ratingMax.value = 10;
	yearMin.value = minYear;
	yearMax.value = currentYear;
	emit('update:modelValue', { ...localFilters.value });
};

const handleEscape = (e) => {
	if (e.key === 'Escape' && isOpen.value) {
		closeMenu();
	}
};

watch(
	() => props.category,
	() => {
		loadGenres();
		clearFilters();
	}
);

watch(
	() => props.modelValue,
	(newValue) => {
		localFilters.value = {
			sortBy: newValue.sortBy || '',
			genres: newValue.genres || '',
			yearGte: newValue.yearGte || '',
			yearLte: newValue.yearLte || '',
			ratingGte: newValue.ratingGte || '',
			ratingLte: newValue.ratingLte || ''
		};

		selectedGenres.value = newValue.genres ? newValue.genres.split(',').map(Number) : [];
		ratingMin.value = newValue.ratingGte ? parseInt(newValue.ratingGte) : 0;
		ratingMax.value = newValue.ratingLte ? parseInt(newValue.ratingLte) : 10;
		yearMin.value = newValue.yearGte ? parseInt(newValue.yearGte) : minYear;
		yearMax.value = newValue.yearLte ? parseInt(newValue.yearLte) : currentYear;
	},
	{ deep: true }
);

watch(locale, () => {
	loadGenres();
});

onMounted(() => {
	loadGenres();
	document.addEventListener('keydown', handleEscape);
});

onUnmounted(() => {
	document.removeEventListener('keydown', handleEscape);
	document.body.style.overflow = '';
});
</script>

<template>
	<div class="catalog-filters">
		<button class="filter-btn" @click="openMenu">
			<svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
				<line x1="4" y1="6" x2="20" y2="6" />
				<line x1="4" y1="12" x2="20" y2="12" />
				<line x1="4" y1="18" x2="20" y2="18" />
				<circle cx="8" cy="6" r="2" fill="currentColor" />
				<circle cx="16" cy="12" r="2" fill="currentColor" />
				<circle cx="10" cy="18" r="2" fill="currentColor" />
			</svg>
			<span>{{ t('filters.title') }}</span>
			<span v-if="activeFiltersCount > 0" class="filter-badge">{{ activeFiltersCount }}</span>
		</button>

		<!-- Overlay -->
		<Teleport to="body">
			<Transition name="fade">
				<div v-if="isOpen" class="filter-overlay" @click="closeMenu"></div>
			</Transition>

			<Transition name="slide">
				<div v-if="isOpen" class="filter-menu">
					<div class="menu-header">
						<h3>{{ t('filters.title') }}</h3>
						<button class="close-btn" @click="closeMenu">✕</button>
					</div>

					<div class="menu-content">
						<!-- Сортування -->
						<div class="filter-group">
							<label>{{ t('filters.sortBy') }}</label>
							<select v-model="localFilters.sortBy">
								<option v-for="opt in sortOptions" :key="opt.value" :value="opt.value">
									{{ opt.label }}
								</option>
							</select>
						</div>

						<!-- Жанри (мультивибір) -->
						<div v-if="category !== 'top'" class="filter-group">
							<label>
								{{ t('filters.genre') }}
								<span v-if="selectedGenres.length > 0" class="genre-count">({{ selectedGenres.length }})</span>
							</label>
							<div class="genre-chips">
								<button
									v-for="genre in genres"
									:key="genre.id"
									class="genre-chip"
									:class="{ selected: isGenreSelected(genre.id) }"
									@click="toggleGenre(genre.id)"
								>
									{{ genre.name }}
								</button>
							</div>
						</div>

						<!-- Рік (діапазон) -->
						<div class="filter-group">
							<label>{{ t('filters.year') }}</label>
							<div class="rating-display">
								<span>{{ yearMin }}</span>
								<span class="rating-separator">—</span>
								<span>{{ yearMax }}</span>
							</div>
							<div class="range-slider">
								<div class="range-track"></div>
								<div class="range-fill" :style="yearRangeStyle"></div>
								<input
									type="range"
									:min="minYear"
									:max="currentYear"
									step="1"
									:value="yearMin"
									@input="updateYearMin"
								/>
								<input
									type="range"
									:min="minYear"
									:max="currentYear"
									step="1"
									:value="yearMax"
									@input="updateYearMax"
								/>
							</div>
							<div class="range-labels">
								<span>{{ minYear }}</span>
								<span>{{ Math.round((currentYear + minYear) / 2) }}</span>
								<span>{{ currentYear }}</span>
							</div>
						</div>

						<!-- Рейтинг (діапазон) -->
						<div class="filter-group">
							<label>{{ t('filters.rating') }}</label>
							<div class="rating-display">
								<span>{{ ratingMin }}</span>
								<span class="rating-separator">—</span>
								<span>{{ ratingMax }}</span>
							</div>
							<div class="range-slider">
								<div class="range-track"></div>
								<div class="range-fill" :style="ratingRangeStyle"></div>
								<input type="range" min="0" max="10" step="1" :value="ratingMin" @input="updateRatingMin" />
								<input type="range" min="0" max="10" step="1" :value="ratingMax" @input="updateRatingMax" />
							</div>
							<div class="range-labels">
								<span>0</span>
								<span>5</span>
								<span>10</span>
							</div>
						</div>
					</div>

					<div class="menu-footer">
						<button v-if="activeFiltersCount > 0" class="clear-btn" @click="clearFilters">
							{{ t('filters.clear') }}
						</button>
						<button class="apply-btn" @click="applyFilters">
							{{ t('filters.apply') }}
						</button>
					</div>
				</div>
			</Transition>
		</Teleport>
	</div>
</template>

<style lang="scss" scoped>
.catalog-filters {
	margin-bottom: 1.5rem;
}

.filter-btn {
	display: flex;
	align-items: center;
	gap: 0.6rem;
	padding: 0.7rem 1.25rem;
	background: rgba(255, 255, 255, 0.08);
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: 10px;
	color: var(--text-color);
	font-size: 0.95rem;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover {
		background: rgba(255, 255, 255, 0.14);
		border-color: rgba(255, 255, 255, 0.2);
	}

	svg {
		opacity: 0.8;
	}

	.filter-badge {
		background: linear-gradient(135deg, #00bbf9, #4cb1ff);
		color: white;
		font-size: 0.75rem;
		font-weight: 600;
		padding: 0.15rem 0.5rem;
		border-radius: 10px;
		min-width: 20px;
		text-align: center;
	}
}

.filter-overlay {
	position: fixed;
	inset: 0;
	background: rgba(0, 0, 0, 0.6);
	backdrop-filter: blur(4px);
	z-index: 1000;
}

.filter-menu {
	position: fixed;
	top: 50%;
	left: 50%;
	transform: translate(-50%, -50%);
	width: 400px;
	max-width: 90vw;
	background: linear-gradient(180deg, #0f1419 0%, #1a1f2e 100%);
	border: 1px solid rgba(255, 255, 255, 0.1);
	border-radius: 16px;
	box-shadow: 0 20px 60px rgba(0, 0, 0, 0.5);
	z-index: 1001;
	display: flex;
	flex-direction: column;
}

.menu-header {
	display: flex;
	align-items: center;
	justify-content: space-between;
	padding: 1.25rem 1.5rem;
	border-bottom: 1px solid rgba(255, 255, 255, 0.1);

	h3 {
		margin: 0;
		font-size: 1.2rem;
		font-weight: 600;
		color: white;
	}

	.close-btn {
		width: 36px;
		height: 36px;
		display: flex;
		align-items: center;
		justify-content: center;
		background: rgba(255, 255, 255, 0.08);
		border: none;
		border-radius: 8px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 1.1rem;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.15);
			color: white;
		}
	}
}

.menu-content {
	padding: 1.5rem;
	display: flex;
	flex-direction: column;
	gap: 1.25rem;
	overflow: hidden;
}

.filter-group {
	display: flex;
	flex-direction: column;
	gap: 0.5rem;

	label {
		font-size: 0.9rem;
		color: rgba(255, 255, 255, 0.6);
		font-weight: 500;
		display: flex;
		align-items: center;
		gap: 0.5rem;

		.genre-count {
			color: #00bbf9;
			font-size: 0.85rem;
		}
	}

	select {
		padding: 0.75rem 1rem;
		background: rgba(255, 255, 255, 0.06);
		border: 1px solid rgba(255, 255, 255, 0.1);
		border-radius: 10px;
		color: white;
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.1);
		}

		&:focus {
			outline: none;
			border-color: #00bbf9;
			box-shadow: 0 0 0 3px rgba(0, 187, 249, 0.15);
		}

		option {
			background: #1a1f2e;
			color: white;
		}
	}
}

.genre-chips {
	display: flex;
	flex-wrap: wrap;
	gap: 0.5rem;
	max-height: 180px;
	overflow-y: auto;
	padding: 0.25rem;

	&::-webkit-scrollbar {
		width: 4px;
	}

	&::-webkit-scrollbar-track {
		background: rgba(255, 255, 255, 0.05);
		border-radius: 2px;
	}

	&::-webkit-scrollbar-thumb {
		background: rgba(255, 255, 255, 0.2);
		border-radius: 2px;
	}
}

.genre-chip {
	padding: 0.4rem 0.85rem;
	background: rgba(255, 255, 255, 0.06);
	border: 1px solid rgba(255, 255, 255, 0.12);
	border-radius: 20px;
	color: rgba(255, 255, 255, 0.8);
	font-size: 0.85rem;
	cursor: pointer;
	transition: all 0.2s ease;
	white-space: nowrap;

	&:hover {
		background: rgba(255, 255, 255, 0.12);
		border-color: rgba(255, 255, 255, 0.2);
	}

	&.selected {
		background: linear-gradient(135deg, #00bbf9, #0099cc);
		border-color: transparent;
		color: white;
		font-weight: 500;
		box-shadow: 0 2px 8px rgba(0, 187, 249, 0.3);
	}
}

.rating-display {
	display: flex;
	align-items: center;
	justify-content: center;
	gap: 0.5rem;
	font-size: 1.1rem;
	font-weight: 600;
	color: #00bbf9;

	.rating-separator {
		color: rgba(255, 255, 255, 0.4);
	}
}

.range-slider {
	position: relative;
	height: 24px;
	margin: 0.5rem 0;

	.range-track {
		position: absolute;
		top: 50%;
		left: 0;
		right: 0;
		height: 6px;
		background: rgba(255, 255, 255, 0.1);
		border-radius: 3px;
		transform: translateY(-50%);
	}

	.range-fill {
		position: absolute;
		top: 50%;
		height: 6px;
		background: linear-gradient(90deg, #00bbf9, #4cb1ff);
		border-radius: 3px;
		transform: translateY(-50%);
	}

	input[type='range'] {
		position: absolute;
		top: 0;
		left: 0;
		width: 100%;
		height: 100%;
		-webkit-appearance: none;
		appearance: none;
		background: transparent;
		pointer-events: none;
		margin: 0;

		&::-webkit-slider-thumb {
			-webkit-appearance: none;
			width: 20px;
			height: 20px;
			background: linear-gradient(135deg, #00bbf9, #0099cc);
			border-radius: 50%;
			cursor: pointer;
			pointer-events: auto;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
			border: 2px solid white;
			transition: transform 0.15s ease;

			&:hover {
				transform: scale(1.15);
			}
		}

		&::-moz-range-thumb {
			width: 20px;
			height: 20px;
			background: linear-gradient(135deg, #00bbf9, #0099cc);
			border-radius: 50%;
			cursor: pointer;
			pointer-events: auto;
			box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
			border: 2px solid white;
			transition: transform 0.15s ease;

			&:hover {
				transform: scale(1.15);
			}
		}
	}
}

.range-labels {
	display: flex;
	justify-content: space-between;
	font-size: 0.8rem;
	color: rgba(255, 255, 255, 0.4);
}

.menu-footer {
	padding: 1.25rem 1.5rem;
	border-top: 1px solid rgba(255, 255, 255, 0.1);
	display: flex;
	gap: 0.75rem;

	.clear-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		background: transparent;
		border: 1px solid rgba(255, 255, 255, 0.2);
		border-radius: 10px;
		color: rgba(255, 255, 255, 0.7);
		font-size: 0.95rem;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background: rgba(255, 255, 255, 0.08);
			color: white;
		}
	}

	.apply-btn {
		flex: 1;
		padding: 0.75rem 1rem;
		background: linear-gradient(135deg, #00bbf9, #0099cc);
		border: none;
		border-radius: 10px;
		color: white;
		font-size: 0.95rem;
		font-weight: 600;
		cursor: pointer;
		transition: all 0.2s ease;

		&:hover {
			background: linear-gradient(135deg, #00d4ff, #00bbf9);
			box-shadow: 0 4px 15px rgba(0, 187, 249, 0.4);
		}
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.25s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
}

.slide-enter-active {
	transition: opacity 0.25s ease, transform 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}

.slide-leave-active {
	transition: opacity 0.2s ease, transform 0.2s ease;
}

.slide-enter-from,
.slide-leave-to {
	opacity: 0;
	transform: translate(-50%, -50%) scale(0.9);
}

.slide-enter-to,
.slide-leave-from {
	transform: translate(-50%, -50%) scale(1);
}

:root[data-theme='light'] {
	.filter-btn {
		background: rgba(0, 0, 0, 0.05);
		border-color: rgba(0, 0, 0, 0.1);

		&:hover {
			background: rgba(0, 0, 0, 0.08);
		}

		.filter-badge {
			background: linear-gradient(135deg, #1e88e5, #42a5f5);
		}
	}

	.filter-menu {
		background: linear-gradient(180deg, #f8f9fa 0%, #ffffff 100%);
		border-color: rgba(0, 0, 0, 0.1);
		box-shadow: 0 20px 60px rgba(0, 0, 0, 0.2);

		.menu-header {
			border-bottom-color: rgba(0, 0, 0, 0.08);

			h3 {
				color: #212529;
			}

			.close-btn {
				background: rgba(0, 0, 0, 0.05);
				color: rgba(0, 0, 0, 0.5);

				&:hover {
					background: rgba(0, 0, 0, 0.1);
					color: #212529;
				}
			}
		}

		.filter-group {
			label {
				color: rgba(0, 0, 0, 0.5);

				.genre-count {
					color: #1e88e5;
				}
			}

			select {
				background: rgba(0, 0, 0, 0.04);
				border-color: rgba(0, 0, 0, 0.1);
				color: #212529;

				&:hover {
					background: rgba(0, 0, 0, 0.07);
				}

				&:focus {
					border-color: #1e88e5;
					box-shadow: 0 0 0 3px rgba(30, 136, 229, 0.15);
				}

				option {
					background: white;
					color: #212529;
				}
			}
		}

		.genre-chips {
			&::-webkit-scrollbar-track {
				background: rgba(0, 0, 0, 0.05);
			}

			&::-webkit-scrollbar-thumb {
				background: rgba(0, 0, 0, 0.15);
			}
		}

		.genre-chip {
			background: rgba(0, 0, 0, 0.04);
			border-color: rgba(0, 0, 0, 0.1);
			color: rgba(0, 0, 0, 0.7);

			&:hover {
				background: rgba(0, 0, 0, 0.08);
				border-color: rgba(0, 0, 0, 0.15);
			}

			&.selected {
				background: linear-gradient(135deg, #1e88e5, #1565c0);
				box-shadow: 0 2px 8px rgba(30, 136, 229, 0.25);
			}
		}

		.rating-display {
			color: #1e88e5;

			.rating-separator {
				color: rgba(0, 0, 0, 0.3);
			}
		}

		.range-slider {
			.range-track {
				background: rgba(0, 0, 0, 0.1);
			}

			.range-fill {
				background: linear-gradient(90deg, #1e88e5, #42a5f5);
			}

			input[type='range'] {
				&::-webkit-slider-thumb {
					background: linear-gradient(135deg, #1e88e5, #1565c0);
				}

				&::-moz-range-thumb {
					background: linear-gradient(135deg, #1e88e5, #1565c0);
				}
			}
		}

		.range-labels {
			color: rgba(0, 0, 0, 0.4);
		}

		.menu-footer {
			border-top-color: rgba(0, 0, 0, 0.08);

			.clear-btn {
				border-color: rgba(0, 0, 0, 0.15);
				color: rgba(0, 0, 0, 0.6);

				&:hover {
					background: rgba(0, 0, 0, 0.05);
					color: #212529;
				}
			}

			.apply-btn {
				background: linear-gradient(135deg, #1e88e5, #1565c0);

				&:hover {
					background: linear-gradient(135deg, #42a5f5, #1e88e5);
					box-shadow: 0 4px 15px rgba(30, 136, 229, 0.3);
				}
			}
		}
	}
}
</style>
