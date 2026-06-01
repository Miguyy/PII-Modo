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

      <button @click="handleRegister" style="font-weight: bold; font-size: 18px">Sign Up</button>

      <p class="register-login">
        Already have an account?

        <a
          href="/login"
          style="text-decoration: none; font-family: Heebo; font-weight: bold; color: #f19640"
          >Login</a
        >
      </p>
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
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { createUser } from '../api/services/users.services'
import { login } from '../api/services/auth.services'
import { useUserStore } from '../stores/userStore'

library.add(faInfoCircle)

export default {
  name: 'RegisterView',

  components: { FontAwesomeIcon },

  data() {
    return {
      name: '',
      email: '',
      password: '',
      toast: { visible: false, title: '', message: '', timeout: null },
    }
  },

  methods: {
    async handleRegister() {
      if (!this.name || !this.email || !this.password) {
        this.showToast('Missing fields', 'Please fill in all fields.', 3000)
        return
      }

      // Client-side validation mirrors the backend validateCreateUser middleware:
      // 12–15 chars, uppercase, lowercase, digit, special character
      const pwdErrors = this.validatePassword(this.password)
      if (pwdErrors.length) {
        this.showToast('Weak password', pwdErrors[0], 4500)
        return
      }

      try {
        // POST /users — body matches what validateCreateUser + createUser expect:
        //   nome, email, password, tipo_utilizador
        // The controller hashes the password and returns a JWT on success.
        const data = await createUser(
          {
            nome: this.name,
            email: this.email,
            password: this.password,
            tipo_utilizador: 'client',
          },
          null, // no admin token — requires a public register route on the backend
        )

        // After successful registration, send user to login instead
        // of auto-signing them in. Backend may return a token in dev,
        // but we avoid using it here to require explicit login.
        this.showToast('Account created', 'Please log in to continue.', 2500)
        this.name = ''
        this.email = ''
        this.password = ''

        setTimeout(() => this.$router.push('/login'), 1500)
      } catch (err) {
        // Surface field-level errors returned by validateCreateUser (400)
        // or the conflict error for duplicate email (409)
        const fieldErrors = err.errors || {}
        const firstField = Object.values(fieldErrors)[0]
        const msg =
          (Array.isArray(firstField) ? firstField[0] : firstField) ||
          err.message ||
          'Registration failed. Please try again.'
        this.showToast('Registration failed', msg, 4000)
      }
    },

    // Mirrors the exact rules in validateCreateUser middleware
    validatePassword(pw) {
      const errors = []
      if (pw.length < 12 || pw.length > 15)
        errors.push('Password must be between 12 and 15 characters.')
      if (!/[A-Z]/.test(pw)) errors.push('Password must contain at least one uppercase letter.')
      if (!/[a-z]/.test(pw)) errors.push('Password must contain at least one lowercase letter.')
      if (!/[0-9]/.test(pw)) errors.push('Password must contain at least one digit.')
      if (!/[!@#$%^&*(),.?":{}|<>]/.test(pw))
        errors.push('Password must contain at least one special character.')
      return errors
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
