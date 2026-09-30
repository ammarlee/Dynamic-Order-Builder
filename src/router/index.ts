import { createRouter, createWebHistory } from 'vue-router'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'create-order',
      component: () => import('@/pages/orders/create/index.vue'),
    },
  ],
})

export default router
