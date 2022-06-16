import request from '@/utils/request'

export function getTreatments (params) {
  return request.get('/treatments', {
    params: {
      ...params,
      count: 10
    }
  })
}
