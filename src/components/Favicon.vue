<template>
  <div class="favicon">
    <v-progress-circular
      v-if="loading"
      indeterminate
      size="16"
      width="2"
      color="primary"
      class="d-flex"
    />
    <template v-else>
      <v-icon v-if="error || !url" small class="d-flex" color="grey darken-1">
        mdi-earth
      </v-icon>
      <v-img
        v-else
        :src="url"
        height="16"
        width="16"
        contain
        eager
        transition="false"
        @load="error = false"
        @error="error = true"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class Favicon extends Vue {
  @Prop({ type: String }) readonly url!: string
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean

  error = false

  @Watch('url')
  onUrlChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.error = false
    }
  }
}
</script>
