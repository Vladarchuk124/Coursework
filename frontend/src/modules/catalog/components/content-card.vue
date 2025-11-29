<script setup>
import { computed } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { contentTypes } from '../../../../enums/content-type';

const props = defineProps({
	item: {
		type: Object,
		required: true
	}
});

const router = useRouter();
const { t } = useI18n();

const posterUrl = computed(() => {
	return props.item.poster_path ? `https://image.tmdb.org/t/p/w500${props.item.poster_path}` : null;
});

const title = computed(() => {
	return props.item.title || props.item.name;
});

const releaseYear = computed(() => {
	const date = props.item.release_date || props.item.first_air_date;
	if (!date) return null;
	return new Date(date).getFullYear();
});

const rating = computed(() => {
	return props.item.vote_average?.toFixed(1) || '—';
});

const ratingColor = computed(() => {
	const value = props.item.vote_average;
	if (!Number.isFinite(value)) return '#4c566a';
	if (value < 4) return '#dc3545';
	if (value < 6) return '#ff9800';
	if (value < 8) return '#ffc107';
	if (value < 9) return '#28a745';
	return '#17a2b8';
});

const isShow = computed(() => {
	return props.item.media_type === 'tv' || props.item.first_air_date;
});

const mediaType = computed(() => {
	return isShow.value ? contentTypes.show : contentTypes.movie;
});

const mediaTypeLabel = computed(() => {
	return isShow.value ? t('content.show') : t('content.movie');
});

const goToDetails = () => {
	router.push(`/content-details/${mediaType.value}/${props.item.id}`);
};
</script>

<template>
	<div class="content-card" @click="goToDetails">
		<div class="card-poster">
			<img v-if="posterUrl" :src="posterUrl" :alt="title" loading="lazy" />
			<div v-else class="no-poster">
				<span>📽️</span>
			</div>
			<div class="card-overlay"></div>
			<div class="card-type" :class="{ show: isShow }">
				{{ mediaTypeLabel }}
			</div>
		</div>
		<div class="card-info">
			<h3 class="card-title">{{ title }}</h3>
			<div class="card-meta">
				<span v-if="releaseYear" class="card-year">{{ releaseYear }}</span>
				<span class="card-rating" :style="{ backgroundColor: ratingColor }">
					{{ rating }}
				</span>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.content-card {
	position: relative;
	cursor: pointer;
	border-radius: 12px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.05);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);

	&:hover {
		transform: translateY(-8px) scale(1.02);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4), 0 0 30px rgba(0, 187, 249, 0.15);

		.card-overlay {
			opacity: 1;
		}

		.card-poster img {
			transform: scale(1.1);
		}
	}
}

.card-poster {
	position: relative;
	aspect-ratio: 2/3;
	overflow: hidden;

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
		background: linear-gradient(135deg, #1a1a2e 0%, #0f0f23 100%);
		font-size: 3rem;
	}
}

.card-overlay {
	position: absolute;
	inset: 0;
	background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.3) 50%, rgba(0, 0, 0, 0.7) 100%);
	opacity: 0;
	transition: opacity 0.3s ease;
}

.card-type {
	position: absolute;
	top: 10px;
	left: 10px;
	padding: 4px 10px;
	border-radius: 6px;
	font-size: 0.7rem;
	font-weight: 600;
	text-transform: uppercase;
	letter-spacing: 0.5px;
	color: white;
	background: rgba(0, 0, 0, 0.7);
	backdrop-filter: blur(4px);

	&.show {
		background: rgba(156, 39, 176, 0.85);
	}
}

.card-info {
	padding: 12px;

	.card-title {
		margin: 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: var(--text-color);
		line-height: 1.3;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-meta {
		display: flex;
		align-items: center;
		justify-content: space-between;
		margin-top: 6px;
		gap: 8px;
	}

	.card-year {
		font-size: 0.85rem;
		color: rgba(255, 255, 255, 0.6);
	}

	.card-rating {
		padding: 2px 8px;
		border-radius: 12px;
		font-size: 0.75rem;
		font-weight: 600;
		color: white;
	}
}

:root[data-theme='light'] {
	.content-card {
		background: rgba(255, 255, 255, 0.95);
		box-shadow: 0 2px 10px rgba(0, 0, 0, 0.08);
		border: 1px solid rgba(0, 0, 0, 0.05);

		&:hover {
			box-shadow: 0 20px 40px rgba(0, 0, 0, 0.12), 0 0 30px rgba(30, 136, 229, 0.15);
			border-color: rgba(30, 136, 229, 0.2);
			transform: translateY(-8px) scale(1.02);
		}
	}

	.card-overlay {
		background: linear-gradient(180deg, transparent 0%, rgba(0, 0, 0, 0.2) 50%, rgba(0, 0, 0, 0.5) 100%);
	}

	.card-info {
		.card-title {
			color: #212529;
		}

		.card-year {
			color: rgba(0, 0, 0, 0.6);
		}
	}

	.no-poster {
		background: linear-gradient(135deg, #e0e0e0 0%, #f5f5f5 100%);
	}
}
</style>
