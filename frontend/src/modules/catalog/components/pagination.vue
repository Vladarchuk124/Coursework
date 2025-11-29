<script setup>
import { computed } from 'vue';

const props = defineProps({
	currentPage: {
		type: Number,
		required: true
	},
	totalPages: {
		type: Number,
		required: true
	},
	maxVisible: {
		type: Number,
		default: 5
	}
});

const emit = defineEmits(['update:currentPage']);

const visiblePages = computed(() => {
	const pages = [];
	const total = Math.min(props.totalPages, 500);
	const half = Math.floor(props.maxVisible / 2);

	let start = Math.max(1, props.currentPage - half);
	let end = Math.min(total, start + props.maxVisible - 1);

	if (end - start + 1 < props.maxVisible) {
		start = Math.max(1, end - props.maxVisible + 1);
	}

	for (let i = start; i <= end; i++) {
		pages.push(i);
	}

	return pages;
});

const canGoPrev = computed(() => props.currentPage > 1);
const canGoNext = computed(() => props.currentPage < Math.min(props.totalPages, 500));

const goToPage = (page) => {
	if (page >= 1 && page <= Math.min(props.totalPages, 500)) {
		emit('update:currentPage', page);
	}
};

const goPrev = () => {
	if (canGoPrev.value) {
		goToPage(props.currentPage - 1);
	}
};

const goNext = () => {
	if (canGoNext.value) {
		goToPage(props.currentPage + 1);
	}
};
</script>

<template>
	<div class="pagination">
		<button class="pagination-btn nav-btn" :disabled="!canGoPrev" @click="goPrev">
			<span class="arrow">←</span>
		</button>

		<button v-if="visiblePages[0] > 1" class="pagination-btn" @click="goToPage(1)">1</button>

		<span v-if="visiblePages[0] > 2" class="ellipsis">...</span>

		<button
			v-for="page in visiblePages"
			:key="page"
			class="pagination-btn"
			:class="{ active: page === currentPage }"
			@click="goToPage(page)"
		>
			{{ page }}
		</button>

		<span v-if="visiblePages[visiblePages.length - 1] < Math.min(totalPages, 500) - 1" class="ellipsis">...</span>

		<button
			v-if="visiblePages[visiblePages.length - 1] < Math.min(totalPages, 500)"
			class="pagination-btn"
			@click="goToPage(Math.min(totalPages, 500))"
		>
			{{ Math.min(totalPages, 500) }}
		</button>

		<button class="pagination-btn nav-btn" :disabled="!canGoNext" @click="goNext">
			<span class="arrow">→</span>
		</button>
	</div>
</template>

<style lang="scss" scoped>
.pagination {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 0.5rem;
	padding: 2rem 0;
	flex-wrap: wrap;
}

.pagination-btn {
	display: flex;
	align-items: center;
	justify-content: center;
	min-width: 40px;
	height: 40px;
	padding: 0 12px;
	border: none;
	border-radius: 10px;
	background: var(--surface-color);
	color: var(--text-color);
	font-size: 0.95rem;
	font-weight: 500;
	cursor: pointer;
	transition: all 0.2s ease;

	&:hover:not(:disabled) {
		background: var(--accent-color-light);
		color: var(--accent-color);
		transform: translateY(-2px);
	}

	&.active {
		background: var(--accent-gradient);
		color: var(--btn-primary-text);
		box-shadow: var(--btn-primary-shadow);
	}

	&:disabled {
		opacity: 0.3;
		cursor: not-allowed;
	}

	&.nav-btn {
		.arrow {
			font-size: 1.1rem;
		}
	}
}

.ellipsis {
	color: var(--text-color-tertiary);
	padding: 0 8px;
}

:root[data-theme='light'] {
	.pagination-btn {
		background: rgba(255, 255, 255, 0.95);
		border: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 2px 4px rgba(0, 0, 0, 0.05);

		&:hover:not(:disabled) {
			background: rgba(30, 136, 229, 0.1);
			border-color: rgba(30, 136, 229, 0.3);
			color: #1e88e5;
			box-shadow: 0 4px 8px rgba(0, 0, 0, 0.1);
		}

		&.active {
			background: linear-gradient(135deg, #1e88e5, #42a5f5);
			border-color: transparent;
			box-shadow: 0 8px 24px rgba(30, 136, 229, 0.35);
		}

		&:disabled {
			opacity: 0.4;
		}
	}

	.ellipsis {
		color: rgba(0, 0, 0, 0.4);
	}
}
</style>
