import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/popular-movies',
		component: () => import('./modules/popular-movies/index.vue')
	},
	{
		path: '/content-details/:type/:id',
		component: () => import('./modules/content-details/index.vue')
	},
	{
		path: '/authorization',
		component: () => import('./modules/authorization/index.vue')
	},
	{
		path: '/confirm-mail',
		component: () => import('./modules/confirm-mail/index.vue')
	},
	{
		path: '/user-profile',
		component: () => import('./modules/user-profile/index.vue')
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes
});

export default router;
