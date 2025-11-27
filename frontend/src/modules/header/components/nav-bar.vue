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
	background: linear-gradient(180deg, rgba(0, 0, 0, 0.6) 0%, rgba(0, 0, 0, 0.4) 50%, rgba(0, 0, 0, 0.2) 100%);
	backdrop-filter: blur(20px);
	-webkit-backdrop-filter: blur(20px);
	border-bottom: 1px solid rgba(255, 255, 255, 0.08);
	padding: 0;
	overflow: hidden;

	&::before {
		content: '';
		position: absolute;
		top: 0;
		left: 0;
		right: 0;
		height: 1px;
		background: linear-gradient(
			90deg,
			transparent 0%,
			rgba(0, 187, 249, 0.5) 20%,
			rgba(0, 187, 249, 0.8) 50%,
			rgba(0, 187, 249, 0.5) 80%,
			transparent 100%
		);
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
	color: rgba(255, 255, 255, 0.7);
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
		background: linear-gradient(135deg, rgba(0, 187, 249, 0.1) 0%, rgba(0, 187, 249, 0.05) 100%);
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
		background: linear-gradient(90deg, transparent 0%, #00bbf9 50%, transparent 100%);
		transform: translateX(-50%);
		transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
		border-radius: 2px;
	}

	&:hover {
		color: #ffffff;

		&::before {
			opacity: 1;
		}

		.nav-underline {
			width: 60%;
		}
	}

	&.active {
		color: #00bbf9;
		background: linear-gradient(135deg, rgba(0, 187, 249, 0.15) 0%, rgba(0, 187, 249, 0.08) 100%);
		box-shadow: 0 0 20px rgba(0, 187, 249, 0.2), inset 0 0 20px rgba(0, 187, 249, 0.05);

		.nav-underline {
			width: 80%;
			background: linear-gradient(90deg, transparent 0%, #00bbf9 20%, #00bbf9 80%, transparent 100%);
			box-shadow: 0 0 10px rgba(0, 187, 249, 0.6);
		}
	}
}

/* Light theme */
:root[data-theme='light'] {
	.nav-bar {
		background: linear-gradient(
			180deg,
			rgba(255, 255, 255, 0.9) 0%,
			rgba(255, 255, 255, 0.7) 50%,
			rgba(255, 255, 255, 0.5) 100%
		);
		border-bottom: 1px solid rgba(0, 0, 0, 0.1);
		box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);

		&::before {
			background: linear-gradient(
				90deg,
				transparent 0%,
				rgba(30, 136, 229, 0.4) 20%,
				rgba(30, 136, 229, 0.7) 50%,
				rgba(30, 136, 229, 0.4) 80%,
				transparent 100%
			);
		}
	}

	.nav-item {
		color: rgba(0, 0, 0, 0.6);

		&::before {
			background: linear-gradient(135deg, rgba(30, 136, 229, 0.15) 0%, rgba(30, 136, 229, 0.08) 100%);
		}

		.nav-underline {
			background: linear-gradient(90deg, transparent 0%, #1e88e5 50%, transparent 100%);
		}

		&:hover {
			color: #1565c0;
		}

		&.active {
			color: #1e88e5;
			background: linear-gradient(135deg, rgba(30, 136, 229, 0.2) 0%, rgba(30, 136, 229, 0.1) 100%);
			box-shadow: 0 0 20px rgba(30, 136, 229, 0.15), inset 0 0 20px rgba(30, 136, 229, 0.05);

			.nav-underline {
				background: linear-gradient(90deg, transparent 0%, #1e88e5 20%, #1e88e5 80%, transparent 100%);
				box-shadow: 0 0 10px rgba(30, 136, 229, 0.4);
			}
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
