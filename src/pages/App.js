import Vue from 'vue'
import VueMoment from 'vue-moment'
import App from './App.vue'
import VCalendar from 'v-calendar'

import 'bootstrap-4-grid/scss/grid.scss'
import '@/styles/app.scss'
import '@/styles/preference.scss'

import { Popover, Loading } from 'element-ui'

Vue.use(Popover)
Vue.use(Loading)
Vue.use(VCalendar)
Vue.use(VueMoment)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
