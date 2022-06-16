import Vue from 'vue'
import App from './Preference.vue'
import {
  Icon,
  Tabs,
  TabPane,
  Form,
  FormItem,
  Input,
  InputNumber,
  Select,
  Option,
  Switch,
  Radio,
  RadioGroup
} from 'element-ui'

import 'element-ui/lib/theme-chalk/index.css'
import 'bootstrap-4-grid/scss/grid.scss'
import '@/styles/preference.scss'
import '@/styles/app.scss'

Vue.prototype.$ELEMENT = {
  size: 'small',
  zIndex: 3000
}
Vue.use(Icon)
Vue.use(Tabs)
Vue.use(TabPane)
Vue.use(Form)
Vue.use(FormItem)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(Select)
Vue.use(Option)
Vue.use(Switch)
Vue.use(Radio)
Vue.use(RadioGroup)

Vue.config.productionTip = false

new Vue({
  render: h => h(App)
}).$mount('#app')
