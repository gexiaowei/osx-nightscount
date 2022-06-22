import axios from 'axios'

export async function auth (username, password, device, setDevice) {
  const data = {
    DeviceId: device,
    GatewayType: 'FSLibreLink.iOS',
    SetDevice: setDevice,
    UserName: username,
    Domain: 'Libreview',
    Password: password
  }

  console.log(JSON.stringify(data))
  const response = await axios.post('https://api-eu.libreview.io/lsl/api/nisperson/getauthentication', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  console.log(response.data)
  if (response.data.status !== 0) {
    throw new Error('授权失败')
  }
  return response.data.result.UserToken
}

export async function transfer (device, token, glucoseEntries, foodEntries, insulinEntries) {
  const data = {
    UserToken: token,
    GatewayType: 'FSLibreLink.iOS',
    DeviceData: {
      header: {
        device: {
          hardwareDescriptor: 'iPhone14,2',
          osVersion: '15.4.1',
          modelName: 'com.abbott.librelink.de',
          osType: 'iOS',
          uniqueIdentifier: device,
          hardwareName: 'iPhone'
        }
      },
      measurementLog: {
        capabilities: [
          'scheduledContinuousGlucose',
          'unscheduledContinuousGlucose',
          'bloodGlucose',
          'insulin',
          'food',
          'generic-com.abbottdiabetescare.informatics.exercise',
          'generic-com.abbottdiabetescare.informatics.customnote',
          'generic-com.abbottdiabetescare.informatics.ondemandalarm.low',
          'generic-com.abbottdiabetescare.informatics.ondemandalarm.high',
          'generic-com.abbottdiabetescare.informatics.ondemandalarm.projectedlow',
          'generic-com.abbottdiabetescare.informatics.ondemandalarm.projectedhigh',
          'generic-com.abbottdiabetescare.informatics.sensorstart',
          'generic-com.abbottdiabetescare.informatics.error',
          'generic-com.abbottdiabetescare.informatics.isfGlucoseAlarm',
          'generic-com.abbottdiabetescare.informatics.alarmSetting'
        ],
        bloodGlucoseEntries: [],
        genericEntries: [],
        scheduledContinuousGlucoseEntries: glucoseEntries || [],
        insulinEntries: insulinEntries || [],
        foodEntries: foodEntries || [],
        unscheduledContinuousGlucoseEntries: []
      }
    },
    Domain: 'Libreview'
  }

  const response = await axios.post('https://api-eu.libreview.io/lsl/api/measurements', data, {
    headers: {
      'Content-Type': 'application/json'
    }
  })
  console.log('transferLibreView, response', response.data)
  return response.data
}
