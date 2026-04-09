<template>
  <div
    class="register-container"
    style="background: linear-gradient(113deg, #ededed 0.02%, #97dbb4 24.02%, #355d4c 100.02%)"
  >
    <div class="register-form">
      <div class="register-image">
        <a href="/"><img src="../images/M.png" alt="Register Image" class="register-img" /></a>
      </div>
      <p class="register-text">
        Sign up to build <span class="highlight2">better</span> habits and
        <span class="highlight2">achieve</span> your objectives.
      </p>

      <input v-model="name" type="text" placeholder="Enter your username" id="reg-name-user" />
      <input
        v-model="email"
        type="email"
        placeholder="Enter your email address"
        id="reg-email-user"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Enter your password"
        id="reg-password-user"
      />

      <button @click="registerUser">Sign Up</button>

      <p class="register-login">
        Already have an account?
        <a
          href="/login"
          style="text-decoration: none; font-family: Heebo; font-weight: bold; color: #f19640"
          >Login</a
        >
      </p>
    </div>
    
    <!-- Toast notification -->
    <Transition name="toast-slide">
      <div v-if="toast.visible" class="toast-notification">
        <div class="toast-icon">
          <FontAwesomeIcon icon="info-circle" />
        </div>
        <div class="toast-content">
          <strong>{{ toast.title }}</strong>
          <small>{{ toast.message }}</small>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { useUserStore } from '../stores/userStore'

export default {
  name: 'RegisterView',
  data() {
    return {
      name: '',
      email: '',
      password: '',
      userStore: null,
      toast: { visible: false, title: '', message: '', timeout: null },
    }
  },
  created() {
    this.userStore = useUserStore()

    const storedUsers = localStorage.getItem('users')
    if (storedUsers && (!this.userStore.users || this.userStore.users.length === 0)) {
      try {
        this.userStore.users = JSON.parse(storedUsers)
        const maxId = this.userStore.users.reduce((max, u) => Math.max(max, Number(u.id)), -1)
        this.userStore.nextId = maxId + 1
      } catch {
        console.log('Failed to parse users from localStorage')
      }
    }

    this.userStore.fetchUsers().catch(() => {})
  },
  methods: {
    async registerUser() {
      if (!this.name || !this.email || !this.password) {
        this.showToast('Missing fields', 'Please fill in all fields.', 3000)
        return
      }

      const passwordChar = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[\W_]).{8,}$/
      if (!passwordChar.test(this.password)) {
        this.showToast(
          'Weak password',
          'Password must be at least 8 characters and include uppercase, lowercase, number, and special character.',
          4500,
        )
        return
      }

      if (this.userStore.users.some((user) => user.email === this.email)) {
        this.showToast('Email in use', 'Email is already registered.', 3000)
        return
      }

      try {
        await this.userStore.addUser({
          name: this.name,
          email: this.email,
          password: this.password,
          avatar: null,
          points: 0,
          priority: 1,
        })

        localStorage.setItem('users', JSON.stringify(this.userStore.users))

        // show toast instead of alert
        this.showToast('Account created', 'User registered successfully!', 2500)

        // clear inputs
        this.name = ''
        this.email = ''
        this.password = ''

        // navigate to login after a short delay so the toast is visible briefly
        setTimeout(() => this.$router.push('/login'), 2000)
      } catch (e) {
        console.error(e)
        this.showToast('Registration failed', 'Failed to register user.', 3000)
      }
    },
    // Toast helper (simple local toast matching HabitManagerView)
    showToast(title, message, duration = 3000) {
      if (!this.toast) this.toast = { visible: false, title: '', message: '', timeout: null }
      this.toast.title = title
      this.toast.message = message
      this.toast.visible = true

      if (this.toast.timeout) clearTimeout(this.toast.timeout)
      this.toast.timeout = setTimeout(() => {
        this.toast.visible = false
      }, duration)
    },
  },
}
</script>