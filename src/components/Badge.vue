<template>
  <v-chip
    class="badge caption px-2 user-select-none pointer-events-none"
    :color="color"
    v-text="num"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Badge extends Vue {
  @Prop({ type: String, default: '' }) readonly color!: string
  @Prop({ type: [String, Number], default: '' }) readonly num!: string | number
}
</script>

<style lang="scss" scoped>
.badge.v-chip {
  height: 18px !important;
  padding: 0 6px !important;
}
</style>
