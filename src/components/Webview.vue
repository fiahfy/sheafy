<template>
  <div class="webview d-none" />
</template>

<script>
import { remote } from 'electron'
import { mapActions, mapGetters, mapMutations } from 'vuex'

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
        this.load()
      }
      this.$nextTick(() => {
        this.webview.style.display = this.display
        value ? this.webview.focus() : this.webview.blur()
      })
    }
  },
  mounted() {
    if (this.active || !this.tab.loaded) {
      this.load()
    }
  },
  destroyed() {
    this.webview && this.webview.remove()
  },
  methods: {
    load() {
      if (this.webview) {
        return
      }

      this.webview = document.createElement('webview')
      this.webview.classList.add('fill-height')
      this.webview.id = this.tab.id
      this.webview.src = this.tab.url
      this.webview.preload = this.preload
      this.webview.style.display = this.display
      this.$el.parentElement.append(this.webview)

      this.needFocus = true
      this.$nextTick(() => {
        this.$eventBus.$on('undo', () => {
          if (this.active) {
            this.webview.undo()
          }
        })
        this.$eventBus.$on('redo', () => {
          if (this.active) {
            this.webview.redo()
          }
        })
        this.$eventBus.$on('goBack', () => {
          if (this.active) {
            this.webview.goBack()
          }
        })
        this.$eventBus.$on('goForward', () => {
          if (this.active) {
            this.webview.goForward()
          }
        })
        this.$eventBus.$on('goToOffset', (offset) => {
          if (this.active) {
            this.webview.goToOffset(offset)
          }
        })
        this.$eventBus.$on('reload', () => {
          if (this.active) {
            this.needFocus = true
            this.webview.reload()
          }
        })
        this.$eventBus.$on('forceReload', () => {
          if (this.active) {
            this.needFocus = true
            this.webview.reloadIgnoringCache()
          }
        })
        this.$eventBus.$on('stop', () => {
          if (this.active) {
            this.webview.stop()
          }
        })
        this.$eventBus.$on('load', () => {
          if (this.active) {
            const url = this.getUrlWithQuery(this.tab.query)
            if (url) {
              this.webview.loadURL(url)
            }
          }
        })
        this.$eventBus.$on('requestBackHistories', () => {
          if (this.active) {
            const contents = this.webview.getWebContents()
            const histories = contents.history
              .slice(0, contents.getActiveIndex())
              .reverse()
            this.$eventBus.$emit('showBackHistories', histories)
          }
        })
        this.$eventBus.$on('requestForwardHistories', () => {
          if (this.active) {
            const contents = this.webview.getWebContents()
            const histories = contents.history.slice(
              contents.getActiveIndex() + 1
            )
            this.$eventBus.$emit('showForwardHistories', histories)
          }
        })
        this.$eventBus.$on('findInPage', (text, { forward, findNext }) => {
          if (this.active) {
            this.webview.findInPage(text, { forward, findNext })
          }
        })
        this.$eventBus.$on('stopFindInPage', () => {
          if (this.active) {
            this.webview.stopFindInPage('clearSelection')
          }
        })
        this.webview.addEventListener('load-commit', ({ url, isMainFrame }) => {
          if (isMainFrame) {
            const urlChanged = url !== this.tab.url
            const home = url === 'https://www.google.com/?sheafy'
            this.updateTab({
              id: this.tab.id,
              url,
              query: home ? '' : url,
              canGoBack: this.webview.canGoBack(),
              canGoForward: this.webview.canGoForward()
            })
            if (home) {
              // TODO:
              document.querySelector('[name=query]').focus()
            } else if (urlChanged || this.needFocus) {
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
            // TODO: handle load failure
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
              if (e.keyCode === 27) {
                this.setShortcutBar({ shortcutBar: false })
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
      })
    },
    ...mapMutations('tab', ['setShortcutBar']),
    ...mapActions('tab', ['newTab', 'updateTab', 'activateTab'])
  }
}
</script>
