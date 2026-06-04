import { createApp } from 'vue'
import { createPinia } from 'pinia'
import App from './App.vue'
import router from './router'
import piniaPluginPersistedstate from 'pinia-plugin-persistedstate'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-icons/font/bootstrap-icons.css'
import 'bootstrap'
import './css/styles.css'

/* Font Awesome */
import { library } from '@fortawesome/fontawesome-svg-core'
import { FontAwesomeIcon } from '@fortawesome/vue-fontawesome'
import { faUtensils } from '@fortawesome/free-solid-svg-icons'
import {
  faUser,
  faEnvelope,
  faLock,
  faImage,
  faBell,
  faQuestionCircle,
  faInfoCircle,
  faSignOutAlt,
  faTrash,
  faArrowRight,
  faArrowLeft,
  faPlus,
  faCheck,
  faCheckCircle,
  faClock,
  faPlay,
  faPause,
  faMapPin,
  faChartBar,
  faHourglass,
  faPlusCircle,
  faPenFancy,
  faFlag,
  faList,
  faChartPie,
  faCircleNotch,
  faBars,
  faCircleQuestion,
  faRightFromBracket,
  faTrophy,
  faRecycle,
  faDesktop,
  faListCheck,
  faWater,
  faPersonWalking,
  faBoltLightning,
  faBolt, // ✨ Added: Maps to 'fa-solid fa-bolt'
  faSeedling,
  faStar, // ✨ Added: Maps to 'fa-solid fa-star'
  faDownload,
  faFilePdf,
  faTimesCircle,
  faExclamationTriangle,
  faSun,
  faMoon,
} from '@fortawesome/free-solid-svg-icons'

library.add(
  faUtensils,
  faUser,
  faEnvelope,
  faLock,
  faImage,
  faBell,
  faQuestionCircle,
  faInfoCircle,
  faSignOutAlt,
  faTrash,
  faArrowRight,
  faArrowLeft,
  faPlus,
  faCheck,
  faCheckCircle,
  faClock,
  faPlay,
  faPause,
  faMapPin,
  faChartBar,
  faHourglass,
  faPlusCircle,
  faPenFancy,
  faFlag,
  faList,
  faChartPie,
  faCircleNotch,
  faBars,
  faCircleQuestion,
  faRightFromBracket,
  faTrophy,
  faRecycle,
  faDesktop,
  faListCheck,
  faWater,
  faPersonWalking,
  faBoltLightning,
  faBolt,
  faSeedling,
  faStar,
  faDownload,
  faFilePdf,
  faTimesCircle,
  faExclamationTriangle,
  faSun,
  faMoon,
)

const originalFetch = window.fetch
window.fetch = async (...args) => {
  const res = await originalFetch(...args)
  const url = typeof args[0] === 'string' ? args[0] : args[0]?.url || ''
  const backendUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000'
  
  if (
    res.status === 401 && 
    url.startsWith(backendUrl) && 
    !url.includes('/users/login') && 
    !url.includes('/users/register')
  ) {
    import('@/stores/userStore.js').then(({ useUserStore }) => {
      const userStore = useUserStore()
      userStore.logout()
    })
    import('@/router/index.js').then((module) => {
      const router = module.default
      router.push('/login')
    })
  }
  return res
}

const app = createApp(App)
app.component('FontAwesomeIcon', FontAwesomeIcon)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)

app.mount('#app')
