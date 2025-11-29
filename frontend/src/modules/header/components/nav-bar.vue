<script setup>
import { computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRoute } from 'vue-router';

const { t } = useI18n();
const route = useRoute();

const navItems = computed(() => [
	{ key: 'movies', label: t('nav.movies'), path: '/catalog/movies' },
	{ key: 'shows', label: t('nav.shows'), path: '/catalog/shows' },
	{ key: 'cartoons', label: t('nav.cartoons'), path: '/catalog/cartoons' },
	{ key: 'top', label: t('nav.top'), path: '/catalog/top' }
]);

const isActive = (path) => route.path === path;
</script>

<template>
	<nav class="nav-bar">
		<div class="nav-container">
			<router-link
				v-for="item in navItems"
				:key="item.key"
				:to="item.path"
				class="nav-item"
				:class="{ active: isActive(item.path) }"
			>
				<span class="nav-label">{{ item.label }}</span>
				<div class="nav-underline"></div>
			</router-link>
		</div>
	</nav>
</template>

<style lang="scss" scoped>
.nav-bar {
	position: relative;
	background: var(--nav-bg);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border-bottom: 1px solid var(--nav-border);
	padding: 0;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: var(--nav-accent-line);
	}
}

.nav-container {
	display: flex;
	justify-content: center;
	align-items: center;
	gap: 0.5rem;
	padding: 0.75rem 2rem;
	max-width: 1400px;
	margin: 0 auto;
}

.nav-item {
	position: relative;
	display: flex;
	align-items: center;
	padding: 0.75rem 1.75rem;
	text-decoration: none;
	color: var(--nav-item-color);
	font-family: 'Montserrat', sans-serif;
	font-weight: 500;
	font-size: 0.95rem;
	letter-spacing: 0.03em;
	border-radius: 10px;
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		inset: 0;
		background: var(--accent-color-light);
		opacity: 0;
		transition: opacity 0.3s ease;
		border-radius: 10px;
	}

	.nav-label {
		position: relative;
		z-index: 1;
	}

	.nav-underline {
		position: absolute;
		bottom: 0;
		left: 50%;
		width: 0;
		height: 2px;
		background: linear-gradient(90deg, transparent 0%, var(--accent-color) 50%, transparent 100%);
		transform: translateX(-50%);
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 2px;
	}

	&:hover {
		color: var(--nav-item-hover);

		&::before {
			opacity: 1;
		}

		.nav-underline {
			width: 60%;
		}
	}

	&.active {
		color: var(--nav-item-active);
		background: var(--accent-color-light);
		box-shadow: 0 0 20px var(--accent-shadow), inset 0 0 20px rgba(var(--accent-color), 0.05);

		.nav-underline {
			width: 80%;
			background: linear-gradient(90deg, transparent 0%, var(--accent-color) 20%, var(--accent-color) 80%, transparent 100%);
			box-shadow: 0 0 10px var(--accent-shadow);
		}
	}
}

/* Responsive */
@media (max-width: 768px) {
	.nav-container {
		gap: 0.25rem;
		padding: 0.5rem 1rem;
	}

	.nav-item {
		padding: 0.6rem 1rem;
		font-size: 0.85rem;
	}
}

@media (max-width: 480px) {
	.nav-item {
		padding: 0.5rem 0.75rem;
		font-size: 0.8rem;
	}
}
</style>
