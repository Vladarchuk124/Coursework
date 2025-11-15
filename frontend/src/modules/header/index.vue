<script setup>
// todo : update header
import { ref, onMounted } from 'vue';
import { useI18n } from 'vue-i18n';

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
});
</script>

<template>
	<header>
		<nav>
			<router-link to="/welcome" class="nav-link">{{ t('header.mainPage') }}</router-link>
			<router-link to="/user-profile" class="nav-link">{{ t('header.userProfile') }}</router-link>
		</nav>
		<button @click="toggleLocale" class="locale-switch" :aria-label="t('header.toggleLocale')">
			<span class="locale-icon">{{ locale === 'uk' ? '🇺🇦' : 'en' }}</span>
		</button>
		<button
			@click="toggleTheme"
			class="theme-switch"
			:aria-label="isDark ? t('theme.enableLight') : t('theme.enableDark')"
		>
			<span class="theme-icon">{{ isDark ? '🌙' : '☀️' }}</span>
		</button>
	</header>
</template>

<style lang="scss" scoped>
header {
	padding: 1rem 2rem;
	border-radius: 15px;
	background-color: #6c757d;
	display: flex;
	align-items: center;
	justify-content: space-between;

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

	nav {
		display: flex;
		gap: 2rem;
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
