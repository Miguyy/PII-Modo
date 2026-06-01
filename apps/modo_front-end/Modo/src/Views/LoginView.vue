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

      <button @click.prevent="handleLogin" style="font-weight: bold; font-size: 18px">Login</button>

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

  <Transition name="toast-slide">
    <div v-if="toast.visible" class="toast-notification">
      <div class="toast-icon">
        <font-awesome-icon icon="info-circle" />
      </div>
      <div class="toast-content">
        <strong>{{ toast.title }}</strong>
        <small>{{ toast.message }}</small>
      </div>
    </div>
  </Transition>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useUserStore } from '../stores/userStore'

library.add(faInfoCircle)

export default {
  name: 'LoginView',

  components: { FontAwesomeIcon },

  data() {
    return {
      email: '',
      password: '',
      toast: { visible: false, title: '', message: '', timeout: null },
    }
  },

  methods: {
    async handleLogin() {
      if (!this.email || !this.password) {
        this.showToast('Missing fields', 'Please fill in both email and password.', 3000)
        return
      }

      const store = useUserStore()

      try {
        // store.login calls POST /users/login via auth.services.js,
        // then GET /users/:id to populate currentUser
        await store.login(this.email, this.password)

        this.showToast('Login successful', 'Welcome back!', 2000)

        // Debug: log role and route immediately to avoid timing issues
        console.log('Logged in role:', store.role)
        if (store.role === 'admin') {
          this.$router.push('/adminpanel')
        } else {
          this.$router.push('/habitsmanager')
        }
      } catch (err) {
        // 401 → invalid credentials; anything else → generic message
        const msg =
          err.status === 401
            ? 'Invalid email or password.'
            : err.message || 'Something went wrong. Please try again.'
        this.showToast('Login failed', msg, 3500)
      }
    },

    showToast(title, message, duration = 3000) {
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
