<script setup>
import { computed, onMounted, ref, watch } from 'vue';
import { useI18n } from 'vue-i18n';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { actions } from './store/actions';

const { t } = useI18n();
const router = useRouter();
const store = useStore();

const nameDraft = ref('');
const lists = ref([]);
const listsError = ref('');
const createListError = ref('');
const newListTitle = ref('');
const isCreatingList = ref(false);
const deletingId = ref(null);
const user = computed(() => store.state.session.user);
const initials = computed(() => store.getters.userInitials || 'U');
const isAuthenticated = computed(() => store.getters.isAuthenticated);

const canCreateList = computed(() => lists.value.length < 4);

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

watch(
	user,
	(value) => {
		nameDraft.value = value?.name || '';
	},
	{ immediate: true }
);

const goToMovies = () => router.push('/');
const goToAuth = () => router.push('/authorization');
const handleLogout = async () => {
	await store.dispatch('logout');
	goToMovies();
};

const handleListClick = (list_id) => {
	router.push(`/list-details/${list_id}`);
};

const handleDeleteClick = async (list_id) => {
	if (deletingId.value) return;
	deletingId.value = list_id;
	await actions.deleteUserList(list_id);
	await loadLists();
	deletingId.value = null;
};

const loadLists = async () => {
	if (!isAuthenticated.value || !user.value?.id) {
		lists.value = [];
		listsError.value = '';
		return;
	}

	try {
		const data = await actions.getUserLists(user.value.id);
		if (data?.error) {
			const errorMap = {
				NO_USER: t('errors.noUser'),
				NO_LISTS: t('errors.noLists')
			};
			const localizedError = errorMap[data.error] || data.error;
			throw new Error(localizedError);
		}
		lists.value = Array.isArray(data) ? data : [];
		listsError.value = '';
	} catch (error) {
		console.error('Failed to load lists', error);
		listsError.value = t('userProfile.lists.error');
		lists.value = [];
	}
};

const handleCreateList = async () => {
	if (!isAuthenticated.value || !user.value?.id) {
		createListError.value = t('userProfile.lists.create.authError');
		return;
	}

	if (lists.value.length > 3) {
		createListError.value = t('userProfile.lists.create.tooMany');
		return;
	}

	const title = newListTitle.value.trim();
	if (!title) {
		createListError.value = t('userProfile.lists.create.required');
		return;
	}

	try {
		createListError.value = '';
		isCreatingList.value = true;
		const response = await actions.createUserList({
			user_id: user.value.id,
			list_title: title
		});

		if (response?.error) {
			const errorMap = {
				NO_USER: t('errors.noUser'),
				INVALID_USER_ID: t('errors.invalidUserId'),
				INVALID_TITLE: t('errors.invalidTitle'),
				USER_AND_TITLE_REQUIRED: t('errors.userAndTitleRequired')
			};
			const localizedError = errorMap[response.error] || response.error;
			throw new Error(localizedError);
		}

		lists.value = [response, ...lists.value];
		newListTitle.value = '';
	} catch (error) {
		console.error('Failed to create list', error);
		createListError.value = t('userProfile.lists.create.error');
	} finally {
		isCreatingList.value = false;
	}
};

onMounted(() => {
	loadLists();
});
</script>

<template>
	<section class="user-profile">
		<div v-if="isAuthenticated" class="card">
			<div class="user-info">
				<div class="avatar">{{ initials }}</div>
				<div class="profile-body">
					<p class="eyebrow">{{ t('header.profile') }}</p>
					<h1>{{ user?.name || t('userProfile.anonymous') }}</h1>
					<p class="subtitle">{{ t('userProfile.subtitle') }}</p>
					<div class="pill-row">
						<span v-if="user?.is_activated" class="pill success">{{ t('userProfile.statusActive') }}</span>
						<span v-else class="pill warning">{{ t('userProfile.statusPending') }}</span>
						<span class="pill muted">ID #{{ user?.id || '—' }}</span>
					</div>
					<div class="actions_btn">
						<button type="button" class="btn primary" @click="goToMovies">{{ t('userProfile.ctaMovies') }}</button>
						<button type="button" class="btn ghost" @click="handleLogout">{{ t('userProfile.ctaLogout') }}</button>
					</div>
					<div v-if="canCreateList" class="create-list">
						<label for="new-list" class="eyebrow create-list__label">
							{{ t('userProfile.lists.create.title') }}
						</label>
						<div class="create-list__form">
							<input
								id="new-list"
								v-model="newListTitle"
								type="text"
								:placeholder="t('userProfile.lists.create.placeholder')"
								:disabled="isCreatingList"
							/>
							<button class="btn primary" type="button" :disabled="isCreatingList" @click="handleCreateList">
								{{ isCreatingList ? t('userProfile.lists.create.creating') : t('userProfile.lists.create.button') }}
							</button>
						</div>
						<p v-if="createListError" class="form-error">{{ createListError }}</p>
					</div>

					<p v-if="listsError" class="form-error">{{ listsError }}</p>
				</div>
			</div>
			<div class="user-lists">
				<p class="eyebrow">{{ t('userProfile.lists.title') }}</p>
				<div v-for="item in lists" :key="item.id" class="list-card">
					<div class="list-icon">{{ getLocalizedListTitle(item.title) }}</div>
					<div class="buttons">
						<button class="btn primary" @click="handleListClick(item.id)">
							{{ t('userProfile.lists.open') }}
						</button>
						<button class="btn danger" :disabled="deletingId === item.id" @click="handleDeleteClick(item.id)">
							<span v-if="deletingId !== item.id">{{ t('userProfile.lists.delete') || 'Delete' }}</span>
							<span v-else class="btn__spinner" aria-hidden="true" />
						</button>
					</div>
				</div>
				<p v-if="!lists.length" class="subtitle muted">
					{{ t('userProfile.lists.empty') }}
				</p>
			</div>
		</div>

		<div v-else class="empty-state">
			<div class="empty-card">
				<p class="eyebrow">{{ t('header.userProfile') }}</p>
				<h2>{{ t('userProfile.emptyState.title') }}</h2>
				<p class="subtitle">{{ t('userProfile.emptyState.description') }}</p>
				<div class="actions_btn">
					<button type="button" class="btn primary" @click="goToAuth">
						{{ t('userProfile.emptyState.ctaLogin') }}
					</button>
					<button type="button" class="btn ghost" @click="goToMovies">{{ t('userProfile.ctaMovies') }}</button>
				</div>
			</div>
		</div>
	</section>
</template>

<style lang="scss" scoped>
.user-profile {
	padding: 3rem 1.5rem 4rem;
	color: var(--text-color);
	display: flex;
	justify-content: center;

	.card {
		display: flex;
		max-height: 80dvh;
		gap: 1.25rem;
		flex-direction: row;
		width: 100%;
		max-width: 1200px;

		.user-info {
			display: flex;
			background: var(--card-bg);
			border: 1px solid var(--card-border);
			padding: 1.75rem;
			border-radius: 24px;
			backdrop-filter: blur(12px);
			box-shadow: var(--card-shadow);
			min-width: 320px;
			gap: 1rem;

			.avatar {
				width: 74px;
				height: 74px;
				margin: 1rem;
				border-radius: 18px;
				background: var(--accent-gradient);
				display: grid;
				place-items: center;
				color: var(--btn-primary-text);
				font-weight: 800;
				font-size: 1.5rem;
				text-transform: uppercase;
				box-shadow: var(--btn-primary-shadow);
			}
		}

		.profile-body {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;

			h1 {
				margin: 0;
				font-size: clamp(1.8rem, 4vw, 2.4rem);
				color: var(--text-color);
			}
			.subtitle {
				margin: 0;
				color: var(--text-color-secondary);
			}
		}
	}
}

.list-card {
	position: relative;
	padding: 1rem;
	width: 20rem;
	border-radius: 16px;
	background: var(--surface-color);
	backdrop-filter: blur(10px);
	border: 1px solid var(--border-color);
	box-shadow: var(--shadow-md);
	display: flex;
	flex-direction: column;
	gap: 0.5rem;
	overflow: hidden;

	.list-icon {
		border-radius: 14px;
		padding: 0.2rem 1rem;
		display: flex;
		justify-content: center;
		align-items: center;
		background: var(--accent-gradient);
		color: var(--btn-primary-text);
		font-weight: 800;
		font-size: 1.1rem;
		box-shadow: var(--shadow-sm);
	}
}

.pill-row {
	display: flex;
	gap: 0.5rem;
	flex-wrap: wrap;
}
.pill {
	display: inline-flex;
	align-items: center;
	gap: 0.35rem;
	padding: 0.35rem 0.75rem;
	border-radius: 12px;
	font-weight: 700;
	border: 1px solid var(--border-color);
	background: var(--surface-color);

	&.success {
		color: var(--btn-success-text);
		background: var(--btn-success-bg);
		border-color: transparent;
	}
	&.warning {
		color: var(--btn-warning-text);
		background: var(--btn-warning-bg);
		border-color: transparent;
	}
	&.muted {
		color: var(--text-color-secondary);
		background: var(--surface-color);
	}
}

.actions_btn {
	display: flex;
	flex-wrap: wrap;
	gap: 0.75rem;
	margin-top: 0.5rem;
}

.buttons {
	display: flex;
	justify-content: center;
	gap: 0.75rem;
}

.btn__spinner {
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: 2px solid var(--spinner-color);
	border-top-color: var(--btn-primary-text);
	animation: spin 0.8s linear infinite;
}

.user-lists {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin: 0;
	background: var(--card-bg);
	border: 1px solid var(--card-border);
	padding: 1.75rem;
	border-radius: 24px;
	backdrop-filter: blur(12px);
	box-shadow: var(--card-shadow);
}

.create-list {
	width: 100%;
	margin-top: 19rem;
	display: flex;
	flex-direction: column;
	justify-content: end;
	gap: 0.5rem;

	&__form {
		display: flex;
		flex-wrap: wrap;
		gap: 0.75rem;

		input {
			flex: 1;
			min-width: 200px;
			padding: 0.85rem 1rem;
			border-radius: 12px;
			border: 1px solid var(--border-color);
			background: var(--input-bg);
			color: var(--text-color);

			&::placeholder {
				color: var(--text-color-tertiary);
			}
		}
	}
}

.form-error {
	width: 100%;
	margin: 0;
	color: var(--error-color);
	font-size: 0.85rem;
}

.subtitle.muted {
	color: var(--text-color-secondary);
}

.empty-state {
	display: flex;
	justify-content: center;
	width: 100%;

	.empty-card {
		display: flex;
		flex-direction: column;
		align-items: center;
		text-align: center;
		gap: 0.75rem;
		padding: 2rem;
		border-radius: 24px;
		background: var(--card-bg);
		border: 1px solid var(--border-color);
		width: min(560px, 100%);
		box-shadow: var(--shadow-lg);

		h2 {
			margin: 0;
			font-size: clamp(1.6rem, 4vw, 2rem);
			color: var(--text-color);
		}
		.subtitle {
			margin: 0;
			color: var(--text-color-secondary);
		}
	}
}

@keyframes spin {
	from {
		transform: rotate(0deg);
	}
	to {
		transform: rotate(360deg);
	}
}
</style>
