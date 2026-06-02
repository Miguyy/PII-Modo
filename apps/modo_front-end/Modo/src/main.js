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
)

const app = createApp(App)
app.component('FontAwesomeIcon', FontAwesomeIcon)

const pinia = createPinia()
pinia.use(piniaPluginPersistedstate)
app.use(pinia)

app.use(router)

app.mount('#app')
