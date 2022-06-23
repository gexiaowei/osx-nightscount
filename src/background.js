'use strict'

import { app, protocol, Menu, BrowserWindow, ipcMain, nativeTheme, shell, globalShortcut } from 'electron'
import { menubar } from 'menubar'
import moment from 'moment'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
import { getEntries } from '@/api/entries'
import store from '@/utils/store'
import { getUnitLabel, sgvToUnitString } from '@/utils/blood'
import libre from '@/utils/libre'
import logger from '@/utils/log'
import { DEFAULT_VALUE } from '@/config'
// import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const KEY_MAP = {
  '⌘': 'CommandOrControl',
  '⇧': 'Shift',
  '⌃': 'Control',
  '⌥': 'Alt'
}
const isDevelopment = process.env.NODE_ENV !== 'production'
let value = store.get('value') || { ...DEFAULT_VALUE }

const config = store.get('config')
const server = store.get('server')
let interval_id
let mb, preference_win, libre_batch_upload_win

const entries = {}

createMenu()

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
  // if (isDevelopment && !process.env.IS_TEST) {
  //   // Install Vue Devtools
  //   try {
  //     await installExtension(VUEJS_DEVTOOLS)
  //   } catch (e) {
  //     logger.error('Vue Devtools failed to install:', e.toString())
  //   }
  // }

  initEvent()
  registerShortcut(store.get('shortcut'))
  await createTray()
  app.dock.hide()
  if (config) {
    nativeTheme.themeSource = config.theme
  }
  startLoop().then(() => {
    logger.info('成功获取远程数据')
  })
})

app.on('will-quit', () => {
  globalShortcut.unregisterAll()
})

async function createPreferenceWindow () {
  if (!preference_win) {
    preference_win = new BrowserWindow({
      width: 580,
      height: 420,
      resizable: false,
      minimizable: false,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      await preference_win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'preference.html')
      // if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      preference_win.loadURL('app://./preference.html')
    }

    preference_win.on('closed', () => {
      preference_win = null
    })
  }
  return preference_win
}

async function createLibreBatchUploadWindow () {
  if (!preference_win) {
    return
  }
  if (!libre_batch_upload_win) {
    libre_batch_upload_win = new BrowserWindow({
      width: 300,
      height: 360,
      resizable: false,
      minimizable: false,
      parent: preference_win,
      modal: true,
      webPreferences: {
        nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
        contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
      }
    })

    if (process.env.WEBPACK_DEV_SERVER_URL) {
      await libre_batch_upload_win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'libre.html')
      // if (!process.env.IS_TEST) win.webContents.openDevTools()
    } else {
      createProtocol('app')
      libre_batch_upload_win.loadURL('app://./libre.html')
    }

    libre_batch_upload_win.on('closed', () => {
      libre_batch_upload_win = null
    })
  }
  return libre_batch_upload_win
}

function registerShortcut (shortcut) {
  globalShortcut.unregisterAll()
  if (shortcut) {
    if (shortcut.toggle) {
      const keys = shortcut.toggle.split('+')

      globalShortcut.register(keys.map(item => KEY_MAP[item] || item).join('+'), () => {
        if (mb) {
          if (mb.window.isVisible()) {
            mb.window.hide()
          } else {
            mb.window.show()
          }
        }
      })
    }
  }
}

function createTray () {
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
            label: '偏好设置',
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
      // mb.window.webContents.openDevTools()
      resolve(mb)
    })
  })
}

function createMenu () {
  const template = [
    {
      label: app.name,
      submenu: [
        {
          label: 'About CGM Monitor',
          role: 'about'
        },
        { type: 'separator' },
        {
          label: 'Preference',
          accelerator: 'CommandOrControl+;',
          click: async () => {
            await createPreferenceWindow()
          }
        },
        { type: 'separator' },
        {
          label: 'Quit CGM Monitor',
          role: 'quit'
        }
      ]
    },
    {
      label: 'Edit',
      submenu: [
        { role: 'undo' },
        { role: 'redo' },
        { type: 'separator' },
        { role: 'cut' },
        { role: 'copy' },
        { role: 'paste' }
      ]
    },
    {
      label: 'View',
      submenu: [
        { role: 'reload' },
        { role: 'forceReload' }
      ]
    },
    {
      role: 'help',
      submenu: [
        {
          label: 'Learn More',
          click: async () => {
            await shell.openExternal('https://github.com/gexiaowei/osx-nightscount')
          }
        },
        server && server.url
          ? {
              label: 'Nightscount',
              click: async () => {
                await shell.openExternal(server.url)
              }
            }
          : null
      ]
    }
  ]

  const menu = Menu.buildFromTemplate(template)
  Menu.setApplicationMenu(menu)
}

function setTrayInformation () {
  const currentDate = moment().format('YYYY-MM-DD')
  const latestEntries = entries[currentDate]
  if (latestEntries && latestEntries.length && mb) {
    const {
      sgv,
      date
    } = latestEntries[0]
    mb.tray.setTitle(` ${sgvToUnitString(sgv, value.unit)} ${getUnitLabel(value.unit)}`)
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
  return data
}

async function getCurrentUpdateEntries () {
  const currentDate = moment().format('YYYY-MM-DD')
  if (entries[currentDate] && entries[currentDate].length) {
    const { data } = await getEntries({
      'find[date][$gt]': entries[currentDate][0].date
    })
    if (data.length) {
      entries[currentDate] = [...data, ...entries[currentDate]]
      libre.uploadData(data)
    }
  } else {
    await getDateEntries()
  }
  updateEntries()
}

function updateEntries () {
  setTrayInformation()
  const currentDate = moment().format('YYYY-MM-DD')
  mb.window && mb.window.webContents.send('entries-update', entries[currentDate])
}

function initEvent () {
  ipcMain.handle('entries-refresh', () => {
    return entries[moment().format('YYYY-MM-DD')]
  })

  ipcMain.handle('entries-request', async (event, date) => {
    if (moment(date).isSame(moment(), 'day')) {
      startLoop()
    } else {
      stopLoop()
    }

    const data = entries[moment(date).format('YYYY-MM-DD')]
    if (!data || !data.length) {
      return await getDateEntries(date)
    } else {
      return data
    }
  })

  ipcMain.handle('set-setting', (event, setting) => {
    if (setting) {
      try {
        store.set(setting.key, setting.value)
        if (setting.key === 'value') {
          value = setting.value
        }
        if (setting.key === 'server') {
          restartLoop().then(() => {
            logger.info('重设服务器，获取数据成功')
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

        if (setting.key === 'shortcut') {
          registerShortcut(setting.value)
        }
      } catch (e) {
        store.delete(setting.key)
        logger.info('设置失败', setting)
      } finally {
        mb && mb.window.webContents.send('setting-updated')
      }
    }
  })

  ipcMain.handle('test-libre', async (event, data) => {
    const {
      user,
      password,
      device_id
    } = data
    return await libre.getAuth(user, password, device_id)
  })

  ipcMain.handle('batch-upload-libre', async () => {
    await createLibreBatchUploadWindow()
  })
  ipcMain.handle('batch-upload-libre-run', async (event, data) => {
    return await libre.transferData(data.start, data.end)
  })
  ipcMain.handle('batch-upload-libre-close', async () => {
    libre_batch_upload_win.close()
  })
}

async function startLoop () {
  if (interval_id) {
    return
  }
  try {
    interval_id = setInterval(async () => {
      try {
        await getCurrentUpdateEntries()
      } catch (e) {
        logger.error('获取数据失败')
      }
    }, 30 * 1000)
    await getCurrentUpdateEntries()
  } catch (e) {
    logger.info('初始化数据失败')
  }
}

async function restartLoop () {
  stopLoop()
  startLoop().then(() => {
    logger.info('重设服务器，获取数据成功')
  })
}

function stopLoop () {
  interval_id && clearInterval(interval_id)
  interval_id = null
}
