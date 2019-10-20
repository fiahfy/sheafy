<template>
  <v-card
    v-if="url"
    class="status-bar px-2 py-1 caption grey--text text--darken-1 text-truncate"
    tile
    v-text="url"
  />
</template>

<script>
export default {
  data() {
    return {
      url: ''
    }
  },
  mounted() {
    this.$eventBus.$on('updateTargetUrl', this.updateTargetUrl)
  },
  destroyed() {
    this.$eventBus.$off('updateTargetUrl', this.updateTargetUrl)
  },
  methods: {
    updateTargetUrl(url) {
      this.url = url
    }
  }
}
</script>
