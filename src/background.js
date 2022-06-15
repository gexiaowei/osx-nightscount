'use strict'

import { app, protocol, Menu, BrowserWindow, ipcMain, nativeTheme } from 'electron'
import { menubar } from 'menubar'
import moment from 'moment'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
import { getEntries } from '@/api/entries'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'
import store from '@/utils/store'
import { getUnitLabel, sgvToUnit } from '@/utils/blood'
import _ from 'lodash'
import { DEFAULT_VALUE } from '@/config'

const isDevelopment = process.env.NODE_ENV !== 'production'

let value = store.get('value', _.cloneDeep(DEFAULT_VALUE))
const config = store.get('config')
if (config) {
  nativeTheme.themeSource = config.theme
}
let mb, win, interval_id
const entries = {}

app.setLoginItemSettings({
  openAsHidden: true
})

protocol.registerSchemesAsPrivileged([
  {
    scheme: 'app',
    privileges: {
      secure: true,
      standard: true
    }
  }
])

app.on('ready', async () => {
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }

  initEvent()
  await createMenu()
  await createPreferenceWindow()
  loop().then(() => {
    console.log('成功获取远程数据')
  })
})

async function createPreferenceWindow () {
  if (!win) {
    win = new BrowserWindow({
      width: 430,
      height: 400,
      resizable: false,
      minimizable: false,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'preference.html')
      if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      win.loadURL('app://./preference.html')
    }

    win.on('closed', function (evt) {
      win = null
    })
  }
  return win
}

function createMenu () {
  return new Promise(resolve => {
    let uri
    if (process.env.WEBPACK_DEV_SERVER_URL) {
      uri = process.env.WEBPACK_DEV_SERVER_URL
    } else {
      createProtocol('app')
      uri = 'app://./index.html'
    }
    mb = menubar({
      index: uri,
      preloadWindow: true,
      icon: path.resolve(__dirname, isDevelopment ? '../public/assets/icons/trayIconTemplate.png' : './assets/icons/trayIconTemplate.png'),
      browserWindow: {
        width: 800,
        height: 700,
        resizable: false,
        webPreferences: {
          nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
          contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
        }
      }
    })

    mb.on('ready', () => {
      mb.tray.on('right-click', () => {
        const contextMenu = Menu.buildFromTemplate([
          {
            label: '设置',
            accelerator: 'CommandOrControl+;',
            click: async () => {
              await createPreferenceWindow()
            }
          },
          {
            label: '退出',
            accelerator: 'CommandOrControl+q',
            click: () => {
              app.quit()
            }
          }
        ])
        mb.tray.popUpContextMenu(contextMenu)
      })
      resolve(mb)
    })
  })
}

function setTrayInformation () {
  const currentDate = moment().format('YYYY-MM-DD')
  const latestEntries = entries[currentDate]
  if (latestEntries && latestEntries.length && mb) {
    const {
      sgv,
      date
    } = latestEntries[0]
    mb.tray.setTitle(` ${sgvToUnit(sgv, value.unit)} ${getUnitLabel(value.unit)}`)
    mb.tray.setToolTip('更新于:' + moment(date).format('YYYY-MM-DD HH:mm'))
  }
}

async function getDateEntries (date) {
  const start = (date ? moment(date) : moment()).startOf('day').format('x')
  const end = (date ? moment(date) : moment()).endOf('day').format('x')
  const { data } = await getEntries({
    'find[date][$gte]': start,
    'find[date][$lte]': end,
    count: 999
  })
  entries[moment(date).format('YYYY-MM-DD')] = data
  updateEntries(data)
}

async function getCurrentUpdateEntries () {
  const currentDate = moment().format('YYYY-MM-DD')
  if (entries[currentDate] && entries[currentDate].length) {
    const { data } = await getEntries({
      'find[date][$gt]': entries[currentDate][0].date
    })
    if (data.length) {
      entries[currentDate] = [...data, ...entries[currentDate]]
      updateEntries(entries[currentDate])
    }
  } else {
    await getDateEntries()
  }
}

function updateEntries (data) {
  setTrayInformation()
  if (data) {
    mb.window && mb.window.webContents.send('entries-update', data)
  } else {
    const currentDate = moment().format('YYYY-MM-DD')
    mb.window && mb.window.webContents.send('entries-update', entries[currentDate])
  }
}

function initEvent () {
  ipcMain.on('entries-refresh', () => {
    updateEntries()
  })

  ipcMain.handle('setSetting', (event, setting) => {
    store.set(setting.key, setting.value)
    if (setting.key === 'value') {
      value = setting.value
      updateEntries()
    }
    if (setting.key === 'server') {
      interval_id && clearInterval(interval_id)
      loop().then(() => {
        console.log('重设服务器，获取数据成功')
      })
    }
    if (setting.key === 'config') {
      const {
        auto,
        theme
      } = setting.value
      app.setLoginItemSettings({
        openAtLogin: auto
      })
      nativeTheme.themeSource = theme
    }
  })
}

async function loop () {
  try {
    await getDateEntries()
  } catch (e) {
    console.log('初始化数据失败', e)
  } finally {
    interval_id = setInterval(async () => {
      try {
        await getCurrentUpdateEntries()
      } catch (e) {
        console.log('获取数据失败', e)
      }
    }, 60 * 1000)
  }
}
