<template>
  <v-chip
    class="chip caption px-2 user-select-none pointer-events-none"
    :color="color"
    v-text="num"
  />
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'

@Component
export default class Chip extends Vue {
  @Prop({ type: String, default: '' }) readonly color!: string
  @Prop({ type: [String, Number], default: '' }) readonly num!: string | number
}
</script>

<style lang="scss" scoped>
.chip {
  height: 17px !important;
  line-height: 17px !important;
  padding: 0 5.5px !important;
  font-size: 0.66rem !important;
}
</style>
