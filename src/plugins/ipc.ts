import { Plugin } from '@nuxt/types'
import { ipcRenderer } from 'electron'
import { layoutStore, downloadStore, tabStore } from '~/store'

const ipcPlugin: Plugin = (ctx) => {
  ipcRenderer.on('enterFullScreen', () => {
    layoutStore.setFullScreen({ fullScreen: true })
  })
  ipcRenderer.on('leaveFullScreen', () => {
    layoutStore.setFullScreen({ fullScreen: false })
  })
  ipcRenderer.on('swipe', (_e, direction) => {
    switch (direction) {
      case 'left':
        ctx.app.$eventBus.$emit('goForward')
        break
      case 'right':
        ctx.app.$eventBus.$emit('goBack')
        break
    }
  })
  ipcRenderer.on('newTab', () => {
    tabStore.newTab()
  })
  ipcRenderer.on('duplicateTab', () => {
    const tab = tabStore.activeTab
    if (tab) {
      tabStore.duplicateTab({ id: tab.id })
    }
  })
  ipcRenderer.on('closeTab', () => {
    tabStore.closeTab({ id: tabStore.activeId })
  })
  ipcRenderer.on('openLocation', () => {
    ctx.app.$eventBus.$emit('focusLocation')
  })
  ipcRenderer.on('goToTab', () => {
    layoutStore.showShortcutBar()
    ctx.app.$eventBus.$emit('focusShortcut')
  })
  ipcRenderer.on('find', () => {
    const id = tabStore.activeId
    tabStore.updateTab({ id, finding: true })
    ctx.app.$eventBus.$emit('focusFinding')
  })
  ipcRenderer.on('showSettings', () => {
    layoutStore.setPanelId({ panelId: 'settings' })
  })
  ipcRenderer.on('showApps', () => {
    layoutStore.setPanelId({ panelId: 'apps' })
  })
  ipcRenderer.on('showDownloads', () => {
    layoutStore.setPanelId({ panelId: 'downloads' })
  })
  ipcRenderer.on('reload', () => {
    ctx.app.$eventBus.$emit('reload')
  })
  ipcRenderer.on('forceReload', () => {
    ctx.app.$eventBus.$emit('forceReload')
  })
  ipcRenderer.on('resetZoom', () => {
    ctx.app.$eventBus.$emit('resetZoom')
  })
  ipcRenderer.on('zoomIn', () => {
    ctx.app.$eventBus.$emit('zoomIn')
  })
  ipcRenderer.on('zoomOut', () => {
    ctx.app.$eventBus.$emit('zoomOut')
  })
  ipcRenderer.on('goBack', () => {
    ctx.app.$eventBus.$emit('goBack')
  })
  ipcRenderer.on('goForward', () => {
    ctx.app.$eventBus.$emit('goForward')
  })
  ipcRenderer.on('goBackTab', () => {
    tabStore.goBackTab()
  })
  ipcRenderer.on('goForwardTab', () => {
    tabStore.goForwardTab()
  })
  // TODO: https://github.com/electron/electron/issues/15728
  ipcRenderer.on('undo', () => {
    if (document.activeElement!.tagName.toLocaleLowerCase() === 'webview') {
      ctx.app.$eventBus.$emit('undo')
    } else {
      document.execCommand('undo')
    }
  })
  ipcRenderer.on('redo', () => {
    if (document.activeElement!.tagName.toLocaleLowerCase() === 'webview') {
      ctx.app.$eventBus.$emit('redo')
    } else {
      document.execCommand('redo')
    }
  })
  ipcRenderer.on('upsertDownload', (_e, download) => {
    downloadStore.upsertDownload(download)
  })
}

export default ipcPlugin
