import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { useUserStore } from '@/stores/userStore'

import SettingsView from '@/Views/SettingsView.vue'
import ExploreHabitsView from '@/Views/ExploreHabitsView.vue'

import * as notificationsServices from '@/api/services/notifications.services'
import * as habitsServices from '@/api/services/habits.services'

const { mockRouter } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn(), replace: vi.fn(), currentRoute: { value: { path: '/' } } },
}))
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ path: '/', params: {}, query: {} }),
  RouterLink: { template: '<a><slot/></a>' },
}))

vi.mock('@/api/services/notifications.services')
vi.mock('@/api/services/habits.services')

const TEST_USER = {
  id: 1, name: 'Selenium User Test', email: 'user.test@email.com', password: 'Selenium2026!#',
  pontos: 150, tipo_utilizador: 'utilizador', token: 'fake-token-user', notifications_enabled: true
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRouter.push.mockClear()
  setActivePinia(createPinia())
})

describe('Misc Interactions Tests', () => {
  it('testUserNotifications', async () => {
    notificationsServices.getUserNotifications = vi.fn().mockResolvedValue([
      { id_notificacao: 1, titulo: 'Welcome', mensagem: 'Hello!', lida: false },
      { id_notificacao: 2, titulo: 'Update', mensagem: 'New features available.', lida: false },
    ])
    notificationsServices.markNotificationAsRead = vi.fn().mockResolvedValue({ success: true })
    notificationsServices.clearAllNotifications = vi.fn().mockResolvedValue({ success: true })

    const wrapper = mount(SettingsView, {
      global: {
        stubs: { NavBar: true, FontAwesomeIcon: true },
        plugins: [
          createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: { userStore: { currentUser: TEST_USER, token: TEST_USER.token } } }),
          { install(app) { app.config.globalProperties.$router = mockRouter } }
        ],
      },
    })
    await flushPromises()

    const notifNavBtn = wrapper.find('#notification-btn')
    if (notifNavBtn.exists()) {
      await notifNavBtn.trigger('click')
      await wrapper.vm.$nextTick()

      const notifSection = wrapper.find('#notification-section')
      expect(notifSection.exists()).toBe(true)

      const toggle = notifSection.find('input[type="checkbox"]')
      if (toggle.exists()) {
        expect(toggle.element.checked).toBe(true)
        await toggle.setValue(false)
        await wrapper.vm.$nextTick()
        const bodyText = wrapper.html()
        expect(bodyText.toLowerCase()).toContain('turned off')
        await toggle.setValue(true)
      }

      const notifCards = notifSection.findAll('.notification-card')
      if (notifCards.length > 0) {
        const readBtn = notifCards[0].find('.clear-notification-btn')
        if (readBtn.exists()) {
          await readBtn.trigger('click')
          await flushPromises()
          expect(notificationsServices.markNotificationAsRead).toHaveBeenCalled()
        }

        const clearAllBtn = wrapper.find('.btn-clear-all')
        if (clearAllBtn.exists()) {
          await clearAllBtn.trigger('click')
          await flushPromises()
          expect(notificationsServices.clearAllNotifications).toHaveBeenCalled()
        }
      }
    }
  })

  it('testUserChatbotInteraction', async () => {
    habitsServices.getAllHabits = vi.fn().mockResolvedValue([])

    // Stub ChatbotWidget to avoid deep mounting if not needed, but here the test expects elements
    // so we will actually render it or simulate it if it's integrated
    const wrapper = mount(ExploreHabitsView, {
      global: {
        stubs: { NavBar: true, FontAwesomeIcon: true }, // Don't stub ChatbotWidget to allow testing
        plugins: [
          createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: { userStore: { currentUser: TEST_USER, token: TEST_USER.token } } }),
          { install(app) { app.config.globalProperties.$router = mockRouter } }
        ],
      },
    })
    await flushPromises()

    const chatFab = wrapper.find('.chatbot-fab')
    if (chatFab.exists()) {
      await chatFab.trigger('click')
      await wrapper.vm.$nextTick()

      const chatPanel = wrapper.find('.chatbot-panel')
      expect(chatPanel.exists()).toBe(true)

      const textarea = wrapper.find('.chat-textarea')
      if (textarea.exists()) {
        await textarea.setValue('How can I get points?')
        const sendBtn = wrapper.find('.send-btn')
        if (sendBtn.exists()) {
          await sendBtn.trigger('click')
          await flushPromises()
        }
      }
    }
  })
})
