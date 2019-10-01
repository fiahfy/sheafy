import { ipcRenderer } from 'electron'

export default ({ store }) => {
  ipcRenderer.on('enterFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: true })
  })
  ipcRenderer.on('leaveFullScreen', () => {
    store.commit('setFullScreen', { fullScreen: false })
  })
  ipcRenderer.on('newTab', () => {
    store.dispatch('tab/newTab')
  })
  ipcRenderer.on('duplicateTab', () => {
    const tab = store.getters['tab/activeTab']
    store.dispatch('tab/duplicateTab', { id: tab.id })
  })
  ipcRenderer.on('closeTab', () => {
    store.dispatch('tab/closeTab', { id: store.state.tab.activeTabId })
  })
  ipcRenderer.on('openLocation', () => {
    document.querySelector('input[name=query]').focus()
  })
  ipcRenderer.on('goBack', () => {
    store.$eventBus.$emit('goBack')
  })
  ipcRenderer.on('goForward', () => {
    store.$eventBus.$emit('goForward')
  })
  ipcRenderer.on('reload', () => {
    store.$eventBus.$emit('reload')
  })
  ipcRenderer.on('forceReload', () => {
    store.$eventBus.$emit('forceReload')
  })
  ipcRenderer.on('search', () => {
    const id = store.state.tab.activeTabId
    store.dispatch('tab/updateTab', { id, searching: true })
    const el = document.querySelector('input[name=search-text]')
    el && el.focus()
    el && el.select()
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
}
