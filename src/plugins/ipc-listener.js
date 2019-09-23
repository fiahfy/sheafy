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
  ipcRenderer.on('closeTab', () => {
    store.dispatch('tab/closeTab', { id: store.state.tab.activeTabId })
  })
  ipcRenderer.on('openLocation', () => {
    document.querySelector('input[name=query]').focus()
  })
  ipcRenderer.on('search', () => {
    const id = store.state.tab.activeTabId
    store.dispatch('tab/updateTab', { id, searching: true })
    const el = document.querySelector('input[name=search-text]')
    el && el.focus()
    el && el.select()
  })
}
