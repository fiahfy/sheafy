<template>
  <webview
    v-if="mounted"
    class="webview"
    :class="{ 'd-none': !active }"
    :src="src"
    :preload="preload"
    allowpopups
  />
</template>

<script>
import { remote } from 'electron'
import { mapActions, mapGetters } from 'vuex'

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
      destroyed: false
    }
  },
  computed: {
    mounted() {
      return this.src && !this.tab.replaced
    },
    preload() {
      return `file://${remote.app.getAppPath()}/preload.js`
    },
    active() {
      return this.isActiveTab(this.tab)
    },
    handling() {
      return this.active && !this.destroyed
    },
    ...mapGetters('tab', ['isActiveTab', 'getUrlWithQuery'])
  },
  watch: {
    active(value) {
      if (value) {
        if (!this.mounted) {
          this.updateTab({ id: this.tab.id, replaced: false })
          this.load()
        }
        this.$nextTick(() => {
          this.$el.focus()
        })
      }
    }
  },
  mounted() {
    if (this.active || !this.tab.loaded) {
      this.load()
    }
  },
  destroyed() {
    this.destroyed = true
  },
  methods: {
    load() {
      this.src = this.tab.url
      this.$nextTick(() => {
        this.$eventBus.$on('undo', () => {
          if (this.handling) {
            this.$el.undo()
          }
        })
        this.$eventBus.$on('redo', () => {
          if (this.handling) {
            this.$el.redo()
          }
        })
        this.$eventBus.$on('goBack', () => {
          if (this.handling) {
            this.$el.goBack()
          }
        })
        this.$eventBus.$on('goForward', () => {
          if (this.handling) {
            this.$el.goForward()
          }
        })
        this.$eventBus.$on('goToOffset', (offset) => {
          if (this.handling) {
            this.$el.goToOffset(offset)
          }
        })
        this.$eventBus.$on('reload', () => {
          if (this.handling) {
            this.$el.reload()
          }
        })
        this.$eventBus.$on('forceReload', () => {
          if (this.handling) {
            this.$el.reloadIgnoringCache()
          }
        })
        this.$eventBus.$on('stop', () => {
          if (this.handling) {
            this.$el.stop()
          }
        })
        this.$eventBus.$on('load', () => {
          if (this.handling) {
            const url = this.getUrlWithQuery(this.tab.query)
            if (url) {
              this.$el.loadURL(url)
            }
          }
        })
        this.$eventBus.$on('requestBackHistories', () => {
          if (this.handling) {
            const contents = this.$el.getWebContents()
            const histories = contents.history
              .slice(0, contents.getActiveIndex())
              .reverse()
            this.$eventBus.$emit('showBackHistories', histories)
          }
        })
        this.$eventBus.$on('requestForwardHistories', () => {
          if (this.handling) {
            const contents = this.$el.getWebContents()
            const histories = contents.history.slice(
              contents.getActiveIndex() + 1
            )
            this.$eventBus.$emit('showForwardHistories', histories)
          }
        })
        this.$eventBus.$on('findInPage', (text, { forward, findNext }) => {
          if (this.handling) {
            this.$el.findInPage(text, { forward, findNext })
          }
        })
        this.$eventBus.$on('stopFindInPage', () => {
          if (this.handling) {
            this.$el.stopFindInPage('clearSelection')
          }
        })
        this.$el.addEventListener('load-commit', ({ url, isMainFrame }) => {
          if (isMainFrame) {
            const urlChanged = url !== this.tab.url
            const home = url === 'https://www.google.com/?sheafy'
            this.updateTab({
              id: this.tab.id,
              url,
              query: home ? '' : url,
              canGoBack: this.$el.canGoBack(),
              canGoForward: this.$el.canGoForward()
            })
            if (home) {
              // TODO:
              document.querySelector('[name=query]').focus()
            } else if (urlChanged) {
              // TODO: https://github.com/electron/electron/issues/14474
              this.$el.blur()
              this.$el.focus()
            }
          }
        })
        this.$el.addEventListener('page-title-updated', ({ title }) => {
          this.updateTab({ id: this.tab.id, title })
        })
        this.$el.addEventListener('page-favicon-updated', ({ favicons }) => {
          const favicon = favicons[0]
          this.updateTab({ id: this.tab.id, favicon })
        })
        this.$el.addEventListener('did-start-loading', () => {
          this.updateTab({ id: this.tab.id, loading: true, searching: false })
          this.$el.stopFindInPage('clearSelection')
        })
        this.$el.addEventListener('did-stop-loading', () => {
          this.updateTab({ id: this.tab.id, loading: false, loaded: true })
        })
        this.$el.addEventListener('found-in-page', ({ result }) => {
          this.updateTab({
            id: this.tab.id,
            searchActiveMatchOrdinal: result.activeMatchOrdinal,
            searchMatches: result.matches
          })
        })
        this.$el.addEventListener('new-window', ({ disposition, url }) => {
          switch (disposition) {
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
        this.$el.addEventListener('ipc-message', ({ channel, args }) => {
          switch (channel) {
            case 'inspectElement': {
              const rect = this.$el.getBoundingClientRect()
              let [x, y] = args
              x += rect.left
              y += rect.top
              this.$el.inspectElement(x, y)
              break
            }
            case 'undo': {
              this.$el.undo()
              break
            }
            case 'redo': {
              this.$el.redo()
              break
            }
            case 'lookUp': {
              this.$el.showDefinitionForSelection()
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
            case 'openDefaultBrowser': {
              const [url] = args
              remote.shell.openExternal(url)
              break
            }
            case 'requestContextMenu': {
              this.$el.send('showContextMenu', {
                canGoBack: this.$el.canGoBack(),
                canGoForward: this.$el.canGoForward()
              })
              break
            }
          }
        })
      })
    },
    ...mapActions('tab', [
      'newTab',
      'newTabInBackground',
      'updateTab',
      'activateTab'
    ])
  }
}
</script>
