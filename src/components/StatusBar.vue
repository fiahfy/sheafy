<template>
  <v-card
    v-if="url"
    class="status-bar px-2 py-1 caption grey--text text-truncate"
    :class="classes"
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

  get classes() {
    return this.$vuetify.theme.dark ? 'text--lighten-2' : 'text--darken-1'
  }

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
