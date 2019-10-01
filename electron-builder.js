module.exports = {
  appId: 'net.fiahfy.sheafy',
  files: ['app', 'main.js', 'preload.js'],
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },
  publish: {
    provider: 'github'
  }
}
