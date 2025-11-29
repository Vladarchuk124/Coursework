import { createRouter, createWebHistory } from 'vue-router';

const routes = [
	{
		path: '/',
		component: () => import('./modules/root/index.vue')
	},
	{
		path: '/catalog/:category',
		component: () => import('./modules/catalog/index.vue')
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
	},
	{
		path: '/list-details/:id',
		component: () => import('./modules/list-details/index.vue')
	},
	{
		path: '/admin',
		component: () => import('./modules/admin/index.vue')
	}
];

const router = createRouter({
	history: createWebHistory(),
	routes,
	scrollBehavior(to, from, savedPosition) {
		if (savedPosition) {
			return savedPosition;
		} else {
			return { top: 0 };
		}
	}
});

export default router;
