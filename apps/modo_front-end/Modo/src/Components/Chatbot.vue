<template>
  <div class="chatbot-wrapper">
    <!-- Floating Toggle Button -->
    <button
      class="chatbot-fab"
      :class="{ 'is-open': isOpen }"
      @click="toggleChat"
      aria-label="Modo Virtual Assistant"
    >
      <span class="fab-icon fab-icon--chat">
        <FontAwesomeIcon icon="robot" style="font-size: 22px" />
      </span>
      <span class="fab-icon fab-icon--close">
        <FontAwesomeIcon icon="xmark" style="font-size: 24px" />
      </span>
      <span v-if="unreadCount > 0 && !isOpen" class="fab-badge">{{ unreadCount }}</span>
    </button>

    <!-- Chat Panel -->
    <Transition name="panel">
      <div v-if="isOpen" class="chatbot-panel" role="dialog" aria-label="Modo Assistant">
        <!-- Header -->
        <div class="panel-header">
          <div class="assistant-identity">
            <div class="assistant-avatar">
              <span>M</span>
              <span class="status-dot"></span>
            </div>
            <div class="assistant-info">
              <p class="assistant-name">Modo Assistant</p>
              <p class="assistant-status">Online · IA powered by IAedu</p>
            </div>
          </div>
          <button class="btn-clear" @click="clearChat" title="Limpar conversa">
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
            >
              <path d="M3 6H5H21" stroke="currentColor" stroke-width="2" stroke-linecap="round" />
              <path
                d="M8 6V4C8 3.46957 8.21071 2.96086 8.58579 2.58579C8.96086 2.21071 9.46957 2 10 2H14C14.5304 2 15.0391 2.21071 15.4142 2.58579C15.7893 2.96086 16 3.46957 16 4V6M19 6L18.1327 19.1425C18.0579 20.1891 17.187 21 16.1378 21H7.86224C6.81296 21 5.94208 20.1891 5.86732 19.1425L5 6H19Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>

        <!-- Messages -->
        <div class="panel-messages" ref="messagesContainer">
          <!-- Welcome message -->
          <div v-if="messages.length === 0" class="welcome-block">
            <div class="welcome-orb"></div>
            <p class="welcome-title">Hey! I'm your Modo Assistent! 👋</p>
            <p class="welcome-subtitle">
              I can help you understand how to earn points, complete tasks, and make the most out of
              Modo.
            </p>
            <div class="quick-prompts">
              <button
                v-for="prompt in quickPrompts"
                :key="prompt"
                class="quick-prompt-btn"
                @click="sendQuickPrompt(prompt)"
              >
                {{ prompt }}
              </button>
            </div>
          </div>

          <!-- Message list -->
          <TransitionGroup name="message" tag="div" class="messages-list">
            <div
              v-for="msg in messages"
              :key="msg.id"
              class="message-row"
              :class="msg.role === 'user' ? 'message-row--user' : 'message-row--assistant'"
            >
              <div v-if="msg.role === 'assistant'" class="msg-avatar">M</div>
              <div
                class="message-bubble"
                :class="msg.role === 'user' ? 'bubble--user' : 'bubble--assistant'"
              >
                <p class="bubble-text" v-html="formatMessage(msg.content)"></p>
                <span class="bubble-time">{{ formatTime(msg.timestamp) }}</span>
              </div>
            </div>
          </TransitionGroup>

          <!-- Typing indicator -->
          <Transition name="fade">
            <div v-if="isLoading" class="message-row message-row--assistant">
              <div class="msg-avatar">M</div>
              <div class="message-bubble bubble--assistant bubble--typing">
                <span class="dot"></span>
                <span class="dot"></span>
                <span class="dot"></span>
              </div>
            </div>
          </Transition>
        </div>

        <!-- Error banner -->
        <Transition name="fade">
          <div v-if="error" class="error-banner">
            <span>⚠ {{ error }}</span>
            <button @click="error = null">×</button>
          </div>
        </Transition>

        <!-- Input -->
        <div class="panel-input">
          <textarea
            ref="inputRef"
            v-model="userInput"
            class="chat-textarea"
            placeholder="Write your message..."
            rows="1"
            :disabled="isLoading"
            @keydown.enter.exact.prevent="sendMessage"
            @input="autoResize"
          ></textarea>
          <button
            class="send-btn"
            :disabled="!userInput.trim() || isLoading"
            @click="sendMessage"
            aria-label="Send message"
          >
            <svg
              viewBox="0 0 24 24"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
              width="18"
              height="18"
            >
              <path
                d="M22 2L11 13"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
              <path
                d="M22 2L15 22L11 13L2 9L22 2Z"
                stroke="currentColor"
                stroke-width="2"
                stroke-linecap="round"
                stroke-linejoin="round"
              />
            </svg>
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script>
import { sendChatMessage } from '@/api/chatbotApi.js'
import { projectInfo } from '@/data/projectInfo.js'
import { useUserStore } from '@/stores/userStore.js'

export default {
  name: 'ChatbotComponent',

  data() {
    return {
      isOpen: false,
      messages: [], // { id, role: 'user'|'assistant', content, timestamp }
      userInput: '',
      isLoading: false,
      error: null,
      unreadCount: 0,

      // A stable thread ID for this chat session.
      // The IAedu agent uses this to maintain conversation memory across turns.
      // Resetting it (clearChat) starts a brand new conversation thread.
      threadId: crypto.randomUUID(),

      quickPrompts: [
        'How can I get points? 🎯',
        'What kind of tasks exist? 📝',
        'How does the leveling system work? 🚀',
        'How can I level up?',
      ],
    }
  },

  computed: {
    userStore() {
      return useUserStore()
    },

    /**
     * user_info → who the current user is.
     * Sent on every request so the agent can personalise answers.
     */
    userInfo() {
      const u = this.userStore
      return {
        username: u?.username ?? 'Desconhecido',
        pontos: u?.pontos ?? 0,
        nivel: Math.floor((u?.pontos ?? 0) / 100),
        role: u?.role ?? 'user',
      }
    },

    /**
     * user_context → the full Modo project knowledge base.
     * The agent uses this to answer domain-specific questions correctly
     * instead of hallucinating generic answers.
     */
    userContext() {
      return {
        instrucoes: [
          'Answer ALWAYS in English. If the users asks something in Portuguese, answer in Portuguese. If the user asks something in another language, answer in English.',
          'Be direct and concise. Keep answers short and to the point.',
          'Use emojis in your answers to make them more engaging and friendly and with moderation in mind.',
          'Do not create something that is not in the project info. If you do not know the answer, say you do not know.',
        ],
        projeto: projectInfo,
      }
    },
  },

  methods: {
    toggleChat() {
      this.isOpen = !this.isOpen
      if (this.isOpen) {
        this.unreadCount = 0
        this.$nextTick(() => this.scrollToBottom())
      }
    },

    async sendMessage() {
      const text = this.userInput.trim()
      if (!text || this.isLoading) return

      this.appendMessage('user', text)
      this.userInput = ''
      this.$nextTick(() => {
        if (this.$refs.inputRef) this.$refs.inputRef.style.height = 'auto'
        this.scrollToBottom()
      })

      this.isLoading = true
      this.error = null

      try {
        const isFirstMessage = this.messages.length === 1

        const reply = await sendChatMessage(
          text,
          this.threadId,
          this.userInfo,
          this.userContext,
          isFirstMessage,
        )
        this.appendMessage('assistant', reply)
        if (!this.isOpen) this.unreadCount++
      } catch (err) {
        console.error('[Chatbot] Error:', err)
        this.error = 'Ocorreu um erro ao contactar o assistente. Tenta novamente.'
      } finally {
        this.isLoading = false
        this.$nextTick(() => this.scrollToBottom())
      }
    },

    sendQuickPrompt(prompt) {
      this.userInput = prompt
      this.sendMessage()
    },

    appendMessage(role, content) {
      this.messages.push({
        id: Date.now() + Math.random(),
        role,
        content,
        timestamp: new Date(),
      })
    },

    clearChat() {
      this.messages = []
      this.error = null
      // Reset thread so the agent forgets the previous conversation
      this.threadId = crypto.randomUUID()
    },

    scrollToBottom() {
      const el = this.$refs.messagesContainer
      if (el) el.scrollTop = el.scrollHeight
    },

    autoResize(e) {
      const el = e.target
      el.style.height = 'auto'
      el.style.height = Math.min(el.scrollHeight, 120) + 'px'
    },

    formatTime(date) {
      return new Date(date).toLocaleTimeString('pt-PT', { hour: '2-digit', minute: '2-digit' })
    },

    /** Converts **bold** markdown and newlines to HTML */
    formatMessage(text) {
      return text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>').replace(/\n/g, '<br>')
    },
  },
}
</script>

<style lang="scss" scoped>
/* ─── Design Tokens (Mapped to Modo Theme) ───────────────────────── */
$bg-panel:       var(--card);
$bg-header:      var(--primary-color);
$bg-input:       var(--primary-color);
$bg-bubble-bot:  var(--green-light);
$bg-bubble-user: var(--bg-surface);
$accent:         var(--orange);
$accent-glow:    rgba(241, 150, 64, 0.2);
$text-primary:   #ffffff;
$text-muted:     rgba(255, 255, 255, 0.8);
$border:         rgba(255, 255, 255, 0.15);
$radius-panel:   18px;
$radius-bubble:  14px;
$shadow-panel:   0 16px 40px rgba(0, 0, 0, 0.15), 0 0 0 1px $border;

/* ─── Wrapper ────────────────────────────────────────────────── */
.chatbot-wrapper {
  position: fixed;
  bottom: 130px;
  right: 32px;
  z-index: 9999;
  font-family: 'Segoe UI', system-ui, sans-serif;
}

/* ─── FAB ────────────────────────────────────────────────────── */
.chatbot-fab {
  position: relative;
  width: 50px;
  height: 50px;
  border-radius: 50%;
  border: none;
  background-color: var(--primary-color);
  color: var(--bg-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition:
    transform 0.2s ease,
    background-color 0.2s ease;

  &:hover {
    transform: scale(1.1);
    filter: brightness(1.1);
  }

  &:active {
    transform: scale(0.96);
  }

  .fab-icon {
    position: absolute;
    transition:
      opacity 0.2s,
      transform 0.2s;
    svg {
      width: 22px;
      height: 22px;
    }
  }

  .fab-icon--close {
    opacity: 0;
    transform: rotate(-90deg);
  }
  .fab-icon--chat {
    opacity: 1;
    transform: rotate(0deg);
  }

  &.is-open {
    .fab-icon--chat {
      opacity: 0;
      transform: rotate(90deg);
    }
    .fab-icon--close {
      opacity: 1;
      transform: rotate(0deg);
    }
  }
}

.fab-badge {
  position: absolute;
  top: -4px;
  right: -4px;
  background: var(--danger);
  color: #fff;
  font-size: 11px;
  font-weight: 700;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  display: flex;
  align-items: center;
  justify-content: center;
  border: 2px solid $bg-panel;
}

/* ─── Panel ──────────────────────────────────────────────────── */
.chatbot-panel {
  position: absolute;
  bottom: 70px;
  right: 0;
  width: 360px;
  max-height: 560px;
  background: $bg-panel;
  border-radius: $radius-panel;
  box-shadow: $shadow-panel;
  display: flex;
  flex-direction: column;
  overflow: hidden;
  border: 1px solid $border;
}

/* ─── Header ─────────────────────────────────────────────────── */
.panel-header {
  background: $bg-header;
  padding: 14px 16px;
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-bottom: 1px solid $border;
  flex-shrink: 0;
}

.assistant-identity {
  display: flex;
  align-items: center;
  gap: 10px;
}

.assistant-avatar {
  position: relative;
  width: 36px;
  height: 36px;
  border-radius: 50%;
  background: $accent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 700;
  font-size: 15px;
  color: var(--bg-surface);

  .status-dot {
    position: absolute;
    bottom: 1px;
    right: 1px;
    width: 9px;
    height: 9px;
    background: var(--success);
    border-radius: 50%;
    border: 2px solid $bg-header;
  }
}

.assistant-name {
  font-size: 14px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 2px;
}

.assistant-status {
  font-size: 11px;
  color: $text-muted;
  margin: 0;
}

.btn-clear {
  background: none;
  border: none;
  color: $text-muted;
  cursor: pointer;
  padding: 6px;
  border-radius: 6px;
  display: flex;
  align-items: center;
  justify-content: center;
  transition: background 0.15s, color 0.15s;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
    color: var(--danger);
  }
}

:global([data-bs-theme="dark"]) .btn-clear:hover {
  background: rgba(255, 255, 255, 0.05);
}

/* ─── Messages Area ──────────────────────────────────────────── */
.panel-messages {
  flex: 1;
  overflow-y: auto;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 4px;
  scroll-behavior: smooth;

  &::-webkit-scrollbar {
    width: 4px;
  }
  &::-webkit-scrollbar-track {
    background: transparent;
  }
  &::-webkit-scrollbar-thumb {
    background: rgba(128, 128, 128, 0.2);
    border-radius: 4px;
  }
}

/* ─── Welcome ────────────────────────────────────────────────── */
.welcome-block {
  display: flex;
  flex-direction: column;
  align-items: center;
  text-align: center;
  padding: 20px 8px 12px;
  gap: 8px;
}

.welcome-orb {
  width: 52px;
  height: 52px;
  border-radius: 50%;
  background: $accent;
  box-shadow: 0 0 30px $accent-glow;
  margin-bottom: 4px;
}

.welcome-title {
  font-size: 16px;
  font-weight: 600;
  color: $text-primary;
  margin: 0 0 6px;
}

.welcome-subtitle {
  font-size: 13px;
  color: $text-muted;
  margin: 0;
  line-height: 1.5;
}

.quick-prompts {
  display: flex;
  flex-wrap: wrap;
  gap: 6px;
  justify-content: center;
  margin-top: 8px;
}

.quick-prompt-btn {
  background: rgba(255, 255, 255, 0.1);
  border: 1px solid rgba(255, 255, 255, 0.3);
  color: #fff;
  font-size: 12px;
  padding: 6px 12px;
  border-radius: 20px;
  cursor: pointer;
  transition: background 0.15s, border-color 0.15s;

  &:hover {
    background: rgba(255, 255, 255, 0.2);
    border-color: #fff;
  }
}

/* ─── Messages ───────────────────────────────────────────────── */
.messages-list {
  display: flex;
  flex-direction: column;
  gap: 10px;
}

.message-row {
  display: flex;
  align-items: flex-end;
  gap: 8px;

  &--user {
    flex-direction: row-reverse;
  }
}

.msg-avatar {
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: $accent;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 12px;
  font-weight: 700;
  color: var(--bg-surface);
  flex-shrink: 0;
}

.message-bubble {
  max-width: 78%;
  padding: 10px 13px;
  border-radius: $radius-bubble;
  position: relative;
}

.bubble--assistant {
  background: $bg-bubble-bot;
  border-bottom-left-radius: 4px;
  border: 1px solid $border;
  
  .bubble-text {
    color: var(--text-main);
  }
}

.bubble--user {
  background: $bg-bubble-user;
  border-bottom-right-radius: 4px;
  
  .bubble-text {
    color: var(--primary-color);
  }
  .bubble-time {
    color: rgba(0, 0, 0, 0.5);
  }
}

.bubble-text {
  font-size: 13.5px;
  line-height: 1.55;
  color: $text-primary;
  margin: 0 0 4px;
  word-break: break-word;
}

.bubble-time {
  font-size: 10px;
  color: $text-muted;
  display: block;
  text-align: right;
  opacity: 0.8;
}

/* ─── Typing Indicator ───────────────────────────────────────── */
.bubble--typing {
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 12px 16px;

  .dot {
    width: 7px;
    height: 7px;
    border-radius: 50%;
    background: $text-muted;
    animation: typing-bounce 1.2s infinite ease-in-out;

    &:nth-child(2) {
      animation-delay: 0.2s;
    }
    &:nth-child(3) {
      animation-delay: 0.4s;
    }
  }
}

@keyframes typing-bounce {
  0%,
  60%,
  100% {
    transform: translateY(0);
    opacity: 0.4;
  }
  30% {
    transform: translateY(-5px);
    opacity: 1;
  }
}

/* ─── Error Banner ───────────────────────────────────────────── */
.error-banner {
  margin: 0 12px 6px;
  padding: 8px 12px;
  background: rgba(var(--danger-rgb), 0.1);
  border: 1px solid var(--danger);
  border-radius: 8px;
  font-size: 12px;
  color: var(--danger);
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 8px;

  button {
    background: none;
    border: none;
    color: var(--danger);
    font-size: 16px;
    cursor: pointer;
    line-height: 1;
  }
}

/* ─── Input Area ─────────────────────────────────────────────── */
.panel-input {
  padding: 12px;
  border-top: 1px solid $border;
  display: flex;
  align-items: flex-end;
  gap: 8px;
  background: $bg-input;
  flex-shrink: 0;
}

.chat-textarea {
  flex: 1;
  background: var(--bg-surface);
  border: 1px solid $border;
  border-radius: 12px;
  color: #1e1e1e;
  font-size: 13.5px;
  padding: 9px 13px;
  resize: none;
  outline: none;
  line-height: 1.5;
  max-height: 120px;
  transition: border-color 0.2s;
  font-family: inherit;

  &::placeholder { color: rgba(0, 0, 0, 0.5); }

  &:focus { border-color: $accent; }

  &:disabled { opacity: 0.5; cursor: not-allowed; }
}

.send-btn {
  width: 38px;
  height: 38px;
  border-radius: 50%;
  border: none;
  background: $accent;
  color: var(--bg-surface);
  cursor: pointer;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  transition: opacity 0.15s, filter 0.15s, transform 0.1s;

  &:hover:not(:disabled) {
    filter: brightness(1.1);
    transform: scale(1.05);
  }

  &:disabled {
    opacity: 0.35;
    cursor: not-allowed;
  }
}

/* ─── Transitions ────────────────────────────────────────────── */
.panel-enter-active {
  animation: panel-in 0.25s cubic-bezier(0.34, 1.56, 0.64, 1);
}
.panel-leave-active {
  animation: panel-in 0.18s ease-in reverse;
}

@keyframes panel-in {
  from {
    opacity: 0;
    transform: scale(0.92) translateY(12px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
}

.message-enter-active {
  animation: msg-in 0.2s ease-out;
}

@keyframes msg-in {
  from {
    opacity: 0;
    transform: translateY(8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.2s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
