import request from '@/utils/request'

export function getEntries (params) {
  return request.get('/entries/sgv', {
    params
  })
}
