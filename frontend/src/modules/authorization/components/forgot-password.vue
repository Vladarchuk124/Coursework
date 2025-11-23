<script setup>
import { ref } from 'vue';
import { useI18n } from 'vue-i18n';

const emit = defineEmits(['switch']);
const { t } = useI18n();

const email = ref('');
const warning = ref('');

const submit = () => {
	warning.value = '';

	if (!email.value) {
		warning.value = t('auth.validation.required');
		return;
	}
};
</script>

<template>
	<form class="auth-form" @submit.prevent="submit">
		<div class="input-group">
			<label for="reset-email">{{ t('auth.email') }}</label>
			<div class="input-shell">
				<input id="reset-email" v-model="email" type="email" placeholder="email@example.com" required />
			</div>
		</div>

		<button type="submit" class="primary-btn">{{ t('auth.sendEmail') }}</button>

		<p class="form-footer">
			{{ t('auth.passwordReady') }}
			<button type="button" class="link-btn" @click="emit('switch', 'login')">
				{{ t('auth.signIn') }}
			</button>
		</p>

		<p v-if="warning" class="warning">
			{{ warning }}
		</p>
	</form>
</template>
