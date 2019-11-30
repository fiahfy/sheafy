<template>
  <div class="tab-content d-flex flex-column white" @click="onClick">
    <toolbar v-if="!fullScreen" class="flex-grow-0" :index="index" />
    <div class="wrapper flex-grow-1 overflow-hidden">
      <webview v-for="tab in tabs" :key="tab.id" :tab="tab" :index="index" />
      <finding-bar :index="index" />
      <status-bar :index="index" />
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
  @Prop({ type: Number, required: true }) readonly index!: number

  get fullScreen() {
    return layoutStore.fullScreen
  }
  get tabs() {
    return tabStore.tabs
  }

  onClick() {
    tabStore.activateView({ index: this.index })
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
