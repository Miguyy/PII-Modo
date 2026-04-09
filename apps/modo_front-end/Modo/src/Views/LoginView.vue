<template>
  <div
    class="login-container"
    style="background: linear-gradient(113deg, #ededed 0.02%, #97dbb4 24.02%, #355d4c 100.02%)"
  >
    <div class="login-form">
      <div class="register-image">
        <a href="/"><img src="../images/M.png" alt="Register Image" class="register-img" /></a>
      </div>
      <p class="login-text">
        Log in to stay <span class="highlight2">on top</span> of your tasks and objectives.
      </p>

      <input
        v-model="email"
        type="email"
        placeholder="Enter your email address"
        id="login-email-user"
      />
      <input
        v-model="password"
        type="password"
        placeholder="Enter your password"
        id="login-password-user"
      />

      <button @click.prevent="loginUser">Login</button>

      <p class="login-register">
        Don't have an account?
        <a
          href="/signin"
          style="text-decoration: none; font-family: Heebo; font-weight: bold; color: #f19640"
          >Sign Up</a
        >
      </p>
    </div>
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
</template>

<script>
import { useUserStore } from '../stores/userStore'

export default {
  name: 'LoginView',
  data() {
    return {
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
      } catch {
        console.log('Failed to parse users from localStorage')
      }
    }

    this.userStore.fetchUsers().catch(() => {})
  },
  methods: {
    async loginUser() {
      if (!this.email || !this.password) {
        this.showToast('Missing fields', 'Please fill in both email and password.', 3000)
        return
      }

      const ok = await this.userStore.loginByEmail(this.email, this.password)

      if (!ok) {
        this.showToast('Login failed', 'Invalid email or password.', 3000)
        return
      }

      const user = this.userStore.currentUser

      this.showToast('Login successful', 'Welcome back!', 2000)

      setTimeout(() => {
        if (user.priority === 2) {
          this.$router.push('/adminpanel')
        } else {
          this.$router.push('/habitsmanager')
        }
      }, 800)
    },
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
