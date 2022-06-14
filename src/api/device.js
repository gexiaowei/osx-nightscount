import request from '@/utils/request'

export function getDeviceStatus () {
  return request.get('/devicestatus/', {
    params: {
      count: 1
    }
  })
}
