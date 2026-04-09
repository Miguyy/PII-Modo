import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useHabitStore } from '@/stores/habitStore'

describe('HabitManager.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds a habit when addHabit is called', async () => {
    const store = useHabitStore()

    const payload = {
      user_id: 'u1',
      description: 'Test habit from unit test',
      type: 'check',
      priority: 'low',
      location: 'inside',
    }

    const created = await store.addHabit(payload)

    expect(store.habits.length).toBeGreaterThan(0)
    const found = store.habits.find(
      (h) => String(h.id) === String(created.id) || h.description === payload.description,
    )
    expect(found).toBeTruthy()
    expect(found.description).toBe(payload.description)
    expect(found.type).toBe(payload.type)
    expect(found.priority).toBe(payload.priority)
  })
})
