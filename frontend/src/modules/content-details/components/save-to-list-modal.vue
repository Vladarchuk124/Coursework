<script setup>
import { ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';

const props = defineProps({
	show: Boolean,
	lists: Array,
	loading: Boolean
});

const emit = defineEmits(['close', 'confirm']);

const { t } = useI18n();

const selectedListIds = ref([]);
const localError = ref('');

watch(
	() => props.show,
	(value) => {
		if (value) {
			selectedListIds.value = [];
			localError.value = '';
		}
	}
);

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

const closeAddModal = () => {
	selectedListIds.value = [];
	localError.value = '';
	emit('close');
};

const toggleListSelection = (listId) => {
	const normalizedId = Number(listId);
	const exists = selectedListIds.value.includes(normalizedId);

	selectedListIds.value = exists
		? selectedListIds.value.filter((id) => id !== normalizedId)
		: [...selectedListIds.value, normalizedId];
};

const handleAddToList = () => {
	if (!selectedListIds.value.length) {
		localError.value = t('contentDetails.listModal.required');
		return;
	}

	emit('confirm', selectedListIds.value);
	selectedListIds.value = [];
	localError.value = '';
};
</script>

<template>
	<div v-if="show" class="modal">
		<div class="modal__backdrop" @click="closeAddModal" />
		<div class="modal__dialog">
			<h3>{{ t('contentDetails.listModal.title') }}</h3>

			<p class="modal__hint">
				{{ loading ? t('contentDetails.listModal.loading') : t('contentDetails.listModal.selectLabel') }}
			</p>

			<div class="modal__list" role="list">
				<button
					v-for="list in lists"
					:key="list.id"
					type="button"
					class="modal__list-item"
					:class="{ active: selectedListIds.includes(Number(list.id)) }"
					@click="toggleListSelection(list.id)"
				>
					<span class="modal__list-title">{{ getLocalizedListTitle(list.title) }}</span>
				</button>
			</div>

			<p v-if="localError" class="modal__error">{{ localError }}</p>

			<div class="modal__actions">
				<button type="button" class="btn primary" :disabled="loading" @click="handleAddToList">
					{{ t('contentDetails.listModal.addButton') }}
				</button>
				<button type="button" class="btn ghost" @click="closeAddModal">
					{{ t('contentDetails.listModal.cancelButton') }}
				</button>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.modal {
	position: fixed;
	inset: 0;
	display: flex;
	align-items: center;
	justify-content: center;
	z-index: 1000;

	&__backdrop {
		position: absolute;
		inset: 0;
		background: var(--modal-backdrop);
		backdrop-filter: blur(6px);
	}

	&__dialog {
		position: relative;
		z-index: 1;
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		border-radius: 16px;
		padding: 1.5rem;
		min-width: min(480px, 90%);
		box-shadow: var(--shadow-xl);
		display: flex;
		flex-direction: column;
		gap: 1rem;

		h3 {
			margin: 0;
			color: var(--text-color);
		}
	}

	&__hint {
		margin: 0;
		color: var(--text-color-secondary);
		font-weight: 600;
	}

	&__list {
		display: grid;
		grid-template-columns: repeat(auto-fit, minmax(160px, 1fr));
		gap: 0.75rem;
	}

	&__list-item {
		display: flex;
		align-items: center;
		justify-content: center;
		padding: 0.9rem 1rem;
		border-radius: 12px;
		border: 1px solid var(--border-color);
		background: var(--input-bg);
		color: var(--text-color);
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;

		&:hover {
			transform: translateY(-1px);
			border-color: var(--accent-color);
		}

		&.active {
			background: var(--accent-color-light);
			border-color: var(--accent-color);
			box-shadow: 0 12px 30px var(--accent-shadow);
		}
	}

	&__list-title {
		overflow: hidden;
		text-overflow: ellipsis;
		white-space: nowrap;
	}

	&__actions {
		display: flex;
		justify-content: flex-end;
		gap: 0.75rem;
	}

	&__error {
		margin: 0;
		color: var(--error-color);
		font-weight: 600;
	}
}
</style>
