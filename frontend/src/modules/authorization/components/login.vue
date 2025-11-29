<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const store = useStore();
const router = useRouter();

const { t } = useI18n();
const emit = defineEmits(['switch']);

const props = defineProps({
	login: Function
});

const warning = ref('');
const loginForm = ref({
	email: '',
	password: '',
	remember: true
});

const submit = async () => {
	warning.value = '';
	if (!loginForm.value.email || !loginForm.value.password) {
		warning.value = t('auth.validation.required');
		return;
	}
	const result = await props.login({ email: loginForm.value.email, password: loginForm.value.password });

	const session = {
		user: {
			id: result.id,
			name: result.name,
			email: result.email,
			is_activated: result.is_activated,
			is_admin: result.is_admin
		},
		token: result.access_token,
		expiresAt: Date.now() + 30 * 60 * 1000
	};
	store.commit('setSession', session);
	localStorage.setItem('session', JSON.stringify(session));

	router.push('/');
};
</script>

<template>
	<form class="auth-form" @submit.prevent="submit">
		<div class="input-group">
			<label for="email">{{ t('auth.email') }}</label>
			<div class="input-shell">
				<input id="email" v-model="loginForm.email" type="email" placeholder="email@example.com" required />
			</div>
		</div>

		<div class="input-group">
			<label for="password">{{ t('auth.password') }}</label>
			<div class="input-shell">
				<input
					id="password"
					v-model="loginForm.password"
					type="password"
					:placeholder="t('auth.passwordPlaceholder')"
					required
				/>
			</div>
		</div>

		<div class="form-row">
			<label class="checkbox">
				<input v-model="loginForm.remember" type="checkbox" />
				<span>{{ t('auth.rememberMe') }}</span>
			</label>
			<button type="button" class="link-btn" @click="emit('switch', 'forgot')">
				{{ t('auth.forgotPassword') }}
			</button>
		</div>

		<button class="primary-btn" type="submit">{{ t('auth.continue') }}</button>

		<p class="form-footer">
			{{ t('auth.noAccount') }}
			<button type="button" class="link-btn" @click="emit('switch', 'register')">
				{{ t('auth.signUp') }}
			</button>
		</p>

		<p v-if="warning" class="warning">
			{{ warning }}
		</p>
	</form>
</template>
