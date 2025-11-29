<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { contentTypes } from '../../../../enums/content-type';

const props = defineProps({
	title: {
		type: String,
		required: true
	},
	items: {
		type: Array,
		default: () => []
	},
	loading: {
		type: Boolean,
		default: false
	},
	link: {
		type: String,
		default: null
	}
});

const router = useRouter();
const scrollContainer = ref(null);

const scroll = (direction) => {
	if (!scrollContainer.value) return;
	const scrollAmount = 400;
	scrollContainer.value.scrollBy({
		left: direction === 'left' ? -scrollAmount : scrollAmount,
		behavior: 'smooth'
	});
};

const getMediaType = (item) => {
	if (item.media_type === 'tv' || item.first_air_date) {
		return contentTypes.show;
	}
	return contentTypes.movie;
};

const goToDetails = (item) => {
	router.push(`/content-details/${getMediaType(item)}/${item.id}`);
};

const getTitle = (item) => {
	return item.title || item.name;
};

const getRating = (item) => {
	return item.vote_average?.toFixed(1) || '—';
};

const getRatingColor = (rating) => {
	const value = Number(rating);
	if (!Number.isFinite(value)) return '#4c566a';
	if (value < 4) return '#dc3545';
	if (value < 6) return '#ff9800';
	if (value < 8) return '#ffc107';
	if (value < 9) return '#28a745';
	return '#17a2b8';
};

const goToCategory = () => {
	if (props.link) {
		router.push(props.link);
	}
};
</script>

<template>
	<section class="content-row">
		<div class="row-header">
			<h2 class="row-title" :class="{ clickable: link }" @click="goToCategory">
				{{ title }}
				<span v-if="link" class="arrow">→</span>
			</h2>
			<div class="scroll-buttons">
				<button class="scroll-btn" @click="scroll('left')">‹</button>
				<button class="scroll-btn" @click="scroll('right')">›</button>
			</div>
		</div>

		<div v-if="loading" class="loading-row">
			<div v-for="i in 6" :key="i" class="skeleton-card" />
		</div>

		<div v-else ref="scrollContainer" class="items-container">
			<div v-for="item in items" :key="item.id" class="content-item" @click="goToDetails(item)">
				<div class="item-poster">
					<img
						v-if="item.poster_path"
						:src="`https://image.tmdb.org/t/p/w342${item.poster_path}`"
						:alt="getTitle(item)"
						loading="lazy"
					/>
					<div v-else class="no-poster">📽️</div>
					<div class="item-overlay" />
				</div>
				<div class="item-info">
					<h3 class="item-title">{{ getTitle(item) }}</h3>
					<div class="item-meta">
						<span class="item-rating" :style="{ backgroundColor: getRatingColor(item.vote_average) }">
							{{ getRating(item) }}
						</span>
					</div>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.content-row {
	padding: 1.5rem 0;
}

.row-header {
	display: flex;
	justify-content: space-between;
	align-items: center;
	margin-bottom: 1rem;
	padding: 0 2rem;
}

.row-title {
	font-size: 1.5rem;
	font-weight: 700;
	color: white;
	margin: 0;
	display: flex;
	align-items: center;
	gap: 0.5rem;

	&.clickable {
		cursor: pointer;
		transition: color 0.2s ease;

		&:hover {
			.arrow {
				transform: translateX(4px);
			}
		}
	}

	.arrow {
		font-size: 1.2rem;
		transition: transform 0.2s ease;
	}
}

.scroll-buttons {
	display: flex;
	gap: 0.5rem;
}

.scroll-btn {
	width: 36px;
	height: 36px;
	border-radius: 50%;
	border: 1px solid var(--root-content-row-scroll-btn-border);
	background: var(--root-content-row-scroll-btn-bg);
	color: white;
	font-size: 1.5rem;
	cursor: pointer;
	transition: all 0.2s ease;
	display: flex;
	align-items: center;
	justify-content: center;

	&:hover {
		background: var(--root-content-row-scroll-btn-hover-bg);
		border-color: var(--root-content-row-scroll-btn-hover-border);
	}
}

.loading-row {
	display: flex;
	gap: 1rem;
	padding: 0 2rem;
	overflow: hidden;
}

.skeleton-card {
	flex-shrink: 0;
	width: 180px;
	height: 320px;
	background: var(--root-content-row-skeleton-card-bg);
	background-size: 200% 100%;
	animation: shimmer 1.5s infinite;
	border-radius: 12px;
}

@keyframes shimmer {
	0% {
		background-position: 200% 0;
	}
	100% {
		background-position: -200% 0;
	}
}

.items-container {
	display: flex;
	gap: 1rem;
	overflow-x: auto;
	margin: 0 2rem;
	padding: 0 2rem 1rem;
	scroll-snap-type: x mandatory;
	scrollbar-width: none;
	-ms-overflow-style: none;

	&::-webkit-scrollbar {
		display: none;
	}
}

.content-item {
	flex-shrink: 0;
	width: 180px;
	cursor: pointer;
	scroll-snap-align: start;
	transition: transform 0.3s ease;

	&:hover {
		transform: translateY(-8px);

		.item-overlay {
			opacity: 1;
		}

		.item-poster img {
			transform: scale(1.05);
		}
	}
}

.item-poster {
	position: relative;
	aspect-ratio: 2/3;
	border-radius: 12px;
	overflow: hidden;
	background: var(--root-content-row-item-poster-bg);

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.no-poster {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: var(--root-content-row-no-poster-bg);
		font-size: 2.5rem;
	}
}

.item-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, transparent 50%, rgba(0, 0, 0, 0.7) 100%);
	opacity: 0;
	transition: opacity 0.3s ease;
}

.item-info {
	padding: 0.75rem 0.25rem;
}

.item-title {
	margin: 0;
	font-size: 0.9rem;
	font-weight: 600;
	color: white;
	line-height: 1.3;
	display: -webkit-box;
	-webkit-line-clamp: 2;
	line-clamp: 2;
	-webkit-box-orient: vertical;
	overflow: hidden;
}

.item-meta {
	display: flex;
	justify-content: flex-start;
	margin-top: 0.5rem;
}

.item-rating {
	padding: 2px 8px;
	border-radius: 10px;
	font-size: 0.75rem;
	font-weight: 600;
	color: var(--root-content-row-item-rating-color);
}
</style>
