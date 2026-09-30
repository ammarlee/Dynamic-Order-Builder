import { createApp } from 'vue'
import PrimeVue from 'primevue/config'
import { orderTheme } from './theme'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'
import ConfirmationService from 'primevue/confirmationservice'
import App from './App.vue'
import router from './router'
import 'primeicons/primeicons.css'
import './assets/main.css'

const app = createApp(App)

app.use(router)
app.use(PrimeVue, {
  theme: {
    preset: orderTheme,
    options: {
      darkModeSelector: '.app-dark',
    },
  },
})
app.use(ToastService)
app.directive('tooltip', Tooltip)
app.use(ConfirmationService)

app.mount('#app')
