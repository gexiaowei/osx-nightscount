const { defineConfig } = require('@vue/cli-service')

module.exports = defineConfig({
  transpileDependencies: true,
  pages: {
    index: {
      entry: 'src/pages/main.js',
      template: 'public/index.html',
      filename: 'index.html',
      title: 'Index Page',
      chunks: ['chunk-vendors', 'chunk-common', 'index']
    },
    preference: {
      entry: 'src/pages/preference.js',
      template: 'public/preference.html',
      filename: 'preference.html',
      title: 'Preference Page',
      chunks: ['preference-chunk-vendors', 'preference-chunk-common', 'preference']
    }
  },
  pluginOptions: {
    electronBuilder: {
      nodeIntegration: true
    }
  }
})
