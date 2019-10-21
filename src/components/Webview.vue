<template>
  <div class="webview d-none" />
</template>

<script>
import { remote } from 'electron'
import { mapActions, mapGetters } from 'vuex'

const urlWithoutHash = (url) => {
  return url ? url.split('#')[0] : ''
}

export default {
  props: {
    tab: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      src: '',
      needFocus: false
    }
  },
  computed: {
    preload() {
      return `file://${remote.app.getAppPath()}/preload.js`
    },
    active() {
      return this.isActiveTab({ id: this.tab.id })
    },
    display() {
      return this.active ? 'flex' : 'none'
    },
    ...mapGetters('tab', ['isActiveTab', 'getUrlWithQuery'])
  },
  watch: {
    active(value) {
      if (value) {
        this.init()
      }
      this.$nextTick(() => {
        this.webview.style.display = this.display
        value ? this.webview.focus() : this.webview.blur()
      })
    }
  },
  mounted() {
    if (this.active || !this.tab.loaded) {
      this.init()
    }
  },
  destroyed() {
    this.$eventBus.$off('undo', this.undo)
    this.$eventBus.$off('redo', this.redo)
    this.$eventBus.$off('goBack', this.goBack)
    this.$eventBus.$off('goForward', this.goForward)
    this.$eventBus.$off('goToOffset', this.goToOffset)
    this.$eventBus.$off('reload', this.reload)
    this.$eventBus.$off('forceReload', this.forceReload)
    this.$eventBus.$off('load', this.load)
    this.$eventBus.$off('findInPage', this.findInPage)
    this.$eventBus.$off('stopFindInPage', this.stopFindInPage)
    this.$eventBus.$off('requestBackHistories', this.requestBackHistories)
    this.$eventBus.$off('requestForwardHistories', this.requestForwardHistories)
    this.webview && this.webview.remove()
  },
  methods: {
    init() {
      if (this.webview) {
        return
      }

      this.webview = document.createElement('webview')
      this.webview.classList.add('fill-height')
      this.webview.src = this.tab.url
      this.webview.preload = this.preload
      this.webview.allowpopups = true
      this.webview.webpreferences = 'nativeWindowOpen=yes'
      this.webview.style.display = this.display
      this.$el.parentElement.append(this.webview)

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
        this.$eventBus.$on('findInPage', this.findInPage)
        this.$eventBus.$on('stopFindInPage', this.stopFindInPage)
        this.$eventBus.$on('requestBackHistories', this.requestBackHistories)
        this.$eventBus.$on(
          'requestForwardHistories',
          this.requestForwardHistories
        )

        this.webview.addEventListener('load-commit', ({ url, isMainFrame }) => {
          if (isMainFrame) {
            const urlChanged =
              urlWithoutHash(url) !== urlWithoutHash(this.tab.url)
            const home = url === 'https://www.google.com/?sheafy'
            this.updateTab({
              id: this.tab.id,
              url,
              canGoBack: this.webview.canGoBack(),
              canGoForward: this.webview.canGoForward()
            })
            if (home) {
              // TODO: selector name
              document.querySelector('[name=query]').focus()
            } else if (urlChanged || this.needFocus) {
              this.updateTab({ id: this.tab.id, query: url })
              this.needFocus = false
              // TODO: https://github.com/electron/electron/issues/14474
              this.webview.blur()
              this.webview.focus()
            }
          }
        })
        this.webview.addEventListener(
          'did-fail-load',
          ({ errorCode, errorDescription, validatedURL, isMainFrame }) => {
            // TODO: Handle load failure
            console.log(errorCode, errorDescription, validatedURL, isMainFrame)
          }
        )
        this.webview.addEventListener('page-title-updated', ({ title }) => {
          this.updateTab({ id: this.tab.id, title })
        })
        this.webview.addEventListener(
          'page-favicon-updated',
          ({ favicons }) => {
            const favicon = favicons[0]
            this.updateTab({ id: this.tab.id, favicon })
          }
        )
        this.webview.addEventListener('did-start-loading', () => {
          this.updateTab({ id: this.tab.id, loading: true, searching: false })
          this.webview.stopFindInPage('clearSelection')
        })
        this.webview.addEventListener('did-stop-loading', () => {
          this.updateTab({ id: this.tab.id, loading: false, loaded: true })
        })
        this.webview.addEventListener('found-in-page', ({ result }) => {
          this.updateTab({
            id: this.tab.id,
            searchActiveMatchOrdinal: result.activeMatchOrdinal,
            searchMatches: result.matches
          })
        })
        this.webview.addEventListener('new-window', ({ disposition, url }) => {
          switch (disposition) {
            case 'new-window':
              // open new window from main process
              break
            case 'foreground-tab':
              this.newTab({
                url,
                options: { position: 'next', activate: true }
              })
              break
            case 'background-tab':
              this.newTab({
                url,
                options: { position: 'next', activate: false }
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
              this.newTab({ url, options: { position: 'next' } })
              break
            }
            case 'search': {
              const [text] = args
              const url = this.getUrlWithQuery(text)
              this.newTab({ url, options: { position: 'next' } })
              break
            }
            case 'focus': {
              this.activateTab({ id: this.tab.id })
              break
            }
            case 'keydown': {
              const [e] = args
              if (e.key === 'Escape') {
                this.hideShortcutBar()
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
        // loadUrl() is not working if do not use setTimeout()
        setTimeout(() => {
          // TODO: Show download progress
          // const contents = this.webview.getWebContents()
          // contents.session.on('will-download', (event, item, webContents) => {
          //   console.log(item)
          //   // Set the save path, making Electron not to prompt a save dialog.
          //   item.savePath = '/Users/fiahfy/Downloads/save.pdf'
          //   item.on('updated', (event, state) => {
          //     if (state === 'interrupted') {
          //       console.log('Download is interrupted but can be resumed')
          //     } else if (state === 'progressing') {
          //       if (item.isPaused()) {
          //         console.log('Download is paused')
          //       } else {
          //         console.log(`Received bytes: ${item.getReceivedBytes()}`)
          //       }
          //     }
          //   })
          //   item.once('done', (event, state) => {
          //     if (state === 'completed') {
          //       console.log('Download successfully')
          //     } else {
          //       console.log(`Download failed: ${state}`)
          //     }
          //   })
          // })
        }, 0)
      })
    },
    undo() {
      if (this.active) {
        this.webview.undo()
      }
    },
    redo() {
      if (this.active) {
        this.webview.redo()
      }
    },
    goBack() {
      if (this.active) {
        this.webview.goBack()
      }
    },
    goForward() {
      if (this.active) {
        this.webview.goForward()
      }
    },
    goToOffset(offset) {
      if (this.active) {
        this.webview.goToOffset(offset)
      }
    },
    reload() {
      if (this.active) {
        this.needFocus = true
        this.webview.reload()
      }
    },
    forceReload() {
      if (this.active) {
        this.needFocus = true
        this.webview.reloadIgnoringCache()
      }
    },
    load() {
      if (this.active) {
        const url = this.getUrlWithQuery(this.tab.query)
        if (url) {
          this.webview.loadURL(url)
        }
      }
    },
    findInPage(text, { forward, findNext }) {
      if (this.active) {
        this.webview.findInPage(text, { forward, findNext })
      }
    },
    stopFindInPage() {
      if (this.active) {
        this.webview.stopFindInPage('clearSelection')
      }
    },
    requestBackHistories() {
      if (this.active) {
        const contents = this.webview.getWebContents()
        const histories = contents.history
          .slice(0, contents.getActiveIndex())
          .reverse()
        this.$eventBus.$emit('showBackHistories', histories)
      }
    },
    requestForwardHistories() {
      if (this.active) {
        const contents = this.webview.getWebContents()
        const histories = contents.history.slice(contents.getActiveIndex() + 1)
        this.$eventBus.$emit('showForwardHistories', histories)
      }
    },
    ...mapActions(['hideShortcutBar']),
    ...mapActions('tab', ['newTab', 'updateTab', 'activateTab'])
  }
}
</script>
