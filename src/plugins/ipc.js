import { ipcRenderer } from 'electron'

export default ({ store }) => {
  ipcRenderer.on('enterFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: true })
  })
  ipcRenderer.on('leaveFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: false })
  })
  ipcRenderer.on('swipe', (e, direction) => {
    switch (direction) {
      case 'left':
        store.$eventBus.$emit('goForward')
        break
      case 'right':
        store.$eventBus.$emit('goBack')
        break
    }
  })
  ipcRenderer.on('newTab', () => {
    store.dispatch('tab/newTab')
  })
  ipcRenderer.on('duplicateTab', () => {
    const tab = store.getters['tab/activeTab']
    store.dispatch('tab/duplicateTab', { id: tab.id })
  })
  ipcRenderer.on('closeTab', () => {
    store.dispatch('tab/closeTab', { id: store.state.tab.activeId })
  })
  ipcRenderer.on('openLocation', () => {
    document.querySelector('input[name=query]').focus()
  })
  ipcRenderer.on('goToTab', () => {
    store.dispatch('showShortcutBar')
    const el = document.querySelector('input[name=shortcut]')
    el && el.focus()
    el && el.select()
  })
  ipcRenderer.on('find', () => {
    const id = store.state.tab.activeId
    store.dispatch('tab/updateTab', { id, finding: true })
    const el = document.querySelector('input[name=finding-text]')
    el && el.focus()
    el && el.select()
  })
  ipcRenderer.on('showSettings', () => {
    store.commit('setPanelId', { panelId: 'settings' })
  })
  ipcRenderer.on('showApps', () => {
    store.commit('setPanelId', { panelId: 'apps' })
  })
  ipcRenderer.on('showDownloads', () => {
    store.commit('setPanelId', { panelId: 'downloads' })
  })
  ipcRenderer.on('reload', () => {
    store.$eventBus.$emit('reload')
  })
  ipcRenderer.on('forceReload', () => {
    store.$eventBus.$emit('forceReload')
  })
  ipcRenderer.on('goBack', () => {
    store.$eventBus.$emit('goBack')
  })
  ipcRenderer.on('goForward', () => {
    store.$eventBus.$emit('goForward')
  })
  ipcRenderer.on('goBackTab', () => {
    store.dispatch('tab/goBackTab')
  })
  ipcRenderer.on('goForwardTab', () => {
    store.dispatch('tab/goForwardTab')
  })
  // TODO: https://github.com/electron/electron/issues/15728
  ipcRenderer.on('undo', () => {
    if (document.activeElement.tagName.toLocaleLowerCase() === 'webview') {
      store.$eventBus.$emit('undo')
    } else {
      document.execCommand('undo')
    }
  })
  ipcRenderer.on('redo', () => {
    if (document.activeElement.tagName.toLocaleLowerCase() === 'webview') {
      store.$eventBus.$emit('redo')
    } else {
      document.execCommand('redo')
    }
  })
  ipcRenderer.on('updateDownload', (e, download) => {
    store.dispatch('download/updateDownload', { ...download })
  })
}
