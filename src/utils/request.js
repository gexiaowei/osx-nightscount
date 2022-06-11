import axios from 'axios'

const request = axios.create({
  baseURL: 'https://nightscout-gexiaowei.herokuapp.com/api/v1/'
})

export default request
