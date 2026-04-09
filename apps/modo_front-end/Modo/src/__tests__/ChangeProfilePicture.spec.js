import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest'
import { setActivePinia, createPinia } from 'pinia'
import { useUserStore } from '@/stores/userStore'
import * as api from '@/api/modoApi'

// Actual image paths from the project
const PROFILE_IMAGES = {
  modoIcon: '/src/images/modoIcon.png',
  people: '/src/images/people.png',
  perfectDay: '/src/images/perfectDay.png',
  carousel1: '/src/images/carousel_img1.png',
  carousel2: '/src/images/carousel_img2.png',
}

/**
 * ChangeProfilePicture.spec.js
 * 
 * Tests for the profile picture (avatar) change functionality.
 * Validates that users can upload and update their profile pictures
 * using the userStore's updateUserProfile method.
 */
describe('Profile Picture Management', () => {
  beforeEach(() => {
    localStorage.clear()
    setActivePinia(createPinia())
  })

  afterEach(() => {
    localStorage.clear()
    vi.restoreAllMocks()
  })

  it('updates user avatar when a new profile picture is set', async () => {
    const store = useUserStore()

    // Create a test user
    const testUser = {
      id: 'test-user-1',
      name: 'Test User',
      email: 'testprofile@example.com',
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

    // Use actual image path from project
    const newProfileImage = PROFILE_IMAGES.modoIcon

    // Update profile picture
    const updatedUser = await store.updateUserProfile({
      avatar: newProfileImage,
    })

    // Verify the avatar was updated
    expect(updatedUser).toBeTruthy()
    expect(updatedUser.avatar).toBe(newProfileImage)

    // Verify the user in store has the updated avatar
    const userInStore = store.getUserById(testUser.id)
    expect(userInStore.avatar).toBe(newProfileImage)
    expect(userInStore.avatar).toContain('/src/images/')
  })

  it('replaces existing profile picture with a new one', async () => {
    const store = useUserStore()

    const oldAvatar = PROFILE_IMAGES.people

    // Create a test user with an existing avatar
    const testUser = {
      id: 'test-user-2',
      name: 'Test User 2',
      email: 'testchange@example.com',
      password: 'TestPass123!',
      avatar: oldAvatar,
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

    // Verify initial avatar
    const initialUser = store.getUserById(testUser.id)
    expect(initialUser.avatar).toBe(oldAvatar)

    // Change to a different avatar using actual image
    const newAvatar = PROFILE_IMAGES.carousel1
    await store.updateUserProfile({
      avatar: newAvatar,
    })

    // Verify the avatar changed
    const updatedUser = store.getUserById(testUser.id)
    expect(updatedUser.avatar).toBe(newAvatar)
    expect(updatedUser.avatar).not.toBe(oldAvatar)
  })

  it('profile picture changes persist in localStorage', async () => {
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

    // Update profile picture using actual image
    const newAvatar = PROFILE_IMAGES.perfectDay

    await store.updateUserProfile({
      avatar: newAvatar,
    })

    // Check localStorage was updated
    const savedData = localStorage.getItem('users')
    expect(savedData).toBeTruthy()

    const parsedUsers = JSON.parse(savedData)
    const savedUser = parsedUsers.find((u) => u.id === testUser.id)

    expect(savedUser).toBeTruthy()
    expect(savedUser.avatar).toBe(newAvatar)
  })
})
