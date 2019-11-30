import { Plugin } from '@nuxt/types'
import { ipcRenderer } from 'electron'
import { layoutStore, settingsStore, downloadStore, tabStore } from '~/store'

const ipcPlugin: Plugin = (ctx) => {
  ipcRenderer.on('enterFullScreen', () => {
    layoutStore.setFullScreen({ fullScreen: true })
  })
  ipcRenderer.on('leaveFullScreen', () => {
    layoutStore.setFullScreen({ fullScreen: false })
  })
  ipcRenderer.on('swipe', (_e, direction) => {
    if (!settingsStore.swipeToNavigate) {
      return
    }
    switch (direction) {
      case 'left':
        ctx.app.$eventBus.$emit('goForward', {
          index: tabStore.activeViewIndex
        })
        break
      case 'right':
        ctx.app.$eventBus.$emit('goBack', { index: tabStore.activeViewIndex })
        break
    }
  })
  ipcRenderer.on('newTab', () => {
    tabStore.newTab()
  })
  ipcRenderer.on('duplicateTab', () => {
    const tab = tabStore.getActiveTab({
      viewIndex: tabStore.activeViewIndex
    })
    if (tab) {
      tabStore.duplicateTab({ id: tab.id })
    }
  })
  ipcRenderer.on('closeTab', () => {
    tabStore.closeTab({ id: tabStore.activeIds[tabStore.activeViewIndex] })
  })
  ipcRenderer.on('openLocation', () => {
    ctx.app.$eventBus.$emit('focusLocation', {
      index: tabStore.activeViewIndex
    })
  })
  ipcRenderer.on('goToTab', () => {
    layoutStore.showShortcutBar()
    ctx.app.$eventBus.$emit('focusShortcut')
  })
  ipcRenderer.on('find', () => {
    const id = tabStore.activeIds[tabStore.activeViewIndex]
    tabStore.updateTab({ id, finding: true })
    ctx.app.$eventBus.$emit('focusFinding', { index: tabStore.activeViewIndex })
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
    ctx.app.$eventBus.$emit('reload', { index: tabStore.activeViewIndex })
  })
  ipcRenderer.on('forceReload', () => {
    ctx.app.$eventBus.$emit('forceReload', { index: tabStore.activeViewIndex })
  })
  ipcRenderer.on('resetZoom', () => {
    ctx.app.$eventBus.$emit('resetZoom', { index: tabStore.activeViewIndex })
  })
  ipcRenderer.on('zoomIn', () => {
    ctx.app.$eventBus.$emit('zoomIn', { index: tabStore.activeViewIndex })
  })
  ipcRenderer.on('zoomOut', () => {
    ctx.app.$eventBus.$emit('zoomOut', { index: tabStore.activeViewIndex })
  })
  ipcRenderer.on('goBack', () => {
    ctx.app.$eventBus.$emit('goBack', { index: tabStore.activeViewIndex })
  })
  ipcRenderer.on('goForward', () => {
    ctx.app.$eventBus.$emit('goForward', { index: tabStore.activeViewIndex })
  })
  ipcRenderer.on('goNextTab', () => {
    tabStore.goNextTab({ viewIndex: tabStore.activeViewIndex })
  })
  ipcRenderer.on('goPreviousTab', () => {
    tabStore.goPreviousTab({ viewIndex: tabStore.activeViewIndex })
  })
  // TODO: https://github.com/electron/electron/issues/15728
  ipcRenderer.on('undo', () => {
    if (document.activeElement!.tagName.toLocaleLowerCase() === 'webview') {
      ctx.app.$eventBus.$emit('undo', { index: tabStore.activeViewIndex })
    } else {
      document.execCommand('undo')
    }
  })
  ipcRenderer.on('redo', () => {
    if (document.activeElement!.tagName.toLocaleLowerCase() === 'webview') {
      ctx.app.$eventBus.$emit('redo', { index: tabStore.activeViewIndex })
    } else {
      document.execCommand('redo')
    }
  })
  ipcRenderer.on('upsertDownloadItem', (_e, downloadItem) => {
    downloadStore.upsertDownloadItem(downloadItem)
  })
}

export default ipcPlugin
