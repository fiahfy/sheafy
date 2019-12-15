<template>
  <v-list class="tab-list py-0 transparent" dense>
    <draggable v-model="model" animation="150">
      <tab-list-item v-for="tab in tabs" :key="tab.id" :tab="tab" />
    </draggable>
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { tabStore } from '~/store'
import Tab from '~/models/tab'
import TabListItem from '~/components/TabListItem.vue'

@Component({
  components: {
    TabListItem
  }
})
export default class TabPane extends Vue {
  @Prop({ type: Array, default: () => [] }) readonly tabs!: Tab[]

  get model() {
    return this.tabs
  }

  set model(value) {
    const ids = value.map((tab) => tab.id)
    tabStore.sortTabs({ ids })
  }
}
</script>

<style lang="scss" scoped>
.tab-list {
  .tab-list-item.sortable-ghost {
    opacity: 0;
  }
}
</style>
