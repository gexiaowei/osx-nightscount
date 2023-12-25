import axios from 'axios'
import store from './store'

const request = axios.create()

request.interceptors.request.use(function (config) {
  let baseUrl = store.get('server.url')
  const apiSecret = store.get('server.secret')
  const token = store.get('server.token')
  const proxy = store.get('proxy')
  if (!baseUrl) {
    // baseUrl = 'https://nightscout-gexiaowei.herokuapp.com'
    throw new Error('未设置Nightscout服务器地址')
  } else {
    if (!baseUrl.startsWith('https://')) {
      baseUrl = 'https://' + baseUrl
    }
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.substr(0, baseUrl.length - 1)
    }
    if (proxy && proxy.enable) {
      config.proxy = {
        protocol: proxy.protocol,
        host: proxy.host,
        port: proxy.port
      }
    }
  }
  config.baseURL = `${baseUrl}/api/v1/`
  config.headers = {
    'api-secret': apiSecret,
    accept: 'application/json'
  }
  config.params = {
    ...config.params,
    token
  }
  return config
}, function (error) {
  return Promise.reject(error)
})
export default request
