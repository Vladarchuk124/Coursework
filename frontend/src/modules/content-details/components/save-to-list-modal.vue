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
					<span class="modal__list-title">{{ list.title }}</span>
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
	z-index: 5;

	&__backdrop {
		position: absolute;
		inset: 0;
		background: rgba(0, 0, 0, 0.5);
		backdrop-filter: blur(6px);
	}

	&__dialog {
		position: relative;
		z-index: 1;
		background: var(--header-color);
		border: 1px solid rgba(255, 255, 255, 0.12);
		border-radius: 16px;
		padding: 1.5rem;
		min-width: min(480px, 90%);
		box-shadow: 0 20px 50px rgba(0, 0, 0, 0.4);
		display: flex;
		flex-direction: column;
		gap: 1rem;

		h3 {
			margin: 0;
			color: #ffffff;
		}
	}

	&__hint {
		margin: 0;
		color: rgba(255, 255, 255, 0.75);
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
		border: 1px solid rgba(255, 255, 255, 0.2);
		background: rgba(0, 0, 0, 0.2);
		color: var(--text-color);
		font-weight: 700;
		cursor: pointer;
		transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.18s ease, border-color 0.18s ease;

		&:hover {
			transform: translateY(-1px);
			border-color: rgba(0, 187, 249, 0.6);
		}

		&.active {
			background: linear-gradient(135deg, rgba(0, 187, 249, 0.18), rgba(0, 187, 249, 0.08));
			border-color: rgba(0, 187, 249, 0.8);
			box-shadow: 0 12px 30px rgba(0, 187, 249, 0.2);
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
		color: #ff6b6b;
		font-weight: 600;
	}
}

.btn {
	border: none;
	border-radius: 12px;
	padding: 0.85rem 1.2rem;
	font-weight: 700;
	cursor: pointer;
	color: #0a0c10;
	transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.2s ease, opacity 0.2s ease;

	&.primary {
		background: linear-gradient(135deg, #00bbf9, #4cb1ff);
		box-shadow: 0 12px 30px rgba(0, 187, 249, 0.35);
	}

	&.ghost {
		background: transparent;
		color: var(--text-color);
		border: 1px solid rgba(255, 255, 255, 0.16);
	}

	&:hover {
		transform: translateY(-1px);
	}

	&:disabled {
		opacity: 0.7;
		cursor: not-allowed;
		transform: none;
	}
}
</style>
