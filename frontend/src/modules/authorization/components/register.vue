<script setup>
import { ref } from 'vue';
import { useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';

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
const loading = ref(false);

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
	loading.value = true;
	await props.register({
		name: form.value.name,
		email: form.value.email,
		password: form.value.password
	});
	loading.value = false;
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

		<button type="submit" class="primary-btn">
			<span v-if="!loading">{{ t('auth.createAccount') }}</span>
			<span v-else class="loader">
				<span class="loader__spinner" aria-hidden="true" />
			</span>
		</button>

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

<style scoped>
.loader {
	display: inline-flex;
	align-items: center;
	justify-content: center;
	gap: 0.55rem;
}

.loader__spinner {
	width: 16px;
	height: 16px;
	border-radius: 50%;
	border: 2px solid var(--spinner-color);
	border-top-color: var(--spinner-accent);
	animation: spin 0.9s linear infinite;
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
