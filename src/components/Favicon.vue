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
      <v-icon v-if="error" small class="d-flex" color="grey darken-1">
        mdi-earth
      </v-icon>
      <v-img
        v-else
        :src="url"
        height="16"
        width="16"
        contain
        @load="error = false"
        @error="error = true"
      />
    </template>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'

@Component
export default class AppTabListItemIcon extends Vue {
  @Prop({ type: String, required: true }) readonly url!: string
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean

  error = false

  @Watch('url')
  chnaged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      this.error = false
    }
  }
}
</script>
