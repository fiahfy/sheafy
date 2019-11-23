<template>
  <div class="webview d-none" />
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { remote, WebviewTag } from 'electron'
import { layoutStore, tabStore } from '~/store'
import TabUtils from '~/utils/tab'
import Tab from '~/models/tab'

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
  get display() {
    return this.active ? 'flex' : 'none'
  }

  @Watch('active')
  onActiveChanged(value: boolean) {
    if (value) {
      this.init()
    }
    this.$nextTick(() => {
      this.webview.style.display = this.display
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
    this.$eventBus.$off('load', this.load)
    this.$eventBus.$off('download', this.download)
    this.$eventBus.$off('findInPage', this.findInPage)
    this.$eventBus.$off('stopFindInPage', this.stopFindInPage)
    this.$eventBus.$off('resetZoom', this.resetZoom)
    this.$eventBus.$off('zoomIn', this.zoomIn)
    this.$eventBus.$off('zoomOut', this.zoomOut)
    this.$eventBus.$off('requestBackHistory', this.requestBackHistory)
    this.$eventBus.$off('requestForwardHistory', this.requestForwardHistory)
    this.webview && this.webview.remove()
  }

  init() {
    if (this.webview) {
      return
    }

    this.webview = document.createElement('webview')
    this.webview.classList.add('fill-height')
    this.webview.src = this.tab.url
    this.webview.preload = this.preload
    this.webview.allowpopups = true
    this.webview.webpreferences = 'nativeWindowOpen, scrollBounce'
    this.webview.style.display = this.display
    this.$el.parentElement!.append(this.webview)

    this.needFocus = true

    this.$nextTick(() => {
      this.$eventBus.$on('undo', this.undo)
      this.$eventBus.$on('redo', this.redo)
      this.$eventBus.$on('goBack', this.goBack)
      this.$eventBus.$on('goForward', this.goForward)
      this.$eventBus.$on('goToOffset', this.goToOffset)
      this.$eventBus.$on('reload', this.reload)
      this.$eventBus.$on('forceReload', this.forceReload)
      this.$eventBus.$on('load', this.load)
      this.$eventBus.$on('download', this.download)
      this.$eventBus.$on('findInPage', this.findInPage)
      this.$eventBus.$on('stopFindInPage', this.stopFindInPage)
      this.$eventBus.$on('resetZoom', this.resetZoom)
      this.$eventBus.$on('zoomIn', this.zoomIn)
      this.$eventBus.$on('zoomOut', this.zoomOut)
      this.$eventBus.$on('requestBackHistory', this.requestBackHistory)
      this.$eventBus.$on('requestForwardHistory', this.requestForwardHistory)

      this.webview.addEventListener('load-commit', ({ url, isMainFrame }) => {
        if (isMainFrame) {
          const urlChanged =
            urlWithoutHash(url) !== urlWithoutHash(this.tab.url)
          const home = url === 'https://www.google.com/?sheafy'
          tabStore.updateTab({
            id: this.tab.id,
            url,
            canGoBack: this.webview.canGoBack(),
            canGoForward: this.webview.canGoForward()
          })
          if (home) {
            this.$eventBus.$emit('focusLocation')
          } else if (urlChanged || this.needFocus) {
            tabStore.updateTab({ id: this.tab.id, query: url })
            this.needFocus = false
            // TODO: https://github.com/electron/electron/issues/14474
            this.webview.blur()
            this.webview.focus()
          }
        }
      })
      this.webview.addEventListener(
        'did-navigate-in-page',
        ({ url, isMainFrame }) => {
          if (isMainFrame) {
            const home = url === 'https://www.google.com/?sheafy'
            if (!home) {
              tabStore.updateTab({
                id: this.tab.id,
                url,
                query: url,
                canGoBack: this.webview.canGoBack(),
                canGoForward: this.webview.canGoForward()
              })
            }
          }
        }
      )
      this.webview.addEventListener(
        'did-fail-load',
        ({ errorCode, errorDescription, validatedURL, isMainFrame }) => {
          // TODO: Handle load failure
          // eslint-disable-next-line no-console
          console.log(errorCode, errorDescription, validatedURL, isMainFrame)
        }
      )
      this.webview.addEventListener('page-title-updated', ({ title }) => {
        tabStore.updateTab({ id: this.tab.id, title })
      })
      this.webview.addEventListener('page-favicon-updated', ({ favicons }) => {
        const favicon = favicons[favicons.length - 1]
        tabStore.updateTab({ id: this.tab.id, favicon })
      })
      this.webview.addEventListener('did-start-loading', () => {
        tabStore.updateTab({ id: this.tab.id, loading: true, finding: false })
        this.webview.stopFindInPage('clearSelection')
      })
      this.webview.addEventListener('did-stop-loading', () => {
        tabStore.updateTab({ id: this.tab.id, loading: false, loaded: true })
      })
      this.webview.addEventListener('found-in-page', ({ result }) => {
        tabStore.updateTab({
          id: this.tab.id,
          foundActiveMatchOrdinal: result.activeMatchOrdinal,
          foundMatches: result.matches
        })
      })
      this.webview.addEventListener('new-window', ({ disposition, url }) => {
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
      })
      this.webview.addEventListener('ipc-message', ({ channel, args }) => {
        switch (channel) {
          case 'inspectElement': {
            const rect = this.webview.getBoundingClientRect()
            let [x, y] = args
            x += rect.left
            y += rect.top
            this.webview.inspectElement(x, y)
            break
          }
          case 'undo': {
            this.webview.undo()
            break
          }
          case 'redo': {
            this.webview.redo()
            break
          }
          case 'lookUp': {
            this.webview.showDefinitionForSelection()
            break
          }
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
            tabStore.activateTab({ id: this.tab.id })
            break
          }
          case 'keydown': {
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
          case 'requestContextMenu': {
            this.webview.send('showContextMenu', {
              canGoBack: this.webview.canGoBack(),
              canGoForward: this.webview.canGoForward()
            })
            break
          }
        }
      })
      this.webview.addEventListener('update-target-url', ({ url }) => {
        this.$eventBus.$emit('updateTargetUrl', url)
      })
      this.webview.addEventListener('update-target-url', ({ url }) => {
        this.$eventBus.$emit('updateTargetUrl', url)
      })
    })
  }
  undo() {
    if (this.active) {
      this.webview.undo()
    }
  }
  redo() {
    if (this.active) {
      this.webview.redo()
    }
  }
  goBack() {
    if (this.active) {
      this.webview.goBack()
    }
  }
  goForward() {
    if (this.active) {
      this.webview.goForward()
    }
  }
  goToOffset(offset: number) {
    if (this.active) {
      this.webview.goToOffset(offset)
    }
  }
  reload() {
    if (this.active) {
      this.needFocus = true
      this.webview.reload()
    }
  }
  forceReload() {
    if (this.active) {
      this.needFocus = true
      this.webview.reloadIgnoringCache()
    }
  }
  load() {
    if (this.active) {
      const query = this.tab.query
      const url = TabUtils.getUrlWithQuery(query)
      if (url) {
        this.webview.loadURL(url)
      }
    }
  }
  download(url: string) {
    if (this.active) {
      this.webview.downloadURL(url)
    }
  }
  findInPage(
    text: string,
    { forward, findNext }: { forward: boolean; findNext: boolean }
  ) {
    if (this.active) {
      this.webview.findInPage(text, { forward, findNext })
    }
  }
  stopFindInPage() {
    if (this.active) {
      this.webview.stopFindInPage('clearSelection')
    }
  }
  resetZoom() {
    if (this.active) {
      this.webview.setZoomLevel(0)
    }
  }
  zoomIn() {
    if (this.active) {
      const level = this.webview.getZoomLevel()
      if (level < 9) {
        this.webview.setZoomLevel(level + 1)
      }
    }
  }
  zoomOut() {
    if (this.active) {
      const level = this.webview.getZoomLevel()
      if (level > -6) {
        this.webview.setZoomLevel(level - 1)
      }
    }
  }
  requestBackHistory() {
    if (this.active) {
      const contents = <any>this.webview.getWebContents()
      const history = contents.history
        .slice(0, contents.getActiveIndex())
        .reverse()
      this.$eventBus.$emit('showBackHistory', history)
    }
  }
  requestForwardHistory() {
    if (this.active) {
      const contents = <any>this.webview.getWebContents()
      const history = contents.history.slice(contents.getActiveIndex() + 1)
      this.$eventBus.$emit('showForwardHistory', history)
    }
  }
}
</script>
