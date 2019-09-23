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
      ready: false,
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
      return this.active && this.ready && !this.destroyed
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
    this.$root.$on('goBack', () => {
      if (this.handling) {
        this.$el.goBack()
      }
    })
    this.$root.$on('goForward', () => {
      if (this.handling) {
        this.$el.goForward()
      }
    })
    this.$root.$on('reload', () => {
      if (this.handling) {
        this.$el.reload()
      }
    })
    this.$root.$on('stop', () => {
      if (this.handling) {
        this.$el.stop()
      }
    })
    this.$root.$on('load', () => {
      if (this.handling) {
        const url = this.getUrlWithQuery(this.tab.query)
        if (url) {
          this.$el.loadURL(url)
        }
      }
    })
    this.$root.$on('findInPage', (text, { forward, findNext }) => {
      if (this.handling) {
        this.$el.findInPage(text, { forward, findNext })
      }
    })
    this.$root.$on('stopFindInPage', () => {
      if (this.handling) {
        this.$el.stopFindInPage('clearSelection')
      }
    })
    this.$el.addEventListener('dom-ready', () => {
      this.ready = true
    })
    this.$el.addEventListener('load-commit', ({ url, isMainFrame }) => {
      if (isMainFrame && url !== blank) {
        this.ready = false
        this.updateTab({
          id: this.tab.id,
          url,
          query: url,
          canGoBack: this.$el.canGoBack(),
          canGoForward: this.$el.canGoForward()
        })
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
      this.$el.focus()
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
