<script setup>
import SearchBar from './components/search-bar.vue';
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';
import { actions } from './store/actions';

const { locale, t } = useI18n();
const isDark = ref(true);

const toggleLocale = () => {
	const newLocale = locale.value === 'uk' ? 'en' : 'uk';
	locale.value = newLocale;
	localStorage.setItem('locale', newLocale);
};
const toggleTheme = () => {
	isDark.value = !isDark.value;
	document.documentElement.setAttribute('data-theme', isDark.value ? 'dark' : 'light');
	localStorage.setItem('theme', isDark.value ? 'dark' : 'light');
};

onMounted(() => {
	const savedTheme = localStorage.getItem('theme') || 'dark';
	isDark.value = savedTheme === 'dark';
	document.documentElement.setAttribute('data-theme', savedTheme);

	const savedLocale = localStorage.getItem('locale');
	if (savedLocale) {
		locale.value = savedLocale;
	}
});
</script>

<template>
	<header>
		<router-link to="/popular-movies" class="header-logo"><h1>MOVIERACK</h1></router-link>
		<SearchBar :do-search="actions.doSearch" />
		<div class="controllers">
			<div
				class="locale-switch"
				:class="{ 'is-en': locale === 'en' }"
				@click="toggleLocale"
				:aria-label="t('header.toggleLocale')"
				role="button"
			>
				<span class="locale-label" :class="{ active: locale === 'uk' }">УКР</span>
				<span class="locale-label" :class="{ active: locale === 'en' }">ENG</span>
				<div class="locale-thumb"></div>
			</div>

			<button
				@click="toggleTheme"
				class="theme-switch"
				:aria-label="isDark ? t('theme.enableLight') : t('theme.enableDark')"
			>
				<span class="theme-icon">{{ isDark ? '🌙' : '☀️' }}</span>
			</button>
		</div>
	</header>
</template>

<style lang="scss" scoped>
header {
	display: flex;
	padding: 0.5rem 2rem;
	justify-content: space-between;
	align-items: center;

	.header-logo {
		font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;
		text-decoration: none;
		color: white;
	}
	.controllers {
		display: flex;
		align-items: center;
		gap: 1rem;

		.locale-switch {
			position: relative;
			display: inline-flex;
			align-items: center;
			justify-content: space-between;
			padding: 2px 4px;
			min-width: 110px;
			height: 32px;
			border-radius: 999px;
			background: rgba(255, 255, 255, 0.18);
			box-shadow: 0 0 0 1px rgba(0, 0, 0, 0.1);
			font-size: 0.8rem;
			cursor: pointer;
			user-select: none;
		}

		.locale-label {
			position: relative;
			z-index: 1;
			flex: 1;
			text-align: center;
			font-weight: 500;
			color: rgba(255, 255, 255, 0.7);
		}

		.locale-label.active {
			color: #000;
			font-weight: 600;
		}

		.locale-thumb {
			position: absolute;
			top: 2px;
			bottom: 2px;
			left: 2px;
			width: calc(50% - 2px);
			border-radius: 999px;
			background: #ffffff;
			box-shadow: 0 2px 6px rgba(0, 0, 0, 0.18);
			transition: transform 0.25s ease;
		}

		.locale-switch.is-en .locale-thumb {
			transform: translateX(100%);
		}

		.theme-switch {
			background: rgba(255, 255, 255, 0.1);
			border: 2px solid rgba(255, 255, 255, 0.2);
			border-radius: 50%;
			width: 45px;
			height: 45px;
			cursor: pointer;
			display: flex;
			align-items: center;
			justify-content: center;
			transition: all 0.3s ease;

			&:hover {
				background: rgba(255, 255, 255, 0.2);
				transform: scale(1.1);
			}

			.theme-icon {
				font-size: 1.5rem;
			}
		}
	}

	nav {
		display: flex;
		align-items: center;
	}

	.nav-link {
		color: white;
		text-decoration: none;
		font-size: 1.1rem;
		padding: 0.5rem 1rem;
		border-radius: 4px;
		transition: background-color 0.3s ease;

		&:hover {
			background-color: rgba(255, 255, 255, 0.1);
		}

		&.router-link-active {
			background-color: rgba(255, 255, 255, 0.2);
			font-weight: bold;
		}
	}
}
</style>
