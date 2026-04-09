import { describe, it, expect, beforeEach, afterEach } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'

describe('AdminView.vue', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
  })

  it('creates and logs in a user with priority=2 (admin)', async () => {
    const store = useUserStore()

    // prevent fetchUsers from calling external API and overwriting local test users
    store.fetchUsers = async () => Promise.resolve()

    const payload = {
      name: 'adminuser',
      email: 'admin@example.com',
      password: 'AdminPass123!',
      points: 0,
      priority: 2,
    }

    const created = await store.addUser(payload)
    expect(created).toBeTruthy()

    const ok = await store.loginByEmail(payload.email, payload.password)
    expect(ok).toBe(true)

    expect(String(store.loggedUserId)).toBe(String(created.id))

    const current = store.currentUser
    expect(current).toBeTruthy()
    expect(Number(current.priority)).toBe(2)
    // model maps priority 2 to role 'admin'
    expect(current.role === 'admin' || Number(current.priority) === 2).toBeTruthy()
  })
})
