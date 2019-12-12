<template>
  <div class="side-bar d-flex" :style="{ width: `${width}px` }">
    <div class="wrapper flex-grow-1">
      <template v-for="panel in panels">
        <div v-show="panel.id === panelId" :key="panel.id" class="fill-height">
          <component :is="panel.component" class="fill-height" />
        </div>
      </template>
    </div>
    <div ref="resizer" class="resizer" :class="classes" />
  </div>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import { layoutStore, settingsStore } from '~/store'
import AppPanel from '~/components/AppPanel.vue'
import DownloadPanel from '~/components/DownloadPanel.vue'
import HistoryPanel from '~/components/HistoryPanel.vue'
import SettingsPanel from '~/components/SettingsPanel.vue'

@Component
export default class Sidebar extends Vue {
  @Ref() readonly resizer!: HTMLDivElement

  resizing = false
  panels = [
    { id: 'apps', component: AppPanel },
    { id: 'history', component: HistoryPanel },
    { id: 'downloads', component: DownloadPanel },
    { id: 'settings', component: SettingsPanel }
  ]

  get width() {
    return settingsStore.sidebarWidth
  }

  set width(value) {
    settingsStore.setSidebarWidth({ sidebarWidth: value })
  }

  get classes() {
    return settingsStore.sidebarLocation === 'right' ? 'resizer--right' : ''
  }

  get panelId() {
    return layoutStore.panelId
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
    document.body.style.cursor = 'ew-resize'
    document.addEventListener('mousemove', this.onMouseMove)
  }

  onMouseUp() {
    if (!this.resizing) {
      return
    }
    this.resizing = false
    layoutStore.setResizing({ resizing: false })
    this.width = (this.$el as HTMLElement).offsetWidth
    document.body.style.cursor = ''
    document.removeEventListener('mousemove', this.onMouseMove)
  }

  onMouseMove(e: MouseEvent) {
    const width =
      settingsStore.sidebarLocation === 'right'
        ? -e.clientX + this.$el.getBoundingClientRect().right
        : e.clientX - this.$el.getBoundingClientRect().left
    if (width < 256 || width > window.innerWidth - 256) {
      return
    }
    ;(this.$el as HTMLElement).style.width = width + 'px'
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  position: relative;
  .wrapper {
    min-width: 0;
  }
  .resizer {
    position: absolute;
    right: -1px;
    height: 100%;
    padding: 0 1px;
    z-index: 5;
    cursor: ew-resize;
    &.resizer--right {
      left: -1px;
      right: unset;
    }
  }
  .theme--light & {
    background: #eeeeee;
  }
  .theme--dark & {
    background: #212121;
  }
}
</style>
