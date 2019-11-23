<template>
  <div class="app-pane d-flex flex-column">
    <v-toolbar tile dense flat class="flex-grow-0 pr-2" height="36">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        apps
      </span>
      <badge class="ml-3" :num="apps.length" />
      <v-spacer />
      <v-btn
        icon
        width="32"
        height="32"
        title="Expand Apps"
        class="ml-1"
        @click="onClickExpand"
      >
        <v-icon size="20">mdi-expand-all</v-icon>
      </v-btn>
      <v-btn
        icon
        width="32"
        height="32"
        title="Collapse Apps"
        class="ml-1"
        @click="onClickCollapse"
      >
        <v-icon size="20">mdi-collapse-all</v-icon>
      </v-btn>
    </v-toolbar>
    <div ref="container" class="flex-grow-1 overflow-y-scroll scrollbar">
      <app-list :apps="apps" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref, Watch } from 'vue-property-decorator'
import { tabStore } from '~/store'
import Tab from '~/models/tab'
import AppList from '~/components/AppList.vue'
import Badge from '~/components/Badge.vue'

@Component({
  components: {
    AppList,
    Badge
  }
})
export default class AppPane extends Vue {
  @Ref() readonly container!: HTMLDivElement

  get apps() {
    return tabStore.sortedApps
  }
  get activeTab() {
    return tabStore.activeTab
  }

  @Watch('activeTab')
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

  onClickExpand() {
    this.$eventBus.$emit('expandApps')
  }
  onClickCollapse() {
    this.$eventBus.$emit('collapseApps')
  }
}
</script>

<style lang="scss" scoped>
.app-pane > div {
  position: relative;
}
</style>
