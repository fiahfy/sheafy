<template>
  <div class="webview d-none" />
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { remote, WebviewTag } from 'electron'
import { layoutStore, tabStore, historyStore } from '~/store'
import TabUtils from '~/utils/tab'
import Tab, { homeUrl } from '~/models/tab'

const urlWithoutHash = (url: string) => {
  return url ? url.split('#')[0] : ''
}

@Component
export default class Webview extends Vue {
  @Prop({ type: Object, required: true }) readonly tab!: Tab

  src = ''
  needFocus = false
  webview!: WebviewTag

  get preload() {
    return `file://${remote.app.getAppPath()}/preload.js`
  }

  get active() {
    return tabStore.isActiveTab({ id: this.tab.id })
  }

  get viewId() {
    return tabStore.getViewId({ tabId: this.tab.id })
  }

  get id() {
    return this.viewId ? `${this.viewId}-webview` : ''
  }

  @Watch('viewId')
  onViewIdChanged(value: boolean) {
    if (value) {
      this.init()
    }
    this.$nextTick(() => {
      this.webview.id = this.id
      // TODO: the accelerator is not worked if the active tab is changed
      this.webview.blur()
      if (value) {
        this.$nextTick(() => {
          this.webview.focus()
        })
      }
    })
  }

  mounted() {
    if (this.active || !this.tab.loaded) {
      this.init()
    }
  }

  destroyed() {
    this.$eventBus.$off('undo', this.undo)
    this.$eventBus.$off('redo', this.redo)
    this.$eventBus.$off('goBack', this.goBack)
    this.$eventBus.$off('goForward', this.goForward)
    this.$eventBus.$off('goToOffset', this.goToOffset)
    this.$eventBus.$off('reload', this.reload)
    this.$eventBus.$off('forceReload', this.forceReload)
    this.$eventBus.$off('stop', this.stop)
    this.$eventBus.$off('load', this.load)
    this.$eventBus.$off('download', this.download)
    this.$eventBus.$off('findInPage', this.findInPage)
    this.$eventBus.$off('stopFindInPage', this.stopFindInPage)
    this.$eventBus.$off('resetZoom', this.resetZoom)
    this.$eventBus.$off('zoomIn', this.zoomIn)
    this.$eventBus.$off('zoomOut', this.zoomOut)
    this.$eventBus.$off('requestBackHistory', this.requestBackHistory)
    this.$eventBus.$off('requestForwardHistory', this.requestForwardHistory)

    this.webview.removeEventListener('load-commit', this.onLoadCommit)
    this.webview.removeEventListener(
      'did-navigate-in-page',
      this.onDidNavigateInPage
    )
    this.webview.removeEventListener('did-fail-load', this.onDidFailLoad)
    this.webview.removeEventListener(
      'page-title-updated',
      this.onPageTitleUpdated
    )
    this.webview.removeEventListener(
      'page-favicon-updated',
      this.onPageFaviconUpdated
    )
    this.webview.removeEventListener(
      'did-start-loading',
      this.onDidStartLoading
    )
    this.webview.removeEventListener('did-stop-loading', this.onDidStopLoading)
    this.webview.removeEventListener('found-in-page', this.onFoundInPage)
    this.webview.removeEventListener('new-window', this.onNewWindow)
    this.webview.removeEventListener('ipc-message', this.onIpcMessage)
    this.webview.removeEventListener(
      'update-target-url',
      this.onUpdateTargetUrl
    )

    this.webview && this.webview.remove()
  }

  init() {
    if (this.webview) {
      return
    }

    this.webview = document.createElement('webview')
    this.webview.classList.add('fill-height')
    this.webview.id = this.id
    this.webview.src = this.tab.url
    this.webview.preload = this.preload
    this.webview.allowpopups = true
    this.webview.webpreferences = 'nativeWindowOpen, scrollBounce'
    this.$el.parentElement!.append(this.webview)

    this.needFocus = true

    this.$eventBus.$on('undo', this.undo)
    this.$eventBus.$on('redo', this.redo)
    this.$eventBus.$on('goBack', this.goBack)
    this.$eventBus.$on('goForward', this.goForward)
    this.$eventBus.$on('goToOffset', this.goToOffset)
    this.$eventBus.$on('reload', this.reload)
    this.$eventBus.$on('forceReload', this.forceReload)
    this.$eventBus.$on('stop', this.stop)
    this.$eventBus.$on('load', this.load)
    this.$eventBus.$on('download', this.download)
    this.$eventBus.$on('findInPage', this.findInPage)
    this.$eventBus.$on('stopFindInPage', this.stopFindInPage)
    this.$eventBus.$on('resetZoom', this.resetZoom)
    this.$eventBus.$on('zoomIn', this.zoomIn)
    this.$eventBus.$on('zoomOut', this.zoomOut)
    this.$eventBus.$on('requestBackHistory', this.requestBackHistory)
    this.$eventBus.$on('requestForwardHistory', this.requestForwardHistory)

    this.webview.addEventListener('load-commit', this.onLoadCommit)
    this.webview.addEventListener(
      'did-navigate-in-page',
      this.onDidNavigateInPage
    )
    this.webview.addEventListener('did-fail-load', this.onDidFailLoad)
    this.webview.addEventListener('page-title-updated', this.onPageTitleUpdated)
    this.webview.addEventListener(
      'page-favicon-updated',
      this.onPageFaviconUpdated
    )
    this.webview.addEventListener('did-start-loading', this.onDidStartLoading)
    this.webview.addEventListener('did-stop-loading', this.onDidStopLoading)
    this.webview.addEventListener('found-in-page', this.onFoundInPage)
    this.webview.addEventListener('new-window', this.onNewWindow)
    this.webview.addEventListener('ipc-message', this.onIpcMessage)
    this.webview.addEventListener('update-target-url', this.onUpdateTargetUrl)
  }

  onLoadCommit({ url, isMainFrame }: Electron.LoadCommitEvent) {
    if (isMainFrame) {
      const urlChanged = urlWithoutHash(url) !== urlWithoutHash(this.tab.url)
      const home = url === homeUrl
      tabStore.updateTab({
        id: this.tab.id,
        url,
        canGoBack: this.webview.canGoBack(),
        canGoForward: this.webview.canGoForward()
      })
      if (home) {
        this.$eventBus.$emit('focusLocation', { viewId: this.viewId })
      } else if (urlChanged || this.needFocus) {
        tabStore.updateTab({ id: this.tab.id, query: url })
        historyStore.upsertHistory({
          url: this.tab.url,
          host: this.tab.host
        })
        this.needFocus = false
        // TODO: https://github.com/electron/electron/issues/14474
        this.webview.blur()
        this.webview.focus()
      }
    }
  }

  onDidNavigateInPage({ url, isMainFrame }: Electron.DidNavigateInPageEvent) {
    const home = url === homeUrl
    if (isMainFrame && !home) {
      tabStore.updateTab({
        id: this.tab.id,
        url,
        query: url,
        canGoBack: this.webview.canGoBack(),
        canGoForward: this.webview.canGoForward()
      })
    }
  }

  onDidFailLoad({
    errorCode,
    errorDescription,
    validatedURL,
    isMainFrame
  }: Electron.DidFailLoadEvent) {
    // TODO: Handle load failure
    // eslint-disable-next-line no-console
    console.log(errorCode, errorDescription, validatedURL, isMainFrame)
  }

  onPageTitleUpdated({ title }: Electron.PageTitleUpdatedEvent) {
    tabStore.updateTab({ id: this.tab.id, title })
    historyStore.upsertHistory({
      url: this.tab.url,
      title
    })
  }

  onPageFaviconUpdated({ favicons }: Electron.PageFaviconUpdatedEvent) {
    const favicon = favicons[favicons.length - 1]
    tabStore.updateTab({ id: this.tab.id, favicon })
    historyStore.upsertHistory({
      url: this.tab.url,
      favicon
    })
  }

  onDidStartLoading() {
    tabStore.updateTab({ id: this.tab.id, loading: true, finding: false })
    this.webview.stopFindInPage('clearSelection')
  }

  onDidStopLoading() {
    tabStore.updateTab({ id: this.tab.id, loading: false, loaded: true })
  }

  onFoundInPage({ result }: Electron.FoundInPageEvent) {
    tabStore.updateTab({
      id: this.tab.id,
      foundActiveMatchOrdinal: result.activeMatchOrdinal,
      foundMatches: result.matches
    })
  }

  onNewWindow({ disposition, url }: Electron.NewWindowEvent) {
    switch (disposition) {
      case 'new-window':
        // open new window from main process
        break
      case 'foreground-tab':
        tabStore.newTab({
          url,
          options: {
            activate: true,
            position: 'next',
            openerId: this.tab.id
          }
        })
        break
      case 'background-tab':
        tabStore.newTab({
          url,
          options: {
            activate: false,
            position: 'next',
            openerId: this.tab.id
          }
        })
        break
    }
  }

  onIpcMessage({ channel, args }: Electron.IpcMessageEvent) {
    switch (channel) {
      case 'inspectElement': {
        const rect = this.webview.getBoundingClientRect()
        let [x, y] = args
        x += rect.left
        y += rect.top
        this.webview.inspectElement(x, y)
        break
      }
      case 'undo':
        this.webview.undo()
        break
      case 'redo':
        this.webview.redo()
        break
      case 'lookUp':
        this.webview.showDefinitionForSelection()
        break
      case 'newTab': {
        const [url] = args
        tabStore.newTab({
          url,
          options: { position: 'next', openerId: this.tab.id }
        })
        break
      }
      case 'search': {
        const [query] = args
        const url = TabUtils.getUrlWithQuery(query)
        tabStore.newTab({
          url,
          options: { position: 'next', openerId: this.tab.id }
        })
        break
      }
      case 'focus': {
        const viewId = tabStore.activeViewId
        tabStore.activateTab({ id: this.tab.id, viewId })
        break
      }
      case 'onclick':
        tabStore.activateView({ id: this.viewId })
        break
      case 'onkeydown': {
        const [e] = args
        if (e.key === 'Escape') {
          layoutStore.hideShortcutBar()
        }
        break
      }
      case 'openDefaultBrowser': {
        const [url] = args
        remote.shell.openExternal(url)
        break
      }
      case 'requestContextMenu':
        this.webview.send('showContextMenu', {
          canGoBack: this.webview.canGoBack(),
          canGoForward: this.webview.canGoForward()
        })
        break
    }
  }

  onUpdateTargetUrl({ url }: Electron.UpdateTargetUrlEvent) {
    this.$eventBus.$emit('updateTargetUrl', { viewId: this.viewId, url })
  }

  undo({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.webview.undo()
    }
  }

  redo({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.webview.redo()
    }
  }

  goBack({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.webview.goBack()
    }
  }

  goForward({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.webview.goForward()
    }
  }

  goToOffset({ viewId, offset }: { viewId: string; offset: number }) {
    if (this.active && this.viewId === viewId) {
      this.webview.goToOffset(offset)
    }
  }

  reload({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.needFocus = true
      this.webview.reload()
    }
  }

  forceReload({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.needFocus = true
      this.webview.reloadIgnoringCache()
    }
  }

  stop({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.webview.stop()
    }
  }

  load({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      const query = this.tab.query
      const url = TabUtils.getUrlWithQuery(query)
      if (url) {
        this.webview.loadURL(url)
      }
    }
  }

  download({ viewId, url }: { viewId: string; url: string }) {
    if (this.active && this.viewId === viewId) {
      this.webview.downloadURL(url)
    }
  }

  findInPage({
    viewId,
    text,
    forward,
    findNext
  }: {
    viewId: string
    text: string
    forward: boolean
    findNext: boolean
  }) {
    if (this.active && this.viewId === viewId) {
      this.webview.findInPage(text, { forward, findNext })
    }
  }

  stopFindInPage({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.webview.stopFindInPage('clearSelection')
    }
  }

  resetZoom({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      this.webview.setZoomLevel(0)
    }
  }

  zoomIn({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      const level = this.webview.getZoomLevel()
      if (level < 9) {
        this.webview.setZoomLevel(level + 1)
      }
    }
  }

  zoomOut({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      const level = this.webview.getZoomLevel()
      if (level > -6) {
        this.webview.setZoomLevel(level - 1)
      }
    }
  }

  requestBackHistory({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      const contents = this.webview.getWebContents() as any
      const history = contents.history
        .slice(0, contents.getActiveIndex())
        .reverse()
      this.$eventBus.$emit('showBackHistory', { viewId: this.viewId, history })
    }
  }

  requestForwardHistory({ viewId }: { viewId: string }) {
    if (this.active && this.viewId === viewId) {
      const contents = this.webview.getWebContents() as any
      const history = contents.history.slice(contents.getActiveIndex() + 1)
      this.$eventBus.$emit('showForwardHistory', {
        viewId: this.viewId,
        history
      })
    }
  }
}
</script>
