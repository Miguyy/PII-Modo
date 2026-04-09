<template>
  <NavBar />
  <main class="page">
    <div class="page-title">
      <h2>SETTINGS</h2>
    </div>

    <section v-if="user" class="settings-card">
      <!-- Hidden file input for profile picture -->
      <input
        type="file"
        ref="fileInput"
        accept="image/*"
        style="display: none"
        @change="handleFileUpload"
      />

      <header class="profile-header">
        <div class="avatar" id="avatar" v-show="showAvatar">
          <template v-if="profilePic || user?.avatar">
            <img :src="profilePic || user?.avatar" alt="Profile" />
          </template>
          <template v-else>
            <div class="avatar-fallback">{{ userInitials }}</div>
          </template>
          <button class="card-button btn-avatar-edit" @click="openDecoration">✎</button>
          <img
            v-if="selectedDecoration"
            :src="selectedDecoration"
            class="avatar-decoration"
            alt=""
          />
        </div>

        <div class="swiper" id="avatar-decoration" v-show="!showAvatar">
          <div class="card-wrapper">
            <button class="card-button btn-avatar-exit" @click="closeDecoration">✕</button>
            <ul
              class="card-list swiper-wrapper"
              :style="{ transform: `translateX(-${currentIndex * slideWidth}px)` }"
            >
              <li
                v-for="item in decorations"
                :key="item.name"
                class="card-item swiper-slide"
                :class="{ 'decoration-locked': userLevel < (item.requiredLevel ?? 0) }"
              >
                <button
                  class="card-button btn-avatar-check"
                  @click="selectDecoration(item.src)"
                  :class="{ 'btn-locked': userLevel < (item.requiredLevel ?? 0) }"
                >
                  <FontAwesomeIcon
                    :icon="userLevel < (item.requiredLevel ?? 0) ? 'lock' : 'check'"
                  />
                </button>
                <img :src="item.src" :alt="item.name" />
                <span
                  class="decoration-level-badge"
                  :class="{ unlocked: userLevel >= (item.requiredLevel ?? 0) }"
                >
                  Lv. {{ item.requiredLevel ?? 0 }}
                </span>
              </li>
            </ul>

            <button class="swiper-button-prev" @click="prevSlide">←</button>
            <button class="swiper-button-next" @click="nextSlide">→</button>
            <div class="swiper-preview">
              <template v-if="profilePic || user?.avatar">
                <img :src="profilePic || user?.avatar" alt="Profile" />
              </template>
              <template v-else>
                <div class="avatar-fallback">{{ userInitials }}</div>
              </template>
            </div>
          </div>
        </div>

        <div class="profile-info">
          <h2>Welcome back, {{ user.name }}</h2>
          <p>{{ user.email }}</p>
        </div>
        <button class="change-picture" @click="promptAvatar">Change picture</button>
      </header>

      <div class="settings-content">
        <aside class="sidebar">
          <div
            class="nav-item"
            :class="{ active: activeSection === 'account' || activeSection === null }"
            id="account-btn"
            @click="toggleSection('account')"
          >
            <span><FontAwesomeIcon icon="user" /> Account Info</span> →
          </div>
          <div
            class="nav-item"
            :class="{ active: activeSection === 'notifications' }"
            id="notification-btn"
            @click="toggleSection('notifications')"
          >
            <span><FontAwesomeIcon icon="bell" /> Notifications</span>
            <span v-if="notifications.length > 0" class="notification-badge">{{
              notifications.length
            }}</span>
            <span v-else>→</span>
          </div>
          <div
            class="nav-item"
            :class="{ active: activeSection === 'help' }"
            id="help-btn"
            @click="toggleSection('help')"
          >
            <span><FontAwesomeIcon icon="circle-question" /> Help</span> →
          </div>
          <div
            class="nav-item"
            :class="{ active: activeSection === 'about' }"
            id="about-btn"
            @click="toggleSection('about')"
          >
            <span><FontAwesomeIcon icon="info-circle" /> About</span> →
          </div>
          <div class="nav-item danger" id="logout-btn" @click="handleLogout">
            <FontAwesomeIcon icon="right-from-bracket" /> Logout
          </div>
          <div class="nav-item danger" id="delete-btn" @click="handleDeleteAccount">
            <FontAwesomeIcon icon="trash" /> Delete account
          </div>
        </aside>

        <div class="content-card">
          <!-- Account Info Section -->
          <div class="form-section" v-show="activeSection === 'account' || activeSection === null">
            <h3 class="section-title"><FontAwesomeIcon icon="user" /> Account Information</h3>
            <div class="field-group">
              <label>Name</label>
              <div class="inline">
                <input
                  type="text"
                  v-model="userName"
                  :readonly="!isEditingName"
                  :style="{ opacity: isEditingName ? 1 : 0.5 }"
                />
                <button
                  id="toggle-name"
                  type="button"
                  class="btn-change change-name"
                  @click="toggleEditName"
                >
                  {{ isEditingName ? 'Ok' : 'Change' }}
                </button>
              </div>
            </div>

            <div class="field-group">
              <label><FontAwesomeIcon icon="envelope" /> Email address</label>
              <div class="inline">
                <input
                  id="change-email"
                  type="email"
                  v-model="userEmail"
                  :readonly="!isEditingEmail"
                  :style="{ opacity: isEditingEmail ? 1 : 0.5 }"
                />

                <button
                  id="toggle-email"
                  type="button"
                  class="btn-change change-email"
                  @click="toggleEditEmail"
                >
                  {{ isEditingEmail ? 'Ok' : 'Change' }}
                </button>
              </div>
            </div>

            <div class="field-group">
              <label><FontAwesomeIcon icon="lock" /> Password</label>
              <div class="inline">
                <input
                  :type="isEditingPassword ? 'text' : 'password'"
                  v-model="userPassword"
                  :readonly="!isEditingPassword"
                  :style="{ opacity: isEditingPassword ? 1 : 0.5 }"
                />
                <button
                  id="toggle-password"
                  type="button"
                  class="btn-change change-password"
                  @click="toggleEditPassword"
                >
                  {{ isEditingPassword ? 'Ok' : 'Change' }}
                </button>
              </div>
            </div>

            <div class="form-actions">
              <button class="btn-primary" @click="saveChanges">Save changes</button>
            </div>
          </div>

          <!-- Notifications Section -->
          <div
            class="form-section"
            id="notification-section"
            v-show="activeSection === 'notifications'"
          >
            <h3 class="section-title"><FontAwesomeIcon icon="bell" /> Notifications</h3>
            <div v-if="notifications.length === 0" class="no-notifications">
              <p>No notifications yet!</p>
            </div>
            <div
              v-for="(notification, index) in notifications"
              :key="index"
              class="notification-card"
            >
              <h3 class="notification-title">{{ notification.title }}</h3>
              <p class="notification-content">
                {{ notification.message }}
              </p>
              <small class="notification-date">{{
                formatNotificationDate(notification.date)
              }}</small>
              <button class="clear-notification-btn" @click="dismissNotification(index)">
                Dismiss
              </button>
            </div>
            <button
              v-if="notifications.length > 0"
              class="btn-clear-all"
              @click="clearAllNotifications"
            >
              Clear All
            </button>
          </div>

          <!-- Help Section -->
          <div class="form-section" id="help-section" v-show="activeSection === 'help'">
            <h3 class="section-title"><FontAwesomeIcon icon="circle-question" /> Need Help?</h3>
            <p>
              <strong>Getting Started:</strong> Create your first habit by navigating to the Habit
              Manager page. Click "Create new habit" and fill in the details.
            </p>
            <p>
              <strong>Tracking Progress:</strong> Mark habits as complete daily to earn points and
              level up. Each completed habit awards you 10 points!
            </p>
            <p>
              <strong>Avatar Decorations:</strong> Unlock new avatar decorations every 5 levels.
              Visit Settings to customize your profile.
            </p>
            <p>
              <strong>Contact Support:</strong> For further assistance, email us at support@modo.app
            </p>
          </div>

          <!-- About Section -->
          <div class="form-section" id="about-section" v-show="activeSection === 'about'">
            <h3 class="section-title"><FontAwesomeIcon icon="info-circle" /> What about MODO?</h3>
            <p>
              MODO is a minimalist and powerful habit tracker built to help you take control of your
              daily routine. Whether you're trying to develop healthier habits, stay focused on
              personal goals, or simply bring more structure to your day, MODO keeps you on track
              with clarity and ease. Designed with simplicity in mind, MODO lets you create habits,
              track your progress, and celebrate your streaks—all in a clean, distraction-free
              interface. Smart reminders and visual insights help you stay motivated, showing you
              how small, consistent actions lead to meaningful change. MODO isn't just about
              checking off tasks. It's about building momentum, staying intentional, and becoming
              the best version of yourself, one habit at a time. Live with purpose. Grow with
              consistency. Move with MODO.
            </p>
          </div>
        </div>
      </div>
    </section>

    <section v-else class="settings-card">
      <p>Please log in to access your settings.</p>
    </section>
  </main>

  <!-- Toast notification -->
  <Transition name="toast-slide">
    <div v-if="toast.visible" class="toast-notification" :class="toast.type">
      <div class="toast-icon">
        {{ toast.type === 'error' ? '❌' : toast.type === 'warning' ? '⚠️' : '✅' }}
      </div>
      <div class="toast-content">
        <strong>{{ toast.title }}</strong>
        <small>{{ toast.message }}</small>
      </div>
    </div>
  </Transition>

  <!-- Confirmation Modal -->
  <Transition name="modal-fade">
    <div v-if="confirmModal.visible" class="modal-overlay" @click.self="cancelConfirm">
      <div class="confirm-modal">
        <h3>{{ confirmModal.title }}</h3>
        <p>{{ confirmModal.message }}</p>
        <div class="modal-actions">
          <button class="btn-cancel" @click="cancelConfirm">Cancel</button>
          <button
            class="btn-confirm"
            :class="{ 'btn-danger': confirmModal.isDanger }"
            @click="acceptConfirm"
          >
            {{ confirmModal.confirmText || 'Confirm' }}
          </button>
        </div>
      </div>
    </div>
  </Transition>
</template>

<script setup>
import { useUserStore } from '../stores/userStore'
import { computed, ref, onMounted, watch } from 'vue'
import { useRouter } from 'vue-router'
import NavBar from '@/Components/NavBar.vue'

defineOptions({
  name: 'SettingsView',
})

const userStore = useUserStore()
const router = useRouter()
const user = computed(() => userStore.currentUser)

// Active section for sidebar navigation
const activeSection = ref(null)

function toggleSection(section) {
  activeSection.value = activeSection.value === section ? null : section
}

// Notifications system
const notifications = ref([])

function loadNotifications() {
  const userId = user.value?.id
  if (!userId) return
  const saved = localStorage.getItem(`notifications_${userId}`)
  if (saved) {
    try {
      notifications.value = JSON.parse(saved)
    } catch {
      notifications.value = []
    }
  }
}

function saveNotifications() {
  const userId = user.value?.id
  if (!userId) return
  localStorage.setItem(`notifications_${userId}`, JSON.stringify(notifications.value))
}

function addNotification(title, message) {
  notifications.value.unshift({
    title,
    message,
    date: new Date().toISOString(),
  })
  saveNotifications()
}

function dismissNotification(index) {
  notifications.value.splice(index, 1)
  saveNotifications()
  showToast('Notification dismissed', '', 'success')
}

function clearAllNotifications() {
  notifications.value = []
  saveNotifications()
  showToast('All notifications cleared', '', 'success')
}

function formatNotificationDate(dateStr) {
  const date = new Date(dateStr)
  return (
    date.toLocaleDateString() +
    ' ' +
    date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  )
}

// Check for newly unlocked decorations based on user level
function checkDecorationUnlocks() {
  const userId = user.value?.id
  if (!userId) return

  const level = Math.floor((user.value.points || 0) / 100)
  const unlockedKey = `unlockedDecorations_${userId}`
  const savedUnlocked = localStorage.getItem(unlockedKey)
  let previouslyUnlocked = []

  if (savedUnlocked) {
    try {
      previouslyUnlocked = JSON.parse(savedUnlocked)
    } catch {
      previouslyUnlocked = []
    }
  }

  // Load decorations
  const saved = localStorage.getItem('avatarDecorations')
  let decorationsList = []
  if (saved) {
    try {
      decorationsList = JSON.parse(saved)
    } catch {
      decorationsList = []
    }
  }

  // Default decorations fallback
  if (decorationsList.length === 0) {
    decorationsList = [
      { name: 'solarSystem', requiredLevel: 0 },
      { name: 'garden', requiredLevel: 5 },
      { name: 'olives', requiredLevel: 10 },
      { name: 'cat', requiredLevel: 15 },
      { name: 'summer', requiredLevel: 20 },
      { name: 'zoo', requiredLevel: 25 },
    ]
  }

  // Check for newly unlocked decorations
  const newlyUnlocked = decorationsList.filter((d) => {
    const requiredLevel = d.requiredLevel ?? 0
    return level >= requiredLevel && !previouslyUnlocked.includes(d.name)
  })

  // Add notifications for newly unlocked decorations
  newlyUnlocked.forEach((d) => {
    addNotification(
      '🎉 New Decoration Unlocked!',
      `Congratulations! You've unlocked the "${d.name}" avatar decoration at Level ${d.requiredLevel ?? 0}!`,
    )
    previouslyUnlocked.push(d.name)
  })

  // Save updated unlocked list
  localStorage.setItem(unlockedKey, JSON.stringify(previouslyUnlocked))
}

// Toast notification state
const toast = ref({
  visible: false,
  title: '',
  message: '',
  type: 'success', // 'success', 'error', 'warning'
  timeout: null,
})

function showToast(title, message, type = 'success', duration = 3000) {
  toast.value.title = title
  toast.value.message = message
  toast.value.type = type
  toast.value.visible = true

  if (toast.value.timeout) clearTimeout(toast.value.timeout)

  toast.value.timeout = setTimeout(() => {
    toast.value.visible = false
  }, duration)
}

// Confirmation modal state
const confirmModal = ref({
  visible: false,
  title: '',
  message: '',
  confirmText: 'Confirm',
  isDanger: false,
  onConfirm: null,
})

function showConfirm(title, message, onConfirm, options = {}) {
  confirmModal.value = {
    visible: true,
    title,
    message,
    confirmText: options.confirmText || 'Confirm',
    isDanger: options.isDanger || false,
    onConfirm,
  }
}

function acceptConfirm() {
  if (confirmModal.value.onConfirm) {
    confirmModal.value.onConfirm()
  }
  confirmModal.value.visible = false
}

function cancelConfirm() {
  confirmModal.value.visible = false
}

// name
const isEditingName = ref(false)
const userName = ref(user.value?.name || '')

const toggleEditName = async () => {
  if (isEditingName.value) {
    if (userName.value !== user.value.name) {
      // Verifica se já existe o nome para outro utilizador
      const nameExists = userStore.users.find(
        (u) => u.name === userName.value && u.id !== user.value.id,
      )

      if (nameExists) {
        showToast('Name unavailable', `The name "${userName.value}" is already taken.`, 'error')
        return
      }

      // Se não existe, atualiza e persiste
      try {
        await userStore.updateUserProfile({ name: userName.value })
        showToast('Success', 'Name updated successfully!', 'success')
      } catch (e) {
        showToast('Error', 'Failed to update name: ' + e.message, 'error')
        return
      }
    }

    isEditingName.value = false
  } else {
    userName.value = user.value.name
    isEditingName.value = true
  }
}

// email
const isEditingEmail = ref(false)
const userEmail = ref(user.value?.email || '')

const toggleEditEmail = () => {
  if (isEditingEmail.value) {
    if (userEmail.value !== user.value.email) {
      // Verifica se já existe o email para outro utilizador
      const emailExists = userStore.users.find(
        (u) => u.email === userEmail.value && u.id !== user.value.id,
      )

      if (emailExists) {
        showToast(
          'Email unavailable',
          `The email "${userEmail.value}" is already registered.`,
          'error',
        )
        return
      }

      // Se não existe, atualiza
      user.value.email = userEmail.value
    }

    isEditingEmail.value = false
    console.log('Email atualizado com sucesso.')
  } else {
    userEmail.value = user.value.email
    isEditingEmail.value = true
  }
}

// password
const isEditingPassword = ref(false)
const userPassword = ref(user.value?.password || '********') // Valor inicial ou da store

const toggleEditPassword = () => {
  if (isEditingPassword.value) {
    if (user.value) user.value.password = userPassword.value
    isEditingPassword.value = false
  } else {
    // Ao clicar em change, garante que o rascunho tem a senha atual
    userPassword.value = user.value?.password || ''
    isEditingPassword.value = true
  }
}

// avatar
const showAvatar = ref(true)
const currentIndex = ref(0)
const slideWidth = 96
const selectedDecoration = ref(null)

// profile picture
const fileInput = ref(null)
const profilePic = ref(user.value?.avatar || null)

// initials fallback (like HabitManager profile-card)
const userInitials = computed(() => {
  const name = user.value?.name || ''
  const initials = name
    .split(' ')
    .filter((n) => n)
    .map((n) => n[0])
    .join('')
    .slice(0, 2)
  return initials ? initials.toUpperCase() : '?'
})

// Default decorations (fallback) with requiredLevel
const defaultDecorations = [
  { name: 'solarSystem', src: '/src/images/avatar_decoration/solarSystem.png', requiredLevel: 0 },
  { name: 'garden', src: '/src/images/avatar_decoration/garden.png', requiredLevel: 5 },
  { name: 'olives', src: '/src/images/avatar_decoration/olives.png', requiredLevel: 10 },
  { name: 'cat', src: '/src/images/avatar_decoration/cat.png', requiredLevel: 15 },
  { name: 'summer', src: '/src/images/avatar_decoration/summer.png', requiredLevel: 20 },
  { name: 'zoo', src: '/src/images/avatar_decoration/zoo.png', requiredLevel: 25 },
]

// Load decorations from localStorage (synced with Admin Panel)
function loadDecorations() {
  const saved = localStorage.getItem('avatarDecorations')
  if (saved) {
    try {
      return JSON.parse(saved)
    } catch {
      return [...defaultDecorations]
    }
  }
  return [...defaultDecorations]
}

const decorations = ref(loadDecorations())

// Load saved decoration and profile pic on mount
onMounted(() => {
  if (user.value?.avatarDecoration) {
    selectedDecoration.value = user.value.avatarDecoration
  }
  if (user.value?.avatar) {
    profilePic.value = user.value.avatar
  }
  // load notifications and check for unlocked decorations on mount
  loadNotifications()
  checkDecorationUnlocks()
})

// Re-check unlocks when user points change
watch(
  () => user.value?.points,
  (newPoints, oldPoints) => {
    if (newPoints !== oldPoints && newPoints !== undefined) {
      checkDecorationUnlocks()
    }
  },
)

// Handle profile picture upload
const promptAvatar = () => {
  fileInput.value?.click()
}

const handleFileUpload = (event) => {
  const file = event.target.files[0]
  if (!file) return

  // Validate file type
  if (!file.type.startsWith('image/')) {
    showToast('Invalid file', 'Please select an image file.', 'error')
    return
  }

  // Validate file size (max 5MB)
  if (file.size > 5 * 1024 * 1024) {
    showToast('File too large', 'Please select an image smaller than 5MB.', 'error')
    return
  }

  // Convert to base64 and store
  const reader = new FileReader()
  reader.onload = (e) => {
    profilePic.value = e.target.result
    if (user.value) {
      user.value.avatar = e.target.result
      userStore.saveToLocalStorage()
    }
    showToast('Picture updated', 'Your profile picture has been changed.', 'success')
  }
  reader.onerror = () => {
    showToast('Error', 'Failed to read the image file.', 'error')
  }
  reader.readAsDataURL(file)

  // Reset the input so the same file can be selected again
  event.target.value = ''
}

const openDecoration = () => {
  showAvatar.value = false
}

const closeDecoration = () => {
  showAvatar.value = true
}

const nextSlide = () => {
  if (currentIndex.value < decorations.value.length - 1) {
    currentIndex.value++
  }
}

const prevSlide = () => {
  if (currentIndex.value > 0) {
    currentIndex.value--
  }
}

// Compute user level based on points
const userLevel = computed(() => {
  if (!user.value || Number.isNaN(Number(user.value.points))) return 0
  return Math.floor((user.value.points || 0) / 100)
})

// Find decoration by src to get its required level
const getDecorationBySource = (src) => {
  return decorations.value.find((d) => d.src === src)
}

const selectDecoration = async (src) => {
  const decoration = getDecorationBySource(src)
  const requiredLevel = decoration?.requiredLevel ?? 0

  // Check if user has sufficient level
  if (userLevel.value < requiredLevel) {
    showToast(
      'Level Required',
      `You need to be Level ${requiredLevel} to use this decoration. You are currently Level ${userLevel.value}.`,
      'warning',
      4000,
    )
    return
  }

  selectedDecoration.value = src
  showAvatar.value = true
  // Save to user profile using updateUserProfile for proper persistence
  if (user.value) {
    try {
      await userStore.updateUserProfile({ avatarDecoration: src })
    } catch {
      // Fallback: save directly
      user.value.avatarDecoration = src
      userStore.saveToLocalStorage()
    }
  }
  showToast(
    'Decoration Applied',
    `"${decoration?.name || 'Decoration'}" has been equipped!`,
    'success',
  )
}

// Logout function
const handleLogout = () => {
  showConfirm('Logout', 'Are you sure you want to logout?', () => {
    userStore.logout()
    router.push('/login')
  })
}

// Delete account function
const handleDeleteAccount = () => {
  showConfirm(
    'Delete Account',
    'Are you sure you want to delete your account? This action cannot be undone and will permanently delete all your data.',
    async () => {
      try {
        await userStore.deleteAccount()
        router.push('/login')
      } catch (e) {
        showToast('Error', 'Failed to delete account: ' + e.message, 'error')
      }
    },
    { confirmText: 'Delete', isDanger: true },
  )
}

// Save all changes
const saveChanges = async () => {
  try {
    await userStore.updateUserProfile({
      name: userName.value,
      email: userEmail.value,
      password: userPassword.value,
      avatar: profilePic.value,
      avatarDecoration: selectedDecoration.value,
    })
    showToast('Success', 'Changes saved successfully!', 'success')
  } catch (e) {
    showToast('Error', 'Failed to save changes: ' + e.message, 'error')
  }
}
</script>
