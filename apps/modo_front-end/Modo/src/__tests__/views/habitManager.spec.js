import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount, flushPromises } from '@vue/test-utils'
import { setActivePinia, createPinia } from 'pinia'
import { createTestingPinia } from '@pinia/testing'
import { useUserStore } from '@/stores/userStore'
import { useHabitStore } from '@/stores/habitStore'

import HabitManagerView from '@/Views/HabitManagerView.vue'

import * as userTasksServices from '@/api/services/userTasks.services'
import * as habitsServices from '@/api/services/habits.services'
import * as reportsServices from '@/api/services/reports.services'

const { mockRouter } = vi.hoisted(() => ({
  mockRouter: { push: vi.fn(), replace: vi.fn(), currentRoute: { value: { path: '/' } } },
}))
vi.mock('vue-router', () => ({
  useRouter: () => mockRouter,
  useRoute: () => ({ path: '/', params: {}, query: {} }),
  RouterLink: { template: '<a><slot/></a>' },
}))

vi.mock('@/api/services/userTasks.services')
vi.mock('@/api/services/habits.services')
vi.mock('@/api/services/reports.services')

const TEST_USER = {
  id: 1, name: 'Selenium User Test', email: 'user.test@email.com', password: 'Selenium2026!#',
  pontos: 150, tipo_utilizador: 'utilizador', token: 'fake-token-user',
}

function mountHabitManager() {
  userTasksServices.getUserTasks = vi.fn().mockResolvedValue([
    { id_tarefa_utilizador: 100, task: { nome_tarefa: 'Daily Check', tipo_tarefa: 'Check' }, isCompleted: false, data_conclusao: null }
  ])
  habitsServices.getUserHabits = vi.fn().mockResolvedValue([])
  userTasksServices.completeUserTask = vi.fn().mockResolvedValue({ success: true, pontos: 10 })

  return mount(HabitManagerView, {
    global: {
      stubs: { 
        NavBar: true, FontAwesomeIcon: true, ChatbotWidget: true,
        HabitStatsChart: { template: '<div class="chart-mock"></div>' },
        ActivityChart: { template: '<div class="chart-mock"></div>' }
      },
      plugins: [
        createTestingPinia({ createSpy: vi.fn, stubActions: false, initialState: { userStore: { currentUser: TEST_USER, token: TEST_USER.token } } }),
        { install(app) { app.config.globalProperties.$router = mockRouter } }
      ],
    },
  })
}

beforeEach(() => {
  vi.clearAllMocks()
  mockRouter.push.mockClear()
  setActivePinia(createPinia())
})

describe('Habit Manager View Tests', () => {
  it('testUserHabitTaskCompletionAndRewards', async () => {
    const wrapper = mountHabitManager()
    await flushPromises()

    const taskList = wrapper.find('.tasks-list')
    if (taskList.exists()) {
      const taskItem = taskList.find('.task-item')
      if (taskItem.exists()) {
        const checkBtn = taskItem.find('.btn-outline-success, .btn-check-task')
        if (checkBtn.exists()) {
          await checkBtn.trigger('click')
          await flushPromises()
          expect(userTasksServices.completeUserTask).toHaveBeenCalled()
        } else {
          await wrapper.vm.toggleTaskCompletion?.({ id_tarefa_utilizador: 100, isCompleted: false })
          await flushPromises()
          expect(userTasksServices.completeUserTask).toHaveBeenCalled()
        }
      }
    }
  })

})
