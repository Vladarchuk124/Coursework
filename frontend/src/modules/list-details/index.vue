<script setup>
import { computed, onMounted, ref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { actions } from './store/actions';
import { useI18n } from 'vue-i18n';
import { contentTypes } from '../../../enums/content-type';

const { locale, t } = useI18n();
const route = useRoute();
const router = useRouter();

const list = ref();
const listId = computed(() => route.params.id);

const getLocalizedListTitle = (title) => {
	if (!title) return title;

	const normalizedTitle = title.trim();

	switch (normalizedTitle) {
		case 'Favorites':
		case 'Обране':
			return t('userProfile.lists.names.favorites');
		case 'Watched':
		case 'Переглянуто':
			return t('userProfile.lists.names.watched');
		case 'Watchlist':
		case 'Хочу подивитися':
			return t('userProfile.lists.names.watchlist');
		default:
			return title;
	}
};

const contentTitle = (item) => {
	if (locale.value === 'uk') {
		return item.content_title_uk;
	}
	return item.content_title_en;
};

const contentType = (item) => {
	if (item.content_type === contentTypes.movie) {
		return locale.value === 'uk' ? contentTypes.movie_uk : contentTypes.movie;
	}
	return locale.value === 'uk' ? contentTypes.show_uk : contentTypes.show;
};

const handleClick = (id, content_type) => {
	let type;
	switch (content_type) {
		case contentTypes.movie:
		case contentTypes.movie_uk:
			type = contentTypes.movie;
			break;
		case contentTypes.show:
		case contentTypes.show_uk:
			type = contentTypes.show;
			break;
		default:
			return;
	}
	router.push(`/content-details/${type}/${id}`);
};

const handleRemove = async (id) => {
	const confirmed = window.confirm(t('listDetails.removeConfirm'));
	if (!confirmed) return;

	await actions.removeItemFromList(id);
	await loadList();
};

const loadList = async () => {
	list.value = await actions.getList(listId.value);
};

const goBack = () => {
	router.back();
};

onMounted(() => {
	loadList();
});
</script>

<template>
	<div class="list-details">
		<button class="btn" type="button" @click="goBack">
			<span class="icon">←</span>
			<span>{{ t('listDetails.back') }}</span>
		</button>
		<h1>{{ getLocalizedListTitle(list?.title) }}</h1>

		<div v-if="list?.items.length" class="content-container">
			<div
				v-for="item in list?.items"
				class="content-item"
				@click="() => handleClick(item.content_id, item.content_type)"
			>
				<button
					type="button"
					class="content-item__remove"
					@click.stop="() => handleRemove(item.id)"
					aria-label="delete-from-list"
				>
					X
				</button>
				<div
					class="eyebrow"
					:class="{ show: item.content_type === contentTypes.show || item.content_type === contentTypes.show_uk }"
				>
					{{ contentType(item) }}
				</div>
				<img :src="`https://image.tmdb.org/t/p/original${item.poster_path}`" />
				<h4>{{ contentTitle(item) }}</h4>
			</div>
		</div>
		<h3 v-else class="empty">{{ t('listDetails.empty') }}</h3>
	</div>
</template>

<style lang="scss" scoped>
.list-details {
	position: relative;
	display: flex;
	flex-direction: column;
	align-items: center;
	margin: 2rem 5rem;
	padding: 2rem 5rem;
	border-radius: 24px;
	background: var(--header-color);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.08);

	h1 {
		color: #ffffff;
	}

	.btn {
		position: absolute;
		display: flex;
		top: 3rem;
		left: 2rem;
		border: none;
		border-radius: 12px;
		padding: 0.85rem 1.2rem;
		font-weight: 700;
		cursor: pointer;
		color: white;
		background: var(--list-details-btn-bg);
		box-shadow: var(--list-details-btn-shadow);
		transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.2s ease, opacity 0.2s ease;

		&:hover {
			transform: translateY(-1px);
		}

		&:disabled {
			opacity: 0.7;
			cursor: not-allowed;
			transform: none;
		}
	}

	.content-container {
		display: flex;
		flex-wrap: wrap;
		margin-top: 2rem;
		gap: 2rem;
	}

	.content-item {
		position: relative;
		flex: 0 0 10rem;
		display: flex;
		flex-direction: column;
		align-items: center;
		margin-bottom: 2rem;
		border-radius: 20px;
		overflow: hidden;
		background: radial-gradient(circle at top, #0b1120, #020617);
		border: 1px solid rgba(148, 163, 184, 0.4);
		cursor: pointer;
		box-shadow: 0 18px 40px rgba(15, 23, 42, 0.7);
		transition: transform 0.16s ease, box-shadow 0.16s ease, border-color 0.16s ease;

		&:hover {
			transform: translateY(-4px);
			box-shadow: var(--list-details-content-item-hover-shadow);
			border-color: var(--list-details-content-item-hover-border);
		}

		.eyebrow {
			position: absolute;
			top: 0.75rem;
			right: 0.75rem;
			padding: 0.18rem 0.7rem;
			border-radius: 999px;
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

		img {
			width: 10rem;
			display: block;
		}

		h4 {
			margin: 0;
			padding: 0.6rem 0.6rem 0.7rem;
			width: 100%;
			font-size: 0.95rem;
			font-weight: 600;
			text-align: center;
			color: #e5e7eb;
		}

		&__remove {
			position: absolute;
			top: 0.4rem;
			left: 0.4rem;
			width: 1.7rem;
			height: 1.7rem;
			border-radius: 999px;
			border: none;
			display: flex;
			align-items: center;
			justify-content: center;
			font-size: 0.9rem;
			font-weight: 700;
			cursor: pointer;
			color: #e5e7eb;
			background: rgba(15, 23, 42, 0.85);
			border: 1px solid rgba(248, 113, 113, 0.85);
			box-shadow: 0 8px 18px rgba(0, 0, 0, 0.7);
			transition: transform 0.12s ease, box-shadow 0.16s ease, background-color 0.16s ease, opacity 0.16s ease;

			&:hover {
				transform: translateY(-1px);
				background: rgba(185, 28, 28, 0.9);
				box-shadow: 0 10px 22px rgba(127, 29, 29, 0.8);
			}
		}
	}

	.empty {
		color: white;
		margin-top: 3rem;
		padding: 2.5rem 2rem;
		max-width: 480px;
		text-align: center;
		border-radius: 20px;
		border: 1px dashed rgba(148, 163, 184, 0.6);
		background: radial-gradient(circle at top, rgba(131, 135, 145, 0.493), rgba(135, 140, 153, 0.473));
		box-shadow: 0 18px 40px rgba(15, 23, 42, 0.7);

		&__icon {
			font-size: 2.5rem;
			margin-bottom: 0.75rem;
		}

		&__title {
			margin: 0 0 0.35rem;
			font-size: 1.25rem;
			font-weight: 600;
			color: #f9fafb;
		}

		&__subtitle {
			margin: 0;
			font-size: 0.95rem;
			color: #9ca3af;
		}
	}
}
</style>
