import Vue from 'vue'
import App from './Libre.vue'
import VCalendar from 'v-calendar'
import {
  Button,
  Message
} from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css'
import 'bootstrap-4-grid/scss/grid.scss'
import '@/styles/preference.scss'
import '@/styles/app.scss'

Vue.prototype.$ELEMENT = {
  size: 'small',
  zIndex: 3000
}
Vue.use(Button)
Vue.use(VCalendar)
Vue.prototype.$message = Message
Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
