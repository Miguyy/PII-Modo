import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import * as api from '@/api/modoApi'

// Actual avatar decoration paths from the project
const AVATAR_DECORATIONS = {
  solarSystem: '/src/images/avatar_decoration/solarSystem.png',
  garden: '/src/images/avatar_decoration/garden.png',
  olives: '/src/images/avatar_decoration/olives.png',
  cat: '/src/images/avatar_decoration/cat.png',
  summer: '/src/images/avatar_decoration/summer.png',
  zoo: '/src/images/avatar_decoration/zoo.png',
}

/**
 * ChangeAvatarDecoration.spec.js
 * 
 * Tests for the avatar decoration functionality.
 * Validates that users can select and apply decorative frames/borders
 * around their profile pictures using the userStore.
 */
describe('Avatar Decoration Management', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('applies a new decoration to user avatar', async () => {
    const store = useUserStore()

    // Create a test user
    const testUser = {
      id: 'test-user-1',
      name: 'Test User',
      email: 'testdecoration@example.com',
      password: 'TestPass123!',
      avatar: null,
      avatarDecoration: null,
      points: 0,
      priority: 1,
    }

    // Add user to store and set as logged in
    store.users = [testUser]
    store.loggedUserId = testUser.id
    localStorage.setItem('loggedUserId', testUser.id)

    // Stub API update to avoid network calls
    vi.spyOn(api, 'updateUser').mockResolvedValue({ ...testUser })

    // Use actual decoration path from project
    const decorationPath = AVATAR_DECORATIONS.solarSystem

    // Update avatar decoration
    const updatedUser = await store.updateUserProfile({
      avatarDecoration: decorationPath,
    })

    // Verify the decoration was updated
    expect(updatedUser).toBeTruthy()
    expect(updatedUser.avatarDecoration).toBe(decorationPath)

    // Verify the user in store has the updated decoration
    const userInStore = store.getUserById(testUser.id)
    expect(userInStore.avatarDecoration).toBe(decorationPath)
  })

  it('replaces existing decoration with a different one', async () => {
    const store = useUserStore()

    // Create a test user with an existing decoration
    const testUser = {
      id: 'test-user-2',
      name: 'Test User 2',
      email: 'testchange@example.com',
      password: 'TestPass123!',
      avatar: null,
      avatarDecoration: AVATAR_DECORATIONS.cat,
      points: 0,
      priority: 1,
    }

    // Add user to store and set as logged in
    store.users = [testUser]
    store.loggedUserId = testUser.id
    localStorage.setItem('loggedUserId', testUser.id)

    // Stub API update
    vi.spyOn(api, 'updateUser').mockResolvedValue({ ...testUser })

    // Verify initial decoration
    const initialUser = store.getUserById(testUser.id)
    expect(initialUser.avatarDecoration).toBe(AVATAR_DECORATIONS.cat)

    // Change to a different decoration
    const newDecoration = AVATAR_DECORATIONS.zoo
    await store.updateUserProfile({
      avatarDecoration: newDecoration,
    })

    // Verify the decoration changed
    const updatedUser = store.getUserById(testUser.id)
    expect(updatedUser.avatarDecoration).toBe(newDecoration)
    expect(updatedUser.avatarDecoration).not.toBe(AVATAR_DECORATIONS.cat)
    expect(updatedUser.avatarDecoration).toContain('/src/images/avatar_decoration/')
  })

  it('persists decoration changes in localStorage', async () => {
    const store = useUserStore()

    // Create a test user
    const testUser = {
      id: 'test-user-3',
      name: 'Test User 3',
      email: 'testpersist@example.com',
      password: 'TestPass123!',
      avatar: null,
      avatarDecoration: null,
      points: 0,
      priority: 1,
    }

    // Add user to store and set as logged in
    store.users = [testUser]
    store.loggedUserId = testUser.id
    localStorage.setItem('loggedUserId', testUser.id)

    // Stub API update
    vi.spyOn(api, 'updateUser').mockResolvedValue({ ...testUser })

    // Update decoration using actual image path
    const newDecoration = AVATAR_DECORATIONS.summer

    await store.updateUserProfile({
      avatarDecoration: newDecoration,
    })

    // Check localStorage was updated
    const savedData = localStorage.getItem('users')
    expect(savedData).toBeTruthy()

    const parsedUsers = JSON.parse(savedData)
    const savedUser = parsedUsers.find((u) => u.id === testUser.id)

    expect(savedUser).toBeTruthy()
    expect(savedUser.avatarDecoration).toBe(newDecoration)
  })

  it('removes decoration when set to null', async () => {
    const store = useUserStore()

    // Create a test user with an existing decoration
    const testUser = {
      id: 'test-user-4',
      name: 'Test User 4',
      email: 'testremove@example.com',
      password: 'TestPass123!',
      avatar: null,
      avatarDecoration: AVATAR_DECORATIONS.garden,
      points: 0,
      priority: 1,
    }

    // Add user to store and set as logged in
    store.users = [testUser]
    store.loggedUserId = testUser.id
    localStorage.setItem('loggedUserId', testUser.id)

    // Stub API update
    vi.spyOn(api, 'updateUser').mockResolvedValue({ ...testUser })

    // Verify initial decoration exists
    const initialUser = store.getUserById(testUser.id)
    expect(initialUser.avatarDecoration).toBeTruthy()

    // Remove decoration
    await store.updateUserProfile({
      avatarDecoration: null,
    })

    // Verify decoration was removed
    const updatedUser = store.getUserById(testUser.id)
    expect(updatedUser.avatarDecoration).toBeNull()
  })
})
