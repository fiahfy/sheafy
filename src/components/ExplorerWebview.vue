<template>
  <webview :src="src" :preload="preload" />
</template>

<script>
import { mapActions, mapGetters } from 'vuex'
import path from 'path'
import fileUrl from 'file-url'

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
      return fileUrl(path.resolve('./src/preload/index.js'))
    },
    ...mapGetters('tab', ['isActiveTab', 'getUrlWithQuery'])
  },
  mounted() {
    this.$root.$on('goBack', () => {
      if (this.isActiveTab(this.tab)) {
        this.$el.goBack()
      }
    })
    this.$root.$on('goForward', () => {
      if (this.isActiveTab(this.tab)) {
        this.$el.goForward()
      }
    })
    this.$root.$on('reload', () => {
      if (this.isActiveTab(this.tab)) {
        this.$el.reload()
        this.$el.openDevTools()
      }
    })
    this.$root.$on('stop', () => {
      if (this.isActiveTab(this.tab)) {
        this.$el.stop()
      }
    })
    this.$root.$on('load', () => {
      if (this.isActiveTab(this.tab)) {
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
      this.updateTab({ id: this.tab.id, loading: false })
    })
    this.$el.addEventListener('new-window', ({ disposition, url }) => {
      switch (disposition) {
        case 'foreground-tab':
          this.newTab({ url })
          break
        case 'background-tab':
          this.newTabInBackground({ url })
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
          this.newTab({ url })
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
    this.src = this.tab.url
  },
  methods: {
    ...mapActions('tab', ['newTab', 'newTabInBackground', 'updateTab'])
  }
}
</script>
