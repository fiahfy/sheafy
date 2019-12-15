<template>
  <div
    class="app-panel d-flex flex-column"
    @dragover.prevent="onDragOver"
    @drop.prevent="onDrop"
  >
    <div ref="content" :style="{ height: `${height * 100}%` }">
      <tab-pane class="fill-height" />
    </div>
    <div ref="resizer" class="resizer" />
    <div class="flex-grow-1" style="min-height: 0; flex-basis: 0;">
      <app-pane class="fill-height" />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import { layoutStore, settingsStore, tabStore } from '~/store'
import TabUtils from '~/utils/tab'
import AppPane from '~/components/AppPane.vue'
import TabPane from '~/components/TabPane.vue'

@Component({
  components: {
    AppPane,
    TabPane
  }
})
export default class AppPanel extends Vue {
  @Ref() readonly content!: HTMLDivElement
  @Ref() readonly resizer!: HTMLDivElement

  resizing = false

  get height() {
    return settingsStore.tabPaneHeightRatio
  }

  set height(value) {
    settingsStore.setTabPaneHeightRatio({ tabPaneHeightRatio: value })
  }

  mounted() {
    this.resizer.addEventListener('mousedown', this.onMouseDown)
    document.addEventListener('mouseup', this.onMouseUp)
  }

  destroyed() {
    this.resizer.removeEventListener('mousedown', this.onMouseDown)
    document.removeEventListener('mouseup', this.onMouseUp)
  }

  onMouseDown() {
    this.resizing = true
    layoutStore.setResizing({ resizing: true })
    document.body.style.cursor = 'ns-resize'
    document.addEventListener('mousemove', this.onMouseMove)
  }

  onMouseUp() {
    if (!this.resizing) {
      return
    }
    this.resizing = false
    layoutStore.setResizing({ resizing: false })
    this.height =
      this.content.offsetHeight / (this.$el as HTMLElement).offsetHeight
    document.body.style.cursor = ''
    document.removeEventListener('mousemove', this.onMouseMove)
  }

  onMouseMove(e: MouseEvent) {
    const height = e.clientY - this.content.getBoundingClientRect().top
    if (height < 256 || height > (this.$el as HTMLElement).offsetHeight - 256) {
      return
    }
    this.content.style.height = height + 'px'
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
    const url = TabUtils.getUrlWithQuery(query)
    if (url) {
      tabStore.newTab({ url })
    }
  }
}
</script>

<style lang="scss" scoped>
.app-panel .resizer {
  width: 100%;
  padding: 1px 0;
  margin: -1px 0;
  z-index: 5;
  cursor: ns-resize;
}
</style>
