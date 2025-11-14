import { createRouter, createWebHistory } from 'vue-router';

const routes = [{
    path: '/welcome',
    component: () => import('./modules/welcome/index.vue')
},
{
    path: '/user-profile',
    component: () => import('./modules/user-profile/index.vue')
}]

const router = createRouter({
    history: createWebHistory(),
    routes
});

export default router;