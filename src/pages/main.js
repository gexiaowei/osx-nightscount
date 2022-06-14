import Vue from 'vue'
import VueMoment from 'vue-moment'
import App from './App.vue'

import 'bootstrap-4-grid/scss/grid.scss'
import '@/styles/app.scss'

Vue.use(VueMoment)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
