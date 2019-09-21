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

export default {
  props: {
    tab: {
      type: Object,
      required: true
    }
  },
  data() {
    return {
      src: ''
    }
  },
  computed: {
    preload() {
      return `file://${remote.app.getAppPath()}/preload.js`
    },
    active() {
      return this.isActiveTab(this.tab)
    },
    ...mapGetters('tab', ['isActiveTab', 'getUrlWithQuery'])
  },
  watch: {
    active(value) {
      if (value && !this.src) {
        this.src = this.tab.url
      }
    }
  },
  mounted() {
    this.$root.$on('goBack', () => {
      if (this.active) {
        this.$el.goBack()
      }
    })
    this.$root.$on('goForward', () => {
      if (this.active) {
        this.$el.goForward()
      }
    })
    this.$root.$on('reload', () => {
      if (this.active) {
        this.$el.reload()
      }
    })
    this.$root.$on('stop', () => {
      if (this.active) {
        this.$el.stop()
      }
    })
    this.$root.$on('load', () => {
      if (this.active) {
        const url = this.getUrlWithQuery(this.tab.query)
        if (url) {
          this.$el.loadURL(url)
        }
      }
    })
    this.$el.addEventListener('load-commit', ({ url, isMainFrame }) => {
      if (isMainFrame) {
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
      this.updateTab({ id: this.tab.id, loading: true })
    })
    this.$el.addEventListener('did-stop-loading', () => {
      this.updateTab({ id: this.tab.id, loading: false, firstLoaded: true })
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
  methods: {
    ...mapActions('tab', ['newTab', 'newTabInBackground', 'updateTab'])
  }
}
</script>
