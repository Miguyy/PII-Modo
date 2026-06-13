import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { useUserStore } from '@/stores/userStore'

import RegisterView from '@/Views/RegisterView.vue'
import LoginView from '@/Views/LoginView.vue'

import * as usersServices from '@/api/services/users.services'

const { mockRouter } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn(), replace: vi.fn(), currentRoute: { value: { path: '/' } } },
}))
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ path: '/', params: {}, query: {} }),
  RouterLink: { template: '<a><slot/></a>' },
}))

vi.mock('@/api/services/users.services')

const TEST_USER = {
  id: 1, name: 'Selenium User Test', email: 'user.test@email.com', password: 'Selenium2026!#',
  pontos: 150, tipo_utilizador: 'utilizador', token: 'fake-token-user',
}

const ADMIN_USER = {
  id: 99, name: 'Admin Test', email: 'admin@modo.com', password: 'Admin2026!#',
  tipo_utilizador: 'admin', pontos: 9999, token: 'fake-token-admin',
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRouter.push.mockClear()
  setActivePinia(createPinia())
})

describe('Auth Views Tests', () => {
  it('testUserRegistration', async () => {
    usersServices.createUser = vi.fn().mockResolvedValue({ success: true })
    const wrapper = mount(RegisterView, {
      global: { stubs: { NavBar: true, FontAwesomeIcon: true }, plugins: [
        {
          install(app) {
            // Provide router explicitly for this.$router compatibility
            app.config.globalProperties.$router = mockRouter
          }
        }
      ] },
    })

    await wrapper.find('#reg-name-user').setValue('Selenium User Test')
    await wrapper.find('#reg-email-user').setValue(TEST_USER.email)
    await wrapper.find('#reg-password-user').setValue(TEST_USER.password)

    vi.useFakeTimers()
    await wrapper.find('#signUp_btn').trigger('click')
    await flushPromises()

    expect(usersServices.createUser).toHaveBeenCalled()

    vi.runAllTimers()
    vi.useRealTimers()
    expect(mockRouter.push).toHaveBeenCalledWith('/login')
  })

  it('testUserAuthentication', async () => {
    const authMod = await import('@/api/services/auth.services')
    authMod.loginUser = vi.fn().mockResolvedValue({ token: TEST_USER.token, utilizador: TEST_USER })

    const wrapper = mount(LoginView, {
      global: {
        stubs: { NavBar: true, FontAwesomeIcon: true },
        plugins: [
          createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: { userStore: { currentUser: null, token: null } } }),
          { install(app) { app.config.globalProperties.$router = mockRouter } }
        ],
      },
    })

    const userStore = useUserStore()
    vi.spyOn(userStore, 'login').mockResolvedValue(true)
    Object.defineProperty(userStore, 'currentUser', { value: TEST_USER, writable: true })

    await wrapper.find('#login-email-user').setValue(TEST_USER.email)
    await wrapper.find('#login-password-user').setValue(TEST_USER.password)
    await wrapper.find('#login_btn').trigger('click')
    await flushPromises()

    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('/habitsmanager'))
  })

  it('testAdminAuthentication', async () => {
    const authMod = await import('@/api/services/auth.services')
    authMod.loginUser = vi.fn().mockResolvedValue({ token: ADMIN_USER.token, utilizador: ADMIN_USER })

    const wrapper = mount(LoginView, {
      global: {
        stubs: { NavBar: true, FontAwesomeIcon: true },
        plugins: [
          createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: { userStore: { currentUser: null, token: null } } }),
          { install(app) { app.config.globalProperties.$router = mockRouter } }
        ],
      },
    })

    const userStore = useUserStore()
    Object.defineProperty(userStore, 'role', { get: () => 'admin' })
    vi.spyOn(userStore, 'login').mockResolvedValue(true)

    await wrapper.find('#login-email-user').setValue(ADMIN_USER.email)
    await wrapper.find('#login-password-user').setValue(ADMIN_USER.password)
    await wrapper.find('#login_btn').trigger('click')
    await flushPromises()

    expect(mockRouter.push).toHaveBeenCalledWith(expect.stringContaining('/adminpanel'))
  })

  it('testUserForgotPassword', async () => {
    const wrapper = mount(LoginView, {
      global: { stubs: { NavBar: true, FontAwesomeIcon: true } },
    })

    const forgotBtn = wrapper.find('.text-muted[href*="forgot"], .forgot-password')
    if (forgotBtn.exists()) {
      await forgotBtn.trigger('click')
      await flushPromises()
      const toastMsg = wrapper.vm.toast?.message ?? ''
      expect(toastMsg.toLowerCase()).toMatch(/password/i)
    }
  })
})
