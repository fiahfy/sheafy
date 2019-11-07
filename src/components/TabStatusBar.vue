<template>
  <v-card
    v-if="url"
    class="tab-status-bar px-2 py-1 caption grey--text text--darken-1 text-truncate"
    tile
    v-text="url"
  />
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'

@Component
export default class StatusBar extends Vue {
  url = ''

  mounted() {
    this.$eventBus.$on('updateTargetUrl', this.updateTargetUrl)
  }

  destroyed() {
    this.$eventBus.$off('updateTargetUrl', this.updateTargetUrl)
  }

  updateTargetUrl(url: string) {
    this.url = url
  }
}
</script>
