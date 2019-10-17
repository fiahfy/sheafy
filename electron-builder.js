module.exports = {
  appId: 'net.fiahfy.sheafy',
  files: ['app', 'main.js', 'preload.js'],
  mac: {
    publish: {
      provider: 'github'
    }
  },
  win: {
    publish: {
      provider: 'github'
    }
  },
  linux: {
    publish: {
      provider: 'github'
    }
  },
  nsis: {
    oneClick: false,
    allowToChangeInstallationDirectory: true
  }
}
