<template>
  <webview :src="tab.url" />
</template>

<script>
import { mapMutations, mapGetters } from 'vuex'

export default {
  props: {
    tab: {
      type: Object,
      required: true
    }
  },
  computed: {
    ...mapGetters('tab', ['isActiveTab'])
  },
  mounted() {
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
      this.updateTab({
        id: this.tab.id,
        loading: false,
        canGoBack: this.$el.canGoBack(),
        canGoForward: this.$el.canGoForward()
      })
    })
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
  },
  destroyed() {
    this.$root.$off(['goBack', 'goForward', 'reload'])
  },
  methods: {
    ...mapMutations('tab', ['updateTab'])
  }
}
</script>
