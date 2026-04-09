import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import * as api from '@/api/modoApi'
import db from '../../db.json'

describe('Delete random user from db.json', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('picks a random user from db.json and deletes it via store.deleteAccount', async () => {
    const store = useUserStore()

    // avoid external fetch
    store.fetchUsers = async () => Promise.resolve()

    // load users from db.json into the store for the test
    const dbUsers = Array.isArray(db.users) ? db.users.filter((u) => u && u.id != null) : []
    expect(dbUsers.length).toBeGreaterThan(0)

    store.users = dbUsers.map((u) => ({ ...u }))

    // pick a random user
    const idx = Math.floor(Math.random() * store.users.length)
    const target = store.users[idx]
    expect(target).toBeTruthy()

    // stub API delete to avoid network calls
    vi.spyOn(api, 'deleteUser').mockResolvedValue(true)

    // set the target as logged user to also verify logout behavior
    store.loggedUserId = target.id
    localStorage.setItem('loggedUserId', String(target.id))

    await store.deleteAccount(target.id)

    // user must be removed from the store
    const found = store.getUserById(target.id)
    expect(found).toBeUndefined()

    // loggedUserId should be cleared when deleting the logged user
    expect(store.loggedUserId).toBeNull()
    expect(localStorage.getItem('loggedUserId')).toBeNull()
  })
})
