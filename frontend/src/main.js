import { createApp } from 'vue';
import { createI18n } from 'vue-i18n';
import App from './App.vue';
import router from './router.js';

import uk from './assets/locales/uk.json';
import en from './assets/locales/en.json';

const i18n = createI18n({
	legacy: false,
	locale: localStorage.getItem('locale') || 'uk',
	fallbackLocale: 'uk',
	messages: {
		uk,
		en,
	},
});

const app = createApp(App);
app.use(router).use(i18n).mount('#app');
