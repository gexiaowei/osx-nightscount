'use strict'

import { app, protocol, Menu, ipcMain } from 'electron'
import { menubar } from 'menubar'
import moment from 'moment'
import { createProtocol } from 'vue-cli-plugin-electron-builder/lib'
import path from 'path'
import Store from 'electron-store'

const store = new Store()

console.log(store.get('unit'))

let mb

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
  createMenu()
})

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
      height: 600,
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

  ipcMain.on('receive-entry', (event, entry) => {
    const {
      sgv,
      date
    } = entry
    mb.tray.setTitle(` ${(sgv * 0.0555).toFixed(1)} mmol/L`)
    mb.tray.setToolTip('更新于:' + moment(date).format('YYYY-MM-DD HH:mm'))
  })
}
