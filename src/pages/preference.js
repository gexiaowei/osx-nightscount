import Vue from 'vue'
import App from './Preference.vue'
import { Tabs, TabPane, Form, FormItem, Input, InputNumber, Select, Option } from 'element-ui'

import 'bootstrap-4-grid/scss/grid.scss'
import '@/styles/app.scss'

Vue.prototype.$ELEMENT = {
  size: 'small',
  zIndex: 3000
}
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Select)
Vue.use(Option)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
