<template>
  <div class="tab-pane d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0 pr-2" height="36">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        tabs
      </span>
      <chip class="ml-3" :num="tabs.length" />
      <v-spacer />
      <v-btn
        icon
        width="32"
        height="32"
        title="New Tab"
        class="ml-1"
        @click="onClickNewTab"
      >
        <v-icon size="20">mdi-tab-plus</v-icon>
      </v-btn>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar">
      <tab-list :tabs="tabs" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref, Watch } from 'vue-property-decorator'
import { tabStore } from '~/store'
import Tab from '~/models/tab'
import Chip from '~/components/Chip.vue'
import TabList from '~/components/TabList.vue'

@Component({
  components: {
    Chip,
    TabList
  }
})
export default class TabPane extends Vue {
  @Ref() readonly container!: HTMLDivElement

  get tabs() {
    return tabStore.sortedTabs
  }
  get activeId() {
    return tabStore.activeId
  }

  @Watch('activeId')
  onActiveTabChanged(_newValue: Tab, _oldValue: Tab) {
    this.$nextTick(() => {
      const tab = <HTMLElement>(
        this.$el.querySelector('.tab-list-item.v-list-item--active')
      )
      if (!tab) {
        return
      }
      if (this.container.scrollTop > tab.offsetTop) {
        this.container.scrollTop = tab.offsetTop
      }
      if (
        this.container.scrollTop + this.container.offsetHeight <
        tab.offsetTop + tab.offsetHeight
      ) {
        this.container.scrollTop =
          tab.offsetTop + tab.offsetHeight - this.container.offsetHeight
      }
    })
  }

  onClickNewTab() {
    tabStore.newTab()
  }
}
</script>

<style lang="scss" scoped>
.tab-pane > div {
  position: relative;
}
</style>
