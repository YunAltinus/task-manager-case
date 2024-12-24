import { createRouter, createWebHistory } from 'vue-router';
import { useAuthStore } from '@/stores/auth';

const router = createRouter({
  history: createWebHistory(),
  routes: [
    {
      path: '/',
      name: 'home',
      component: () => import('@/views/HomeView.vue'),
    },
    {
      path: '/login',
      name: 'login',
      component: () => import('@/views/LoginView.vue'),
    },
    {
      path: '/register',
      name: 'register',
      component: () => import('@/views/RegisterView.vue'),
    },
    {
      path: '/tasks',
      name: 'tasks',
      component: () => import('@/views/TasksView.vue'),
    },
    { path: '/:pathMatch(.*)*', redirect: '/login' },
  ],
})

// // Navigation Guard
router.beforeEach((to, from, next) => {
  const authStore = useAuthStore();
  const isAuthenticated = authStore.getIsAuthenticated;
  console.log(to)

  if (!(['login','register'].includes(to.name)) && !isAuthenticated) {
    next({ name: 'login' });
  } else if (to.path === '/login' && isAuthenticated) {
    next({ name: 'tasks' });
  } else {
    next();
  }
});

export default router
