import { createRouter, createWebHistory } from 'vue-router'
import { useUserStore } from '@/stores/userStore.js'

import RegisterView from '../Views/RegisterView.vue'
import LoginView from '../Views/LoginView.vue'
import LandingPageView from '../Views/LandingPageView.vue'
import HabitManagerView from '../Views/HabitManagerView.vue'
import SettingsView from '@/Views/SettingsView.vue'
import AdminPanelView from '@/Views/AdminPanelView.vue'

const router = createRouter({
  history: createWebHistory(import.meta.env.BASE_URL),
  routes: [
    {
      path: '/',
      name: 'home',
      component: LandingPageView,
      meta: { requiresLogin: false },
    },
    {
      path: '/signin',
      name: 'signin',
      component: RegisterView,
      meta: { requiresLogin: false },
    },
    {
      path: '/login',
      name: 'login',
      component: LoginView,
      meta: { requiresLogin: false },
    },
    {
      path: '/habitsmanager',
      name: 'habitsmanager',
      component: HabitManagerView,
      meta: { requiresLogin: true },
    },

    {
      path: '/settings',
      name: 'settings',
      component: SettingsView,
      meta: { requiresLogin: true },
    },
    {
      path: '/adminpanel',
      name: 'adminpanel',
      component: AdminPanelView,
      meta: { requiresLogin: true, requiresAdmin: true },
    },
  ],
})

router.beforeEach((to, from, next) => {
  const userStore = useUserStore()
  if (to.meta.requiresLogin && !userStore.loggedUserId) {
    next('/login')
    return
  }

  if (to.meta.requiresAdmin && !userStore.isAdmin) {
    next({ name: '/home' })
    return
  }

  next()
})
export default router
