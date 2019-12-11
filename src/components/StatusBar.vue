<template>
  <v-card
    v-if="url"
    class="status-bar px-2 py-1 caption text-truncate"
    tile
    v-text="url"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class StatusBar extends Vue {
  @Prop({ type: String, required: true }) readonly viewId!: string

  url = ''

  mounted() {
    this.$eventBus.$on('updateTargetUrl', this.updateTargetUrl)
  }

  destroyed() {
    this.$eventBus.$off('updateTargetUrl', this.updateTargetUrl)
  }

  updateTargetUrl({ viewId, url }: { viewId: string; url: string }) {
    if (this.viewId === viewId) {
      this.url = url
    }
  }
}
</script>

<style lang="scss" scoped>
.theme--light .status-bar {
  color: #757575;
}
.theme--dark .status-bar {
  color: #e0e0e0;
}
</style>
