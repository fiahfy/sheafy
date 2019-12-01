<template>
  <div class="tab-content d-flex flex-column white" @click="onClick">
    <toolbar v-if="!fullScreen" class="flex-grow-0" :view-id="viewId" />
    <div class="wrapper flex-grow-1 overflow-hidden">
      <webview v-for="tab in tabs" :key="tab.id" :tab="tab" :view-id="viewId" />
      <finding-bar :view-id="viewId" />
      <status-bar :view-id="viewId" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { layoutStore, tabStore } from '~/store'
import FindingBar from '~/components/FindingBar.vue'
import StatusBar from '~/components/StatusBar.vue'
import Toolbar from '~/components/Toolbar.vue'
import Webview from '~/components/Webview.vue'

@Component({
  components: {
    FindingBar,
    StatusBar,
    Toolbar,
    Webview
  }
})
export default class TabContent extends Vue {
  @Prop({ type: String, required: true }) readonly viewId!: string

  get fullScreen() {
    return layoutStore.fullScreen
  }
  get tabs() {
    return tabStore.tabs
  }

  onClick() {
    tabStore.activateView({ id: this.viewId })
  }
}
</script>

<style lang="scss" scoped>
.tab-content .wrapper {
  position: relative;
  .finding-bar {
    position: absolute;
    top: 0;
    right: 0;
    width: 384px;
    max-width: 100%;
  }
  .status-bar {
    position: absolute;
    bottom: 0;
    left: 0;
    max-width: 100%;
  }
}
</style>
