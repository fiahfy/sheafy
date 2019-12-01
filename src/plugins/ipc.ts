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
          viewId: tabStore.activeViewId
        })
        break
      case 'right':
        ctx.app.$eventBus.$emit('goBack', { viewId: tabStore.activeViewId })
        break
    }
  })
  ipcRenderer.on('newTab', () => {
    tabStore.newTab()
  })
  ipcRenderer.on('duplicateTab', () => {
    const tab = tabStore.getActiveTab({
      viewId: tabStore.activeViewId
    })
    if (tab) {
      tabStore.duplicateTab({ id: tab.id })
    }
  })
  ipcRenderer.on('closeTab', () => {
    tabStore.closeTab({ id: tabStore.activeTabIds[tabStore.activeViewId] })
  })
  ipcRenderer.on('openLocation', () => {
    ctx.app.$eventBus.$emit('focusLocation', {
      viewId: tabStore.activeViewId
    })
  })
  ipcRenderer.on('goToTab', () => {
    layoutStore.showShortcutBar()
    ctx.app.$eventBus.$emit('focusShortcut')
  })
  ipcRenderer.on('find', () => {
    const id = tabStore.activeTabIds[tabStore.activeViewId]
    tabStore.updateTab({ id, finding: true })
    ctx.app.$eventBus.$emit('focusFinding', { viewId: tabStore.activeViewId })
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
  ipcRenderer.on('openSecondaryView', () => {
    tabStore.newTab({ options: { viewId: 'secondary' } })
  })
  ipcRenderer.on('reload', () => {
    ctx.app.$eventBus.$emit('reload', { viewId: tabStore.activeViewId })
  })
  ipcRenderer.on('forceReload', () => {
    ctx.app.$eventBus.$emit('forceReload', { viewId: tabStore.activeViewId })
  })
  ipcRenderer.on('resetZoom', () => {
    ctx.app.$eventBus.$emit('resetZoom', { viewId: tabStore.activeViewId })
  })
  ipcRenderer.on('zoomIn', () => {
    ctx.app.$eventBus.$emit('zoomIn', { viewId: tabStore.activeViewId })
  })
  ipcRenderer.on('zoomOut', () => {
    ctx.app.$eventBus.$emit('zoomOut', { viewId: tabStore.activeViewId })
  })
  ipcRenderer.on('goBack', () => {
    ctx.app.$eventBus.$emit('goBack', { viewId: tabStore.activeViewId })
  })
  ipcRenderer.on('goForward', () => {
    ctx.app.$eventBus.$emit('goForward', { viewId: tabStore.activeViewId })
  })
  ipcRenderer.on('goNextTab', () => {
    tabStore.goNextTab({ viewId: tabStore.activeViewId })
  })
  ipcRenderer.on('goPreviousTab', () => {
    tabStore.goPreviousTab({ viewId: tabStore.activeViewId })
  })
  // TODO: https://github.com/electron/electron/issues/15728
  ipcRenderer.on('undo', () => {
    if (document.activeElement!.tagName.toLocaleLowerCase() === 'webview') {
      ctx.app.$eventBus.$emit('undo', { viewId: tabStore.activeViewId })
    } else {
      document.execCommand('undo')
    }
  })
  ipcRenderer.on('redo', () => {
    if (document.activeElement!.tagName.toLocaleLowerCase() === 'webview') {
      ctx.app.$eventBus.$emit('redo', { viewId: tabStore.activeViewId })
    } else {
      document.execCommand('redo')
    }
  })
  ipcRenderer.on('upsertDownloadItem', (_e, downloadItem) => {
    downloadStore.upsertDownloadItem(downloadItem)
  })
}

export default ipcPlugin
