<template>
  <div
    class="app-panel d-flex flex-column"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <v-toolbar tile dense flat class="flex-grow-0" height="36">
      <span class="subtitle-2 text-uppercase text-truncate user-select-none">
        apps
      </span>
      <badge class="ml-3" :num="apps.length" />
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
export default class AppPanel extends Vue {
  @Ref() readonly container!: HTMLDivElement

  get apps() {
    return tabStore.apps
  }
  get activeTab() {
    return tabStore.activeTab
  }

  @Watch('activeTab')
  onActiveTabChanged(newValue: Tab, oldValue: Tab) {
    if (newValue.id === oldValue.id && newValue.host === oldValue.host) {
      return
    }
    this.$nextTick(() => {
      // Disabled transform for vuedraggable
      this.$el.querySelectorAll('.app-tab-list').forEach((el) => {
        el.parentElement!.style.transform = 'none'
        el.querySelectorAll('.app-tab-list-item').forEach((el) => {
          el.parentElement!.style.transform = 'none'
        })
      })
      const tab = <HTMLElement>(
        this.$el.querySelector('.app-tab-list-item.v-list-item--active')
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

  onDragOver(e: DragEvent) {
    e.dataTransfer!.dropEffect = 'link'
  }
  onDrop(e: DragEvent) {
    const effectAllowed = e.dataTransfer!.effectAllowed
    // Prevent for sorting tabs
    if (effectAllowed === 'move') {
      return
    }
    const query = e.dataTransfer!.getData('text')
    const url = tabStore.getUrlWithQuery({ query })
    if (url) {
      tabStore.newTab({ url })
    }
  }
  onClickNewTab() {
    tabStore.newTab()
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
.app-panel > div {
  position: relative;
}
</style>
