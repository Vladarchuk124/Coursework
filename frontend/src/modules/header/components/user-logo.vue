<script setup>
import { ref, onMounted, onBeforeUnmount, computed } from 'vue';
import { useI18n } from 'vue-i18n';
import { useStore } from 'vuex';
import { useRouter } from 'vue-router';

const store = useStore();
const router = useRouter();
const { locale, t } = useI18n();
const isOpen = ref(false);
const isDark = ref(true);
const menuRef = ref(null);

const isAuthenticated = computed(() => store.getters.isAuthenticated);
const isAdmin = computed(() => store.getters.isAdmin);
console.log(store);
const user = computed(() => store.state.session.user);

const toggleMenu = () => (isOpen.value = !isOpen.value);

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

const handleClickOutside = (event) => {
	if (menuRef.value && !menuRef.value.contains(event.target)) {
		isOpen.value = false;
	}
};

const handleLogOut = () => {
	isOpen.value = false;
	store.dispatch('logout');
	router.push('/');
};

onMounted(() => {
	document.addEventListener('click', handleClickOutside);

	store.dispatch('bootstrapSession');

	const savedTheme = localStorage.getItem('theme') || 'dark';
	isDark.value = savedTheme === 'dark';
	document.documentElement.setAttribute('data-theme', savedTheme);

	const savedLocale = localStorage.getItem('locale');
	if (savedLocale) {
		locale.value = savedLocale;
	}
});

onBeforeUnmount(() => {
	document.removeEventListener('click', handleClickOutside);
});
</script>

<template>
	<div class="user-logo" ref="menuRef">
		<h2 v-if="user" class="username">{{ user.name }}</h2>
		<img class="img-logo" src="../../../assets/images/user-logo.png" alt="user-logo" @click="toggleMenu" />
		<div v-if="isOpen" class="user-menu">
			<div class="controllers">
				<div
					class="switch"
					:class="{ 'is-en': locale === 'en' }"
					@click="toggleLocale"
					:aria-label="t('header.changeLanguage')"
					role="button"
				>
					<span class="switch-label" :class="{ active: locale === 'uk' }">УКР</span>
					<span class="switch-label" :class="{ active: locale === 'en' }">ENG</span>
					<div class="switch-thumb"></div>
				</div>
				<div
					class="switch"
					:class="{ 'is-dark': isDark === true }"
					@click="toggleTheme"
					:aria-label="isDark ? t('theme.enableLight') : t('theme.enableDark')"
					role="button"
				>
					<span class="switch-label" :class="{ active: isDark === false }">☀️</span>
					<span class="switch-label" :class="{ active: isDark === true }">🌙</span>
					<div class="switch-thumb"></div>
				</div>
				<router-link v-if="isAuthenticated" to="/user-profile" class="menu-btn" @click="isOpen = false">
					{{ t('header.profile') }}
				</router-link>
				<router-link v-if="isAdmin" to="/admin" class="menu-btn admin-btn" @click="isOpen = false">
					{{ t('header.adminPanel') }}
				</router-link>
				<div v-if="isAuthenticated" class="menu-btn" @click="handleLogOut">{{ t('userProfile.ctaLogout') }}</div>
				<router-link v-else to="/authorization" class="menu-btn" @click="isOpen = false">{{
					t('auth.signIn')
				}}</router-link>
			</div>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.user-logo {
	display: flex;
	width: 30%;
	justify-content: end;
	position: relative;

	.username {
		color: white;
		text-align: center;
		align-self: center;
		margin: 0 1rem;
	}

	.img-logo {
		height: 50px;
		width: 50px;
		filter: brightness(0) invert(1);
		cursor: pointer;
	}

	.user-menu {
		background: var(--card-bg);
		position: absolute;
		top: calc(100% + 25px);
		right: 0;
		z-index: 20;
		border-radius: 16px;
		padding: 12px 16px;
		backdrop-filter: blur(12px);
		border: 1px solid var(--border-color);
		box-shadow: var(--card-shadow);

		.controllers {
			display: flex;
			flex-direction: column;
			align-items: center;
			gap: 1rem;

			.switch {
				position: relative;
				display: inline-flex;
				align-items: center;
				justify-content: space-between;
				padding: 2px 4px;
				min-width: 110px;
				height: 32px;
				border-radius: 999px;
				background: var(--surface-color-hover);
				box-shadow: 0 0 0 1px var(--border-color);
				font-size: 0.8rem;
				cursor: pointer;
				user-select: none;
			}

			.switch-label {
				position: relative;
				z-index: 1;
				flex: 1;
				text-align: center;
				font-weight: 500;
				color: var(--text-color-secondary);
			}

			.switch-label.active {
				color: var(--text-color-inverted);
				font-weight: 600;
			}

			.switch-thumb {
				position: absolute;
				top: 2px;
				bottom: 2px;
				left: 2px;
				width: calc(50% - 2px);
				border-radius: 999px;
				background: var(--accent-gradient);
				box-shadow: var(--shadow-sm);
				transition: transform 0.25s ease;
			}

			.switch.is-en .switch-thumb {
				transform: translateX(100%);
			}

			.switch.is-dark .switch-thumb {
				transform: translateX(100%);
			}

			.menu-btn {
				display: flex;
				justify-content: center;
				align-items: center;
				min-width: 110px;
				height: 36px;
				background: var(--btn-primary-bg);
				box-shadow: var(--btn-primary-shadow);
				color: white;
				font-size: 0.95rem;
				font-weight: 600;
				text-decoration: none;
				cursor: pointer;
				border-radius: 12px;
				transition: transform 0.15s ease, box-shadow 0.2s ease;

				&:hover {
					cursor: pointer;
					transform: translateY(-2px);
				}

				&.admin-btn {
					background: var(--btn-danger-bg);
					color: var(--btn-danger-text);
					box-shadow: var(--btn-danger-shadow);
				}
			}
		}
	}
}

.fade-enter-active,
.fade-leave-active {
	transition: opacity 0.18s ease, transform 0.18s ease;
}

.fade-enter-from,
.fade-leave-to {
	opacity: 0;
	transform: translateY(-4px);
}
</style>
