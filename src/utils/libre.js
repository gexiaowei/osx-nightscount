import moment from 'moment'
import store from '@/utils/store'
import logger from './log'
import { getEntries } from '@/api/entries'
import { auth, transfer } from '@/api/libre'
import { DEFAULT_VALUE } from '@/config'

class Libre {
  constructor () {
    this.token = null
    this.account = null
    this.expire = null
  }

  async getAuth (user, password, device_id) {
    if (
      !this.token ||
      !this.account ||
      this.expire ||
      moment().isAfter(this.expire)
    ) {
      const { UserToken, AccountId } = await auth(
        user,
        password,
        device_id,
        false
      )
      this.token = UserToken
      this.account = AccountId
      this.expire = moment().add(30, 'minutes')
      logger.info('登录Libre服务器成功')
    }
    return {
      token: this.token,
      account: this.account
    }
  }

  async transferData (start_date, end_date) {
    const { data } = await getEntries({
      'find[date][$gte]': moment(start_date)
        .startOf('day')
        .format('x'),
      'find[date][$lte]': moment(end_date)
        .endOf('day')
        .format('x'),
      count: 99999
    })
    return await this.uploadData(data)
  }

  async uploadData (data) {
    const libre = store.get('libre')
    if (libre && libre.enable) {
      await this.uploadToLibreServer(libre, data)
      logger.info('上传到Libre服务器成功')
    }
    return true
  }

  async uploadToLibreServer (libre, data) {
    const value = store.get('value') || { ...DEFAULT_VALUE }
    const { user, password, device_id } = libre
    logger.info(`上传数据大小:${data.length}`)
    await this.getAuth(user, password, device_id)
    await transfer(
      device_id,
      this.token,
      data.map(d => ({
        extendedProperties: {
          highOutOfRange: d.sgv >= value.urgent_high ? 'true' : 'false',
          canMerge: 'true',
          isFirstAfterTimeChange: false,
          factoryTimestamp: d.sysTime,
          lowOutOfRange: d.sgv <= value.urgent_low ? 'true' : 'false'
        },
        recordNumber: parseInt(
          `1${moment(d.dateString).format('YYYYMMDDHHmmss')}`
        ),
        timestamp: d.dateString,
        valueInMgPerDl: d.sgv
      })),
      [],
      []
    )
  }
}

export default new Libre()
