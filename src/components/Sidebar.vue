<template>
  <div class="side-bar d-flex" :style="{ width: `${width}px` }">
    <div class="pane flex-grow-1">
      <template v-for="panel in panels">
        <div v-show="panel.id === panelId" :key="panel.id" class="fill-height">
          <component :is="panel.component" class="fill-height" />
        </div>
      </template>
    </div>
    <div ref="resizer" class="resizer" :class="classes">
      <v-divider vertical />
    </div>
  </div>
</template>

<script lang="ts">
import { Vue, Component, PropSync, Ref, Watch } from 'vue-property-decorator'
import { rootStore, settingsStore } from '~/store'
import AppPanel from '~/components/AppPanel.vue'
import DownloadPanel from '~/components/DownloadPanel.vue'
import SettingsPanel from '~/components/SettingsPanel.vue'

@Component
export default class Sidebar extends Vue {
  @PropSync('resizing', { type: Boolean }) syncedResizing!: boolean
  @Ref() readonly resizer!: HTMLDivElement

  panels = [
    { id: 'apps', component: AppPanel },
    { id: 'downloads', component: DownloadPanel },
    { id: 'settings', component: SettingsPanel }
  ]
  get width() {
    return settingsStore.sideBarWidth
  }
  set width(value) {
    settingsStore.setSideBarWidth({ sideBarWidth: value })
  }
  get classes() {
    return settingsStore.sideBarLocation === 'right' ? 'resizer--right' : ''
  }
  get panelId() {
    return rootStore.panelId
  }

  @Watch('activeId')
  onActiveIdChanged(newValue: string, oldValue: string) {
    if (newValue !== oldValue) {
      rootStore.setPanelId({ panelId: 'apps' })
    }
  }

  mounted() {
    const resize = (e: MouseEvent) => {
      document.body.style.cursor = 'ew-resize'
      const width =
        settingsStore.sideBarLocation === 'right'
          ? -e.clientX + this.$el.getBoundingClientRect().right
          : e.clientX - this.$el.getBoundingClientRect().left
      if (width < 256 || width > window.innerWidth - 256) {
        return
      }
      ;(<HTMLElement>this.$el).style.width = width + 'px'
    }

    this.resizer.addEventListener('mousedown', () => {
      this.syncedResizing = true
      document.addEventListener('mousemove', resize, false)
    })

    document.addEventListener('mouseup', () => {
      if (!this.syncedResizing) {
        return
      }
      this.syncedResizing = false
      this.width = Number((<HTMLElement>this.$el).style.width!.slice(0, -2))
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', resize, false)
    })
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  position: relative;
  .pane {
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
    > .v-divider {
      border-color: transparent;
    }
  }
}
</style>
