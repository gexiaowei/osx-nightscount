'use strict'

import { app, protocol, Menu, BrowserWindow, ipcMain } from 'electron'
import { menubar } from 'menubar'
import moment from 'moment'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
import Store from 'electron-store'
import { getEntries } from '@/api/entries'
import installExtension, { VUEJS_DEVTOOLS } from 'electron-devtools-installer'

const store = new Store()

console.log(store.get('unit'))

let mb, win

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
  const isDevelopment = process.env.NODE_ENV !== 'production'
  if (isDevelopment && !process.env.IS_TEST) {
    // Install Vue Devtools
    try {
      await installExtension(VUEJS_DEVTOOLS)
    } catch (e) {
      console.error('Vue Devtools failed to install:', e.toString())
    }
  }
  await createWindow()
  createMenu()
  ipcMain.on('entries-refresh', () => {
    updateEntries()
  })
  loop().then(() => {
    console.log('成功获取远程数据')
  })
})

async function createWindow () {
  // Create the browser window.
  win = new BrowserWindow({
    width: 350,
    height: 400,
    // resizable: false,
    webPreferences: {

      // Use pluginOptions.nodeIntegration, leave this alone
      // See nklayman.github.io/vue-cli-plugin-electron-builder/guide/security.html#node-integration for more info
      nodeIntegration: process.env.ELECTRON_NODE_INTEGRATION,
      contextIsolation: !process.env.ELECTRON_NODE_INTEGRATION
    }
  })

  if (process.env.WEBPACK_DEV_SERVER_URL) {
    // Load the url of the dev server if in development mode
    console.log(process.env.WEBPACK_DEV_SERVER_URL + '/preference.html')
    await win.loadURL(process.env.WEBPACK_DEV_SERVER_URL + 'preference.html')
    if (!process.env.IS_TEST) win.webContents.openDevTools()
  } else {
    createProtocol('app')
    // Load the index.html when not in development
    win.loadURL('app://./preference.html')
  }
}

function createMenu () {
  let uri
  if (process.env.WEBPACK_DEV_SERVER_URL) {
    uri = process.env.WEBPACK_DEV_SERVER_URL
  } else {
    createProtocol('app')
    uri = 'app://./index.html'
  }
  mb = menubar({
    index: uri,
    icon: path.resolve(__dirname, '../assets/icons/trayIconTemplate.png'),
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
          label: '设置'
        },
        {
          label: '退出',
          click: () => {
            app.quit()
          }
        }
      ])
      mb.tray.popUpContextMenu(contextMenu)
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
    mb.tray.setTitle(` ${(sgv * 0.0555).toFixed(1)} mmol/L`)
    mb.tray.setToolTip('更新于:' + moment(date).format('YYYY-MM-DD HH:mm'))
  }
}

const entries = {}

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
  if (data) {
    setTrayInformation()
    mb.window && mb.window.webContents.send('entries-update', data)
  } else {
    const currentDate = moment().format('YYYY-MM-DD')
    mb.window && mb.window.webContents.send('entries-update', entries[currentDate])
  }
}

async function loop () {
  try {
    await getDateEntries()
  } catch (e) {
    console.log('初始化数据失败', e)
  } finally {
    setInterval(async () => {
      try {
        await getCurrentUpdateEntries()
      } catch (e) {
        console.log('获取数据失败', e)
      }
    }, 60 * 1000)
  }
}
