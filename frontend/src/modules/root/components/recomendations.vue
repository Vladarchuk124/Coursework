<script setup>
import { ref, computed, onMounted, watch } from 'vue';
import { useStore } from 'vuex';
import { useI18n } from 'vue-i18n';
import ContentRow from './content-row.vue';
import { actions } from '../store/actions';
import { actions as contentActions } from '../../content-details/store/actions';
import { contentTypes } from '../../../../enums/content-type';

const store = useStore();
const { locale, t } = useI18n();

const recommendations = ref([]);
const loading = ref(false);
const error = ref(null);

const isAuthenticated = computed(() => store.getters.isAuthenticated);
const userId = computed(() => store.state.session.user?.id);

const loadRecommendations = async () => {
	if (!isAuthenticated.value || !userId.value) {
		recommendations.value = [];
		return;
	}

	loading.value = true;
	error.value = null;

	try {
		const recommendationsData = await actions.getRecommendations(userId.value, {
			limit: 20
		});

		if (!Array.isArray(recommendationsData) || recommendationsData.length === 0) {
			recommendations.value = [];
			return;
		}
		const contentPromises = recommendationsData.map(async (rec) => {
			try {
				const contentType = rec.content_type === contentTypes.movie ? contentTypes.movie : contentTypes.show;
				const content = await contentActions.getContentById(rec.content_id, contentType, locale.value);
				return content;
			} catch (err) {
				console.error(`[Recommendations] Error loading content ${rec.content_id}:`, err);
				return null;
			}
		});

		const contents = await Promise.all(contentPromises);
		recommendations.value = contents.filter((content) => content !== null);
	} catch (err) {
		console.error('[Recommendations] Error loading recommendations:', err);
		error.value = err.message || t('errors.default');
		recommendations.value = [];
	} finally {
		loading.value = false;
	}
};

onMounted(() => {
	if (isAuthenticated.value) {
		loadRecommendations();
	}
});

watch([isAuthenticated, userId], () => {
	if (isAuthenticated.value && userId.value) {
		loadRecommendations();
	} else {
		recommendations.value = [];
	}
});

watch(locale, () => {
	if (isAuthenticated.value && userId.value) {
		loadRecommendations();
	}
});
</script>

<template>
	<div v-if="isAuthenticated">
		<ContentRow :title="t('home.recommendations')" :items="recommendations" :loading="loading" />
		<div v-if="!loading && recommendations.length === 0 && !error" class="no-recommendations">
			<p>{{ t('home.noRecommendations') }}</p>
		</div>
	</div>
</template>

<style lang="scss" scoped>
.no-recommendations {
	padding: 2rem;
	text-align: center;
	color: var(--text-secondary);
	font-size: 0.9rem;
}
</style>
