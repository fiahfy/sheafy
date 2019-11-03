<template>
  <v-container class="index" fluid pa-0 :class="{ resizing: resizing }">
    <activity-bar v-if="!fullScreen" />
    <div class="d-flex flex-grow-1 fill-height" :class="classes">
      <div class="d-flex flex-grow-1 flex-column white">
        <toolbar v-if="!fullScreen" class="flex-grow-0" />
        <div class="wrapper flex-grow-1 overflow-hidden">
          <webview v-for="tab in tabs" :key="tab.id" :tab="tab" />
          <shortcut-bar />
          <finding-bar />
          <status-bar />
        </div>
      </div>
      <sidebar v-if="!fullScreen" :resizing.sync="resizing" />
    </div>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, settingsStore, tabStore } from '~/store'
import ActivityBar from '~/components/ActivityBar.vue'
import FindingBar from '~/components/FindingBar.vue'
import ShortcutBar from '~/components/ShortcutBar.vue'
import Sidebar from '~/components/Sidebar.vue'
import StatusBar from '~/components/StatusBar.vue'
import Toolbar from '~/components/Toolbar.vue'
import Webview from '~/components/Webview.vue'

@Component({
  components: {
    ActivityBar,
    FindingBar,
    ShortcutBar,
    Sidebar,
    StatusBar,
    Toolbar,
    Webview
  }
})
export default class Index extends Vue {
  resizing = false

  get classes() {
    return settingsStore.sideBarLocation === 'right'
      ? 'flex-row'
      : 'flex-row-reverse'
  }
  get fullScreen() {
    return layoutStore.fullScreen
  }
  get tabs() {
    return tabStore.tabs
  }

  created() {
    tabStore.newTabIfEmpty()
  }
}
</script>

<style lang="scss" scoped>
.index {
  &.resizing ::v-deep webview {
    pointer-events: none;
  }
  .wrapper {
    position: relative;
  }
  .finding-bar {
    position: absolute;
    top: 0;
    right: 0;
    width: 384px;
    max-width: 100%;
  }
  .shortcut-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 512px;
    max-width: 100%;
    margin: 0 auto;
    z-index: 1;
  }
  .status-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    max-width: 100%;
  }
}
</style>
