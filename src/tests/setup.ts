import { config } from '@vue/test-utils'
import ConfirmationService from 'primevue/confirmationservice'
import PrimeVue from 'primevue/config'
import ToastService from 'primevue/toastservice'
import Tooltip from 'primevue/tooltip'

config.global.plugins = [[PrimeVue, { ripple: false }], ToastService, ConfirmationService]
config.global.directives = { tooltip: Tooltip }
