import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/popular-movies',
		component: () => import('./modules/popular-movies/index.vue'),
	},
	{
		path: '/movie-details/:id',
		component: () => import('./modules/movie-details/index.vue'),
	},
];

const router = createRouter({
	history: createWebHistory(),
	routes,
});

export default router;
