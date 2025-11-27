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

const canCreateList = computed(() => lists.value.length < 5);

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

	if (lists.value.length > 4) {
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
			title
		});

		if (response?.error) {
			// Map backend error code to localized message
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
							<button class="btn list" type="button" :disabled="isCreatingList" @click="handleCreateList">
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
					<div class="list-icon">{{ item.title }}</div>
					<div class="buttons">
						<button class="btn list" @click="handleListClick(item.id)">
							{{ t('userProfile.lists.open') }}
						</button>
						<button class="btn delete" :disabled="deletingId === item.id" @click="handleDeleteClick(item.id)">
							<span v-if="deletingId !== item.id">Delete list</span>
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
	min-height: calc(100vh - 180px);
	padding: 3rem 1.5rem 4rem;
	color: var(--text-color);
	display: flex;
	justify-content: center;

	.card {
		display: flex;
		flex-wrap: wrap;
		gap: 1.25rem;
		flex-direction: row;
		width: 100%;
		max-width: 1200px;

		.user-info {
			display: flex;
			background: var(--header-color);
			border: 1px solid rgba(255, 255, 255, 0.08);
			padding: 1.75rem;
			border-radius: 24px;
			backdrop-filter: blur(12px);
			box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
			min-width: 320px;
			gap: 1rem;

			.avatar {
				width: 74px;
				height: 74px;
				margin: 1rem;
				border-radius: 18px;
				background: linear-gradient(135deg, #00bbf9, #4cb1ff);
				display: grid;
				place-items: center;
				color: #0a0c10;
				font-weight: 800;
				font-size: 1.5rem;
				text-transform: uppercase;
				box-shadow: 0 12px 30px rgba(0, 187, 249, 0.35);
			}
		}

		.profile-body {
			display: flex;
			flex-direction: column;
			gap: 0.75rem;

			h1 {
				margin: 0;
				font-size: clamp(1.8rem, 4vw, 2.4rem);
			}
			.subtitle {
				margin: 0;
				color: rgba(255, 255, 255, 0.8);
			}
		}
	}

	.card-body {
		background: rgba(255, 255, 255, 0.05);
		border: var(--user-profile-border);
		border-radius: 18px;
		padding: 1.25rem;
		min-height: 220px;
		display: grid;
		align-items: start;
	}
}

.list-card {
	position: relative;
	padding: 1rem;
	width: 15rem;
	border-radius: 16px;
	background: linear-gradient(150deg, rgba(250, 250, 250, 0.068), rgba(155, 155, 155, 0.226));
	backdrop-filter: blur(10px);
	border: 1px solid rgba(255, 255, 255, 0.08);
	box-shadow: 0 12px 30px rgba(0, 0, 0, 0.25);
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
		background: linear-gradient(150deg, rgb(21, 99, 112), rgba(4, 67, 70, 0.664));
		color: #fff;
		font-weight: 800;
		font-size: 1.1rem;
		box-shadow: 0 8px 20px rgba(0, 0, 0, 0.2);
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
	border: 1px solid rgba(255, 255, 255, 0.2);
	background: rgba(255, 255, 255, 0.1);

	&.success {
		color: #0a2012;
		background: linear-gradient(135deg, #34e89e, #0acffe);
		border-color: transparent;
	}
	&.warning {
		color: #2e1605;
		background: linear-gradient(135deg, #ffd89b, #f8b500);
		border-color: transparent;
	}
	&.muted {
		color: rgba(255, 255, 255, 0.8);
		background: rgba(255, 255, 255, 0.05);
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
	gap: 2.5rem;
}

.btn {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	border: none;
	border-radius: 12px;
	padding: 0.85rem 1.2rem;
	font-weight: 700;
	cursor: pointer;
	color: #0a0c10;
	transition: transform 0.12s ease, box-shadow 0.18s ease, background-color 0.2s ease;

	&.primary {
		background: linear-gradient(135deg, #00bbf9, #4cb1ff);
		box-shadow: 0 12px 30px rgba(0, 187, 249, 0.35);
	}
	&.ghost {
		background: transparent;
		color: var(--text-color);
		border: 1px solid rgba(255, 255, 255, 0.16);
	}

	&.list {
		background: linear-gradient(135deg, #00bbf9, #4cb1ff);
		box-shadow: 0 12px 30px rgba(0, 187, 249, 0.35);
	}
	&.delete {
		background: linear-gradient(135deg, #f90000, #ff614c);
		box-shadow: 0 12px 30px rgba(249, 50, 0, 0.35);
	}
	&:hover {
		transform: translateY(-1px);
	}
	&:disabled {
		opacity: 0.65;
		cursor: not-allowed;
		transform: none;
	}
}

.btn__spinner {
	width: 18px;
	height: 18px;
	border-radius: 50%;
	border: 2px solid rgba(255, 255, 255, 0.6);
	border-top-color: #0a0c10;
	animation: spin 0.8s linear infinite;
}

.eyebrow {
	margin: 0;
	text-transform: uppercase;
	letter-spacing: 0.08em;
	font-size: 0.82rem;
	font-weight: 800;
	color: var(--link-color);
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
		background: var(--header-color);
		border: 1px solid rgba(255, 255, 255, 0.1);
		width: min(560px, 100%);
		box-shadow: 0 18px 44px rgba(0, 0, 0, 0.32);

		h2 {
			margin: 0;
			font-size: clamp(1.6rem, 4vw, 2rem);
		}
		.subtitle {
			margin: 0;
			color: rgba(255, 255, 255, 0.8);
		}
	}
}

.user-lists {
	display: flex;
	flex-direction: column;
	align-items: center;
	gap: 1rem;
	margin: 0;
	background: var(--header-color);
	border: 1px solid rgba(255, 255, 255, 0.08);
	padding: 1.75rem;
	border-radius: 24px;
	backdrop-filter: blur(12px);
	box-shadow: 0 20px 50px rgba(0, 0, 0, 0.35);
}

.create-list {
	width: 100%;
	height: 100%;
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
			border: 1px solid rgba(255, 255, 255, 0.2);
			background: rgba(0, 0, 0, 0.2);
			color: var(--text-color);
		}
	}
}

.form-error {
	width: 100%;
	margin: 0;
	color: #ff8a8a;
	font-size: 0.85rem;
}

.subtitle.muted {
	color: rgba(255, 255, 255, 0.7);
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
