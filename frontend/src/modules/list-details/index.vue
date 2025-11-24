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
	const confirmed = window.confirm('Видалити цей елемент зі списку?');
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
			<span>Назад</span>
		</button>
		<h1>{{ list?.title }}</h1>

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
				<div class="eyebrow">{{ contentType(item) }}</div>
				<img :src="`https://image.tmdb.org/t/p/original${item.poster_path}`" />
				<h4>{{ contentTitle(item) }}</h4>
			</div>
		</div>
		<h3 v-else class="empty">У цьому списку поки немає елементів</h3>
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
		color: #ffffff;
		background: linear-gradient(135deg, #00bbf9, #4cb1ff);
		box-shadow: 0 12px 30px rgba(0, 187, 249, 0.35);
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
			box-shadow: 0 24px 55px rgba(15, 23, 42, 0.9);
			border-color: rgba(248, 250, 252, 0.7);
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
			letter-spacing: 0.08em;
			color: #e5e7eb;
			background: rgba(15, 23, 42, 0.86);
			border: 1px solid rgba(148, 163, 184, 0.7);
			backdrop-filter: blur(8px);
			box-shadow: 0 8px 20px rgba(15, 23, 42, 0.8);
			white-space: nowrap;
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
		margin-top: 3rem;
		padding: 2.5rem 2rem;
		max-width: 480px;
		text-align: center;
		border-radius: 20px;
		border: 1px dashed rgba(148, 163, 184, 0.6);
		background: radial-gradient(circle at top, rgba(15, 23, 42, 0.85), rgba(15, 23, 42, 0.6));
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
