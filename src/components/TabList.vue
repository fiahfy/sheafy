<template>
  <v-list class="tab-list primary--text py-0" dense>
    <draggable v-model="model" animation="150" @end="onEnd">
      <v-sheet v-for="tab in tabs" :key="tab.id" tile>
        <tab-list-item :tab="tab" />
      </v-sheet>
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

  onEnd() {
    // Remove ripples if stop sorting
    this.$el.querySelectorAll('.v-ripple__container').forEach((el) => {
      ;(<HTMLSpanElement>el).style.display = 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.tab-list .v-sheet {
  color: inherit;
  &.sortable-ghost {
    opacity: 0;
  }
}
</style>
