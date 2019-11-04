<template>
  <div class="tab d-flex flex-column white">
    <toolbar v-if="!fullScreen" class="flex-grow-0" />
    <div class="wrapper flex-grow-1 overflow-hidden">
      <webview v-for="tab in tabs" :key="tab.id" :tab="tab" />
      <shortcut-bar />
      <finding-bar />
      <status-bar />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, tabStore } from '~/store'
import FindingBar from '~/components/FindingBar.vue'
import ShortcutBar from '~/components/ShortcutBar.vue'
import StatusBar from '~/components/StatusBar.vue'
import Toolbar from '~/components/Toolbar.vue'
import Webview from '~/components/Webview.vue'

@Component({
  components: {
    FindingBar,
    ShortcutBar,
    StatusBar,
    Toolbar,
    Webview
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
