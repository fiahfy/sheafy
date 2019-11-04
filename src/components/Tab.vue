<template>
  <div class="tab d-flex flex-column white">
    <tab-toolbar v-if="!fullScreen" class="flex-grow-0" />
    <div class="wrapper flex-grow-1 overflow-hidden">
      <tab-webview v-for="tab in tabs" :key="tab.id" :tab="tab" />
      <tab-finding-bar />
      <tab-shortcut-bar />
      <tab-status-bar />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, tabStore } from '~/store'
import TabFindingBar from '~/components/TabFindingBar.vue'
import TabShortcutBar from '~/components/TabShortcutBar.vue'
import TabStatusBar from '~/components/TabStatusBar.vue'
import TabToolbar from '~/components/TabToolbar.vue'
import TabWebview from '~/components/TabWebview.vue'

@Component({
  components: {
    TabFindingBar,
    TabShortcutBar,
    TabStatusBar,
    TabToolbar,
    TabWebview
  }
})
export default class Index extends Vue {
  get fullScreen() {
    return layoutStore.fullScreen
  }
  get tabs() {
    return tabStore.tabs
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
    .tab-finding-bar {
      position: absolute;
      top: 0;
      right: 0;
      width: 384px;
      max-width: 100%;
    }
    .tab-shortcut-bar {
      position: absolute;
      top: 0;
      left: 0;
      right: 0;
      width: 512px;
      max-width: 100%;
      margin: 0 auto;
      z-index: 1;
    }
    .tab-status-bar {
      position: absolute;
      bottom: 0;
      left: 0;
      max-width: 100%;
    }
  }
}
</style>
