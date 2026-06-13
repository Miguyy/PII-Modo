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

      <button id="login_btn" @click.prevent="handleLogin" style="font-weight: bold; font-size: 18px">Login</button>

      <p class="login-forgot mt-2 mb-0" style="text-align: center; font-size: 14px;">
        <a href="#" @click.prevent="openForgotModal" style="color: #355d4c; text-decoration: none; font-weight: 600;">
          Forgot Password?
        </a>
      </p>

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

  <!-- Forgot Password Modal -->
  <div v-if="showForgotModal" class="custom-modal-backdrop">
    <div class="modal-panel">
      <div v-if="forgotStep === 1">
        <h5 style="color: #355d4c; font-weight: bold;">Reset Password</h5>
        <p class="text-muted small mb-3">Enter your email address to receive a reset token via WebSockets.</p>
        <input v-model="forgotEmail" type="email" placeholder="Your email address" class="forgot-input mb-3" />
        <div class="d-flex justify-content-end gap-2" style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn-cancel" @click="closeForgotModal">Cancel</button>
          <button class="btn-submit" @click="sendForgotEmail" :disabled="!forgotEmail || isForgotLoading">
            {{ isForgotLoading ? 'Sending...' : 'Send Link' }}
          </button>
        </div>
      </div>
      
      <div v-else-if="forgotStep === 2">
        <h5 style="color: #355d4c; font-weight: bold;">Reset Password</h5>
        <p class="text-muted small mb-3">A reset token has been issued. Enter it below along with your new password.</p>
        <input v-model="forgotToken" type="text" placeholder="Reset Token" class="forgot-input mb-2" />
        <input v-model="newPassword" type="password" placeholder="New Password" class="forgot-input mb-3" />
        <div class="d-flex justify-content-end gap-2" style="display: flex; gap: 8px; justify-content: flex-end;">
          <button class="btn-cancel" @click="closeForgotModal">Cancel</button>
          <button class="btn-submit" @click="resetPassword" :disabled="!forgotToken || !newPassword || isForgotLoading">
            {{ isForgotLoading ? 'Resetting...' : 'Reset Password' }}
          </button>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { library } from '@fortawesome/fontawesome-svg-core'
import { faInfoCircle } from '@fortawesome/free-solid-svg-icons'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { useUserStore } from '../stores/userStore'
import { io } from 'socket.io-client'

library.add(faInfoCircle)

export default {
  name: 'LoginView',

  components: { FontAwesomeIcon },

  data() {
    return {
      email: '',
      password: '',
      toast: { visible: false, title: '', message: '', timeout: null },
      
      // Forgot Password State
      showForgotModal: false,
      forgotStep: 1,
      forgotEmail: '',
      forgotToken: '',
      newPassword: '',
      isForgotLoading: false,
      socket: null,
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

    // WebSocket Forgot Password Logic
    openForgotModal() {
      this.showForgotModal = true
      this.forgotStep = 1
      this.forgotEmail = this.email || ''
      this.forgotToken = ''
      this.newPassword = ''
      
      const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
      this.socket = io(backendUrl)
      
      this.socket.on('forgot_password_result', (data) => {
        this.isForgotLoading = false
        if (data.success) {
          this.showToast('Token Issued', data.message, 4000)
          if (data.token) this.forgotToken = data.token // Auto-fill for dev/testing
          this.forgotStep = 2
        } else {
          this.showToast('Error', data.message, 4000)
        }
      })
      
      this.socket.on('reset_password_result', (data) => {
        this.isForgotLoading = false
        if (data.success) {
          this.showToast('Success', data.message, 4000)
          this.closeForgotModal()
        } else {
          this.showToast('Error', data.message, 4000)
        }
      })
    },

    closeForgotModal() {
      this.showForgotModal = false
      if (this.socket) {
        this.socket.disconnect()
        this.socket = null
      }
    },

    sendForgotEmail() {
      if (!this.forgotEmail) return
      this.isForgotLoading = true
      this.socket.emit('forgot_password', { email: this.forgotEmail })
    },

    resetPassword() {
      if (!this.forgotToken || !this.newPassword) return
      this.isForgotLoading = true
      this.socket.emit('reset_password', { token: this.forgotToken, password: this.newPassword })
    }
  },
}
</script>

<style scoped>
.custom-modal-backdrop {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.45);
  backdrop-filter: blur(4px);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 1050;
}
.modal-panel {
  background: #ffffff;
  border-radius: 12px;
  padding: 1.75rem;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.15);
  max-width: 400px;
  width: 90%;
  animation: modalFadeIn 0.2s cubic-bezier(0.16, 1, 0.3, 1);
}
@keyframes modalFadeIn {
  from { transform: scale(0.96); opacity: 0; }
  to { transform: scale(1); opacity: 1; }
}
.forgot-input {
  width: 100%;
  padding: 10px 14px;
  border-radius: 8px;
  border: 1px solid #d1d5db;
  font-size: 14px;
  margin-bottom: 12px;
  box-sizing: border-box;
}
.forgot-input:focus {
  outline: none;
  border-color: #355d4c;
  box-shadow: 0 0 0 2px rgba(53, 93, 76, 0.2);
}
.btn-submit {
  background-color: #355d4c;
  color: white;
  border: none;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}
.btn-submit:disabled {
  opacity: 0.6;
  cursor: not-allowed;
}
.btn-cancel {
  background-color: transparent;
  color: #6b7280;
  border: 1px solid #d1d5db;
  padding: 8px 16px;
  border-radius: 8px;
  font-weight: 600;
  cursor: pointer;
  font-size: 14px;
}
</style>
