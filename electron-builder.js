module.exports = {
  appId: 'net.fiahfy.shelf-browser',
  files: ['app', 'main.js', 'preload.js'],
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
