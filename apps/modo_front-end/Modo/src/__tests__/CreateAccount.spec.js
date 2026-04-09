import { describe, it, expect, beforeEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'

describe('RegisterView.vue', () => {
  beforeEach(() => {
    setActivePinia(createPinia())
  })

  it('adds an account when addUser is called', async () => {
    const store = useUserStore()

    const payload = {
      name: 'testuser',
      email: 'test@example.com',
      password: 'TestPassword123!',
      points: 0,
      priority: 1,
    }

    const created = await store.addUser(payload)

    expect(created).toBeTruthy()
    expect(store.users.length).toBeGreaterThan(0)

    const found = store.users.find(
      (u) => String(u.id) === String(created.id) || u.email === payload.email,
    )

    expect(found).toBeTruthy()
    expect(found.email).toBe(payload.email)
    expect(found.name).toBe(payload.name)
  })
})
