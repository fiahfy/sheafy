<template>
  <webview
    class="explorer-webview"
    :class="{ 'd-none': !active }"
    :src="src"
    :preload="preload"
  />
</template>

<script>
import { remote } from 'electron'
import { mapActions, mapGetters } from 'vuex'

// 空値にすると findInPage した際に hang するので何か入れておく
// (findInPage(forward = false) で src が空の webview が存在する場合に hang する)
const blank = 'data:'

export default {
  props: {
    tab: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      src: blank,
      destroyed: false
    }
  },
  computed: {
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
      if (value && this.src === blank) {
        this.src = this.tab.url
      }
    }
  },
  mounted() {
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
      if (isMainFrame && url !== blank) {
        this.updateTab({
          id: this.tab.id,
          url,
          query: url === 'https://www.google.com/?sheafy' ? '' : url,
          canGoBack: this.$el.canGoBack(),
          canGoForward: this.$el.canGoForward()
        })
        // TODO: https://github.com/electron/electron/issues/14474
        this.$el.blur()
        this.$el.focus()
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
      this.updateTab({ id: this.tab.id, loading: false, firstLoaded: true })
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
          this.newTab({ url, options: { position: 'next', activate: true } })
          break
        case 'background-tab':
          this.newTab({ url, options: { position: 'next', activate: false } })
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
        case 'newTab': {
          const [url] = args
          this.newTab({ url, options: { position: 'next' } })
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
    if (this.active || !this.tab.firstLoaded) {
      this.src = this.tab.url
    }
  },
  destroyed() {
    this.destroyed = true
  },
  methods: {
    ...mapActions('tab', ['newTab', 'newTabInBackground', 'updateTab'])
  }
}
</script>
