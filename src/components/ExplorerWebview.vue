<template>
  <webview :src="tab.url" />
</template>

<script>
import { mapMutations } from 'vuex'

export default {
  props: {
    tab: {
      type: Object,
      required: true
    }
  },
  mounted() {
    this.$el.addEventListener('page-title-updated', ({ title }) => {
      this.updateTabTitle({ id: this.tab.id, title })
    })
    this.$el.addEventListener('page-favicon-updated', ({ favicons }) => {
      const favicon = favicons[0]
      this.updateTabFavicon({ id: this.tab.id, favicon })
    })
    this.$root.$on('reload', () => {
      console.log('reload')
    })
  },
  methods: {
    ...mapMutations('tab', ['updateTabTitle', 'updateTabFavicon'])
  }
}
</script>
