module.exports = {
  appId: 'net.fiahfy.picty',
  files: ['app', 'main.js'],
  mac: {
    target: ['dmg']
  },
  win: {
    target: ['nsis']
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  },
  publish: {
    provider: 'github'
  }
}
