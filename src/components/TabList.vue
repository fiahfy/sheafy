<template>
  <v-list class="tab-list primary--text py-0" dense>
    <v-sheet v-for="tab in tabs" :key="tab.id" tile>
      <tab-list-item :tab="tab" />
    </v-sheet>
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import Tab from '~/models/tab'
import TabListItem from '~/components/TabListItem.vue'

@Component({
  components: {
    TabListItem
  }
})
export default class TabPane extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly tabs!: Tab[]
}
</script>

<style lang="scss" scoped>
.tab-list .v-sheet {
  color: inherit;
}
</style>
