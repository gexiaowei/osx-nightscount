const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/pages/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Entries Page',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    preference: {
      entry: 'src/pages/preference.js',
      template: 'public/preference.html',
      filename: 'preference.html',
      title: '偏好设置',
      chunks: ['preference-chunk-vendors', 'preference-chunk-common', 'preference']
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true,
      builderOptions: {
        appId: 'com.cos66.cgm_monitor',
        productName: 'CGM Monitor',
        mac: {
          icon: 'build/icons/icon.icns'
        }
      }
    }
  }
})
