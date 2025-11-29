<script setup>
import ContentCard from './content-card.vue';

defineProps({
	items: {
		type: Array,
		required: true
	},
	loading: {
		type: Boolean,
		default: false
	}
});
</script>

<template>
	<div class="content-grid-wrapper">
		<div v-if="loading" class="loading-overlay">
			<div class="loader">
				<div class="loader-ring"></div>
				<div class="loader-ring"></div>
				<div class="loader-ring"></div>
			</div>
		</div>
		<div v-else-if="items.length === 0" class="empty-state">
			<span class="empty-icon">🎬</span>
			<p>Нічого не знайдено</p>
		</div>
		<div v-else class="content-grid">
			<ContentCard v-for="item in items" :key="item.id" :item="item" />
		</div>
	</div>
</template>

<style lang="scss" scoped>
.content-grid-wrapper {
	min-height: 400px;
	position: relative;
}

.content-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 1.5rem;
	padding: 1rem 0;

	@media (min-width: 768px) {
		grid-template-columns: repeat(auto-fill, minmax(200px, 1fr));
	}

	@media (min-width: 1200px) {
		grid-template-columns: repeat(6, 1fr);
	}
}

.loading-overlay {
	display: flex;
	justify-content: center;
	align-items: center;
	min-height: 400px;

	.loader {
		display: flex;
		gap: 8px;

		.loader-ring {
			width: 20px;
			height: 20px;
			border-radius: 50%;
			background: var(--accent-gradient);
			animation: pulse 1.4s ease-in-out infinite;

			&:nth-child(2) {
				animation-delay: 0.2s;
			}

			&:nth-child(3) {
				animation-delay: 0.4s;
			}
		}
	}
}

@keyframes pulse {
	0%,
	100% {
		transform: scale(1);
		opacity: 1;
	}
	50% {
		transform: scale(0.5);
		opacity: 0.5;
	}
}

.empty-state {
	display: flex;
	flex-direction: column;
	align-items: center;
	justify-content: center;
	min-height: 400px;
	color: var(--text-color-secondary);

	.empty-icon {
		font-size: 4rem;
		margin-bottom: 1rem;
	}

	p {
		font-size: 1.2rem;
	}
}

:root[data-theme='light'] {
	.empty-state {
		color: rgba(0, 0, 0, 0.6);
	}
}
</style>
