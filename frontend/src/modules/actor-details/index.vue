<script setup>
import upArrow from '../../assets/images/up-arrow.png';

import { ref, onMounted, watch, computed, onUnmounted } from 'vue';
import { useRoute, useRouter } from 'vue-router';
import { useI18n } from 'vue-i18n';
import { actions } from './store/actions';
import { contentTypes } from '../../../enums/content-type';

const IMAGE_BASE = 'https://image.tmdb.org/t/p';

const route = useRoute();
const router = useRouter();

const actor = ref(null);
const credits = ref([]);
const loading = ref(false);
const error = ref(null);
const showScrollTop = ref(false);

const { locale, t } = useI18n();

const actorId = computed(() => route.params.id);

const profileUrl = computed(() => {
	const path = actor.value?.profile_path;
	return path ? `${IMAGE_BASE}/w500${path}` : '';
});

const formattedBirthday = computed(() => {
	const date = actor.value?.birthday;
	if (!date) return null;
	try {
		return new Intl.DateTimeFormat(locale.value, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(date));
	} catch (err) {
		return date;
	}
});

const formattedDeathday = computed(() => {
	const date = actor.value?.deathday;
	if (!date) return null;
	try {
		return new Intl.DateTimeFormat(locale.value, {
			year: 'numeric',
			month: 'long',
			day: 'numeric'
		}).format(new Date(date));
	} catch (err) {
		return date;
	}
});

const age = computed(() => {
	const birthday = actor.value?.birthday;
	if (!birthday) return null;

	const birth = new Date(birthday);
	const endDate = actor.value?.deathday ? new Date(actor.value.deathday) : new Date();
	const diff = endDate.getFullYear() - birth.getFullYear();
	const monthDiff = endDate.getMonth() - birth.getMonth();

	if (monthDiff < 0 || (monthDiff === 0 && endDate.getDate() < birth.getDate())) {
		return diff - 1;
	}
	return diff;
});

const biographyParagraphs = computed(() => {
	if (!actor.value?.biography) return [];
	return actor.value.biography
		.split('\n')
		.map((paragraph) => paragraph.trim())
		.filter((paragraph) => paragraph.length > 0);
});

const getRatingColor = (rating) => {
	const value = Number(rating);
	if (!Number.isFinite(value)) return '#4c566a';
	if (value < 4) return '#dc3545';
	if (value < 6) return '#ff9800';
	if (value < 8) return '#ffc107';
	if (value < 9) return '#28a745';
	return '#17a2b8';
};

const loadActorDetails = async () => {
	if (!actorId.value) return;

	loading.value = true;
	error.value = null;
	try {
		const [actorData, creditsData] = await Promise.all([
			actions.getActorById(actorId.value, locale.value),
			actions.getActorCredits(actorId.value, locale.value)
		]);
		actor.value = actorData;
		credits.value = creditsData?.cast || [];
	} catch (err) {
		error.value = true;
		console.error('Error loading actor details:', err);
	} finally {
		loading.value = false;
	}
};

const handleContentClick = (item) => {
	const type = item.media_type === 'tv' ? contentTypes.show : contentTypes.movie;
	router.push(`/content-details/${type}/${item.id}`);
};

const handleScroll = () => {
	showScrollTop.value = window.scrollY > 320;
};

const scrollToTop = () => {
	window.scrollTo({ top: 0, behavior: 'smooth' });
};

onMounted(() => {
	loadActorDetails();
	window.addEventListener('scroll', handleScroll, { passive: true });
});

watch([actorId, locale], () => {
	loadActorDetails();
});

onUnmounted(() => {
	window.removeEventListener('scroll', handleScroll);
});
</script>

<template>
	<section class="actor-details">
		<div v-if="actor" class="background" aria-hidden="true">
			<div class="background-gradient" />
		</div>

		<div v-if="loading" class="loader">
			<div class="loader__spinner" />
			<p>{{ t('actor.loading') }}</p>
		</div>
		<div v-else-if="error" class="loader loader--error">
			<p>{{ t('actor.error') }}</p>
		</div>

		<div v-else-if="actor" class="content-section">
			<div class="head-info">
				<div class="profile-photo">
					<img v-if="profileUrl" :src="profileUrl" :alt="actor.name" loading="lazy" />
					<div v-else class="no-photo">
						<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
							<path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2" />
							<circle cx="12" cy="7" r="4" />
						</svg>
					</div>
				</div>
				<div class="summary">
					<h1 class="actor-name">{{ actor.name }}</h1>
					<div class="meta-info">
						<span v-if="actor.place_of_birth" class="meta-item">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
								<circle cx="12" cy="10" r="3" />
							</svg>
							{{ actor.place_of_birth }}
						</span>
						<span v-if="formattedBirthday" class="meta-item">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<rect x="3" y="4" width="18" height="18" rx="2" />
								<path d="M16 2v4M8 2v4M3 10h18" />
							</svg>
							{{ formattedBirthday }}
							<template v-if="age"> ({{ age }} {{ t('actor.years') }})</template>
						</span>
						<span v-if="formattedDeathday" class="meta-item death">
							<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
								<circle cx="12" cy="12" r="10" />
								<path d="M12 6v6l4 2" />
							</svg>
							{{ formattedDeathday }}
						</span>
					</div>
					<div v-if="biographyParagraphs.length" class="biography">
						<h2>{{ t('actor.biography') }}</h2>
						<p v-for="(paragraph, index) in biographyParagraphs" :key="index">{{ paragraph }}</p>
					</div>
					<div v-else class="biography">
						<h2>{{ t('actor.biography') }}</h2>
						<p class="no-data">{{ t('actor.noBiography') }}</p>
					</div>
				</div>
			</div>

			<div class="filmography">
				<h2>{{ t('actor.filmography') }}</h2>
				<div v-if="credits.length" class="credits-grid">
					<div
						v-for="item in credits"
						:key="`${item.id}-${item.credit_id}`"
						class="credit-card"
						@click="handleContentClick(item)"
					>
						<div class="card-poster">
							<img :src="`${IMAGE_BASE}/w342${item.poster_path}`" :alt="item.title || item.name" loading="lazy" />
							<span class="media-type-badge">
								{{ item.media_type === 'tv' ? t('content.show') : t('content.movie') }}
							</span>
							<span class="rating-badge" :style="{ backgroundColor: getRatingColor(item.vote_average) }">
								{{ item.vote_average?.toFixed(1) }}
							</span>
						</div>
						<div class="card-info">
							<h3 class="card-title">{{ item.title || item.name }}</h3>
							<p v-if="item.character" class="card-character">{{ t('actor.as') }} {{ item.character }}</p>
							<p v-if="item.release_date || item.first_air_date" class="card-year">
								{{ new Date(item.release_date || item.first_air_date).getFullYear() }}
							</p>
						</div>
					</div>
				</div>
				<div v-else class="no-credits">
					<p>{{ t('actor.noCredits') }}</p>
				</div>
			</div>
		</div>

		<div v-else class="loader">
			<p>{{ t('actor.notFound') }}</p>
		</div>

		<button v-if="showScrollTop" type="button" class="scroll-top" @click="scrollToTop" aria-label="Back to top">
			<img class="scroll-top__icon" :src="upArrow" alt="" aria-hidden="true" />
		</button>
	</section>
</template>

<style lang="scss" scoped>
.actor-details {
	position: relative;
	min-height: 100vh;
	padding: 4rem 2rem;
	color: #f4f4f4;
	overflow: hidden;

	.loader {
		color: var(--text-color);
		min-height: 60vh;
		display: flex;
		flex-direction: column;
		align-items: center;
		justify-content: center;
		gap: 1rem;
		text-align: center;

		&__spinner {
			width: 48px;
			height: 48px;
			border-radius: 50%;
			border-top-color: #f472b6;
			animation: spin 1s linear infinite;
			border: 4px solid var(--spinner-color);
		}

		&--error {
			color: #ff6b6b;
		}
	}

	.content-section {
		position: relative;
		z-index: 1;
		max-width: 1200px;
		margin: 0 auto;
		display: flex;
		flex-direction: column;
		gap: 3rem;
	}
}

.head-info {
	display: flex;
	gap: 2.5rem;
	align-items: flex-start;
	background: var(--header-color);
	backdrop-filter: blur(12px);
	border: 1px solid rgba(255, 255, 255, 0.08);
	border-radius: 24px;
	padding: 2rem;
	box-shadow: 0 30px 80px rgba(0, 0, 0, 0.5);
}

.profile-photo {
	flex: 0 0 260px;
	border-radius: 20px;
	overflow: hidden;
	background: rgba(255, 255, 255, 0.02);
	box-shadow: 0 25px 50px rgba(0, 0, 0, 0.4);
	aspect-ratio: 2/3;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		display: block;
	}

	.no-photo {
		width: 100%;
		height: 100%;
		display: flex;
		align-items: center;
		justify-content: center;
		background: linear-gradient(135deg, #2a2a3e 0%, #1a1a2e 100%);

		svg {
			width: 40%;
			height: 40%;
			color: rgba(255, 255, 255, 0.2);
		}
	}
}

.summary {
	flex: 1;
	display: flex;
	flex-direction: column;
	gap: 1.2rem;
}

.actor-name {
	font-size: clamp(2rem, 4vw, 3rem);
	margin: 0;
	color: #ffffff;
	font-weight: 700;
	background: linear-gradient(135deg, #ffffff 0%, #f472b6 100%);
	-webkit-background-clip: text;
	-webkit-text-fill-color: transparent;
	background-clip: text;
}

.meta-info {
	display: flex;
	flex-wrap: wrap;
	gap: 1rem;
}

.meta-item {
	display: inline-flex;
	align-items: center;
	gap: 0.4rem;
	padding: 0.5rem 1rem;
	background: rgba(255, 255, 255, 0.1);
	border-radius: 25px;
	font-size: 0.9rem;
	color: rgba(255, 255, 255, 0.85);

	svg {
		width: 1rem;
		height: 1rem;
		opacity: 0.7;
	}

	&.death {
		background: rgba(239, 68, 68, 0.15);
		color: #fca5a5;
	}
}

.biography {
	margin-top: 1rem;

	h2 {
		font-size: 1.3rem;
		margin: 0 0 0.8rem 0;
		color: rgba(255, 255, 255, 0.9);
	}

	p {
		line-height: 1.8;
		color: rgba(255, 255, 255, 0.75);
		margin-bottom: 1rem;

		&.no-data {
			color: rgba(255, 255, 255, 0.5);
			font-style: italic;
		}
	}
}

.filmography {
	h2 {
		font-size: 1.5rem;
		margin: 0 0 1.5rem 0;
		color: #ffffff;
		display: flex;
		align-items: center;
		gap: 0.5rem;

		&::before {
			content: '';
			width: 4px;
			height: 1.5rem;
			background: linear-gradient(180deg, #f472b6 0%, #00bbf9 100%);
			border-radius: 2px;
		}
	}
}

.credits-grid {
	display: grid;
	grid-template-columns: repeat(auto-fill, minmax(180px, 1fr));
	gap: 1.5rem;
}

.credit-card {
	cursor: pointer;
	border-radius: 16px;
	overflow: hidden;
	background: var(--header-color);
	border: 1px solid rgba(255, 255, 255, 0.06);
	transition: all 0.3s cubic-bezier(0.4, 0, 0.2, 1);
	box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);

	&:hover {
		transform: translateY(-6px);
		box-shadow: 0 20px 40px rgba(0, 0, 0, 0.4);
		border-color: rgba(244, 114, 182, 0.3);

		.card-poster img {
			transform: scale(1.05);
		}
	}
}

.card-poster {
	position: relative;
	aspect-ratio: 2/3;
	overflow: hidden;

	img {
		width: 100%;
		height: 100%;
		object-fit: cover;
		transition: transform 0.4s ease;
	}

	.media-type-badge {
		position: absolute;
		top: 0.5rem;
		left: 0.5rem;
		padding: 0.25rem 0.6rem;
		background: rgba(0, 0, 0, 0.7);
		backdrop-filter: blur(8px);
		border-radius: 20px;
		font-size: 0.7rem;
		font-weight: 600;
		text-transform: uppercase;
		letter-spacing: 0.05em;
		color: #ffffff;
	}

	.rating-badge {
		position: absolute;
		top: 0.5rem;
		right: 0.5rem;
		padding: 0.25rem 0.5rem;
		border-radius: 20px;
		font-size: 0.75rem;
		font-weight: 700;
		color: #ffffff;
		box-shadow: 0 2px 8px rgba(0, 0, 0, 0.3);
	}
}

.card-info {
	padding: 0.8rem;

	.card-title {
		margin: 0 0 0.3rem 0;
		font-size: 0.95rem;
		font-weight: 600;
		color: #ffffff;
		display: -webkit-box;
		-webkit-line-clamp: 2;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-character {
		margin: 0 0 0.2rem 0;
		font-size: 0.8rem;
		color: #f472b6;
		font-style: italic;
		display: -webkit-box;
		-webkit-line-clamp: 1;
		-webkit-box-orient: vertical;
		overflow: hidden;
	}

	.card-year {
		margin: 0;
		font-size: 0.8rem;
		color: rgba(255, 255, 255, 0.5);
	}
}

.no-credits {
	text-align: center;
	padding: 3rem;
	color: rgba(255, 255, 255, 0.5);
	background: var(--header-color);
	border-radius: 16px;
	border: 1px solid rgba(255, 255, 255, 0.06);
}

@keyframes spin {
	to {
		transform: rotate(360deg);
	}
}

.scroll-top {
	position: fixed;
	bottom: 22px;
	right: 22px;
	background: linear-gradient(135deg, #f472b6, #ec4899);
	color: #0a0c10;
	border: none;
	border-radius: 50%;
	width: 48px;
	height: 48px;
	display: inline-flex;
	align-items: center;
	justify-content: center;
	font-weight: 800;
	box-shadow: 0 18px 50px rgba(244, 114, 182, 0.35);
	cursor: pointer;
	transition: transform 0.18s ease, box-shadow 0.18s ease, opacity 0.18s ease;
	z-index: 20;

	&:hover {
		transform: translateY(-2px);
		box-shadow: 0 22px 60px rgba(244, 114, 182, 0.4);
	}

	&__icon {
		width: 22px;
		height: 22px;
		object-fit: contain;
		display: block;
	}
}

@media (max-width: 768px) {
	.head-info {
		flex-direction: column;
		align-items: center;
		text-align: center;
	}

	.profile-photo {
		flex: 0 0 auto;
		width: 200px;
	}

	.meta-info {
		justify-content: center;
	}

	.credits-grid {
		grid-template-columns: repeat(auto-fill, minmax(140px, 1fr));
	}
}
</style>
