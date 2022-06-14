import Vue from 'vue'
import App from './Preference.vue'

import 'bootstrap-4-grid/scss/grid.scss'
import '@/styles/app.scss'

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
