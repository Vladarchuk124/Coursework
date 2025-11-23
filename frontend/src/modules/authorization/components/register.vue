<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';

const store = useStore();
const router = useRouter();

const emit = defineEmits(['switch']);
const { t } = useI18n();

const props = defineProps({
	register: Function
});

const form = ref({
	name: '',
	email: '',
	password: '',
	confirm: ''
});
const warning = ref('');

const submit = async () => {
	warning.value = '';

	if (!form.value.email || !form.value.password || !form.value.confirm) {
		warning.value = t('auth.validation.required');
		return;
	}

	if (form.value.password !== form.value.confirm) {
		warning.value = t('auth.validation.passwordsMismatch');
		return;
	}
	const result = await props.register({
		name: form.value.name,
		email: form.value.email,
		password: form.value.password
	});
	const session = {
		user: { id: result.id, name: result.name, email: result.email, is_activated: result.is_activated },
		token: result.access_token,
		expiresAt: Date.now() + 30 * 60 * 1000
	};
	store.commit('setSession', session);
	localStorage.setItem('session', JSON.stringify(session));

	router.push('/confirm-mail');
};
</script>

<template>
	<form class="auth-form" @submit.prevent="submit">
		<div class="input-group">
			<label for="name">{{ t('auth.name') }}</label>
			<div class="input-shell">
				<input id="name" v-model="form.name" type="text" :placeholder="t('auth.namePlaceholder')" />
			</div>
		</div>
		<div class="input-group">
			<label for="register-email">{{ t('auth.email') }}</label>
			<div class="input-shell">
				<input id="register-email" v-model="form.email" type="email" placeholder="email@example.com" required />
			</div>
		</div>
		<div class="input-group">
			<label for="register-password">{{ t('auth.password') }}</label>
			<div class="input-shell">
				<input
					id="register-password"
					v-model="form.password"
					type="password"
					:placeholder="t('auth.passwordPlaceholder')"
					required
				/>
			</div>
		</div>
		<div class="input-group">
			<label for="confirm-password">{{ t('auth.confirmPassword') }}</label>
			<div class="input-shell">
				<input
					id="confirm-password"
					v-model="form.confirm"
					type="password"
					:placeholder="t('auth.confirmPasswordPlaceholder')"
					required
				/>
			</div>
		</div>

		<button type="submit" class="primary-btn">{{ t('auth.createAccount') }}</button>

		<p class="form-footer">
			{{ t('auth.haveAccount') }}
			<button type="button" class="link-btn" @click="emit('switch', 'login')">
				{{ t('auth.signIn') }}
			</button>
		</p>

		<p v-if="warning" class="warning">
			{{ warning }}
		</p>
	</form>
</template>
