<template>
  <webview :src="src" />
</template>

<script>
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
    ...mapGetters('tab', ['isActiveTab', 'getSearchUrl'])
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
      }
    })
    this.$root.$on('load', () => {
      if (this.isActiveTab(this.tab)) {
        if (!this.tab.query) {
          return
        }
        if (this.tab.query.match(/^https?:\/\//)) {
          this.$el.loadURL(this.tab.query)
        } else {
          this.$el.loadURL(this.getSearchUrl(this.tab.query))
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
    this.src = this.tab.url
  },
  destroyed() {
    this.$root.$off(['goBack', 'goForward', 'reload', 'load'])
  },
  methods: {
    ...mapActions('tab', ['updateTab'])
  }
}
</script>
