import axios from 'axios'
import store from './store'

const request = axios.create()

request.interceptors.request.use(function (config) {
  let baseUrl = store.get('server.url')
  if (!baseUrl) {
    throw new Error('未设置Nightscount服务器地址')
  } else {
    if (!baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.substr(0, baseUrl.length - 1)
    }
  }
  config.baseURL = `${baseUrl}/api/v1/`
  return config
}, function (error) {
  return Promise.reject(error)
})
export default request
