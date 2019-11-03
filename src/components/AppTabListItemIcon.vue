<template>
  <v-list-item-icon class="app-tab-list-item-icon align-self-center">
    <v-progress-circular
      v-if="loading"
      indeterminate
      size="16"
      width="2"
      color="primary"
    />
    <template v-else>
      <v-icon v-if="error" small color="grey darken-1">mdi-earth</v-icon>
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
  </v-list-item-icon>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class AppTabListItemIcon extends Vue {
  @Prop({ type: String, required: true }) readonly url!: string
  @Prop({ type: Boolean, default: false }) readonly loading!: boolean

  error = false
}
</script>

<style lang="scss" scoped>
.app-tab-list-item-icon.v-list-item__icon {
  padding: 0 6px;
}
</style>
