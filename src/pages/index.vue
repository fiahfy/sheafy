<template>
  <v-container class="index" fluid pa-0>
    <activity-bar v-if="!fullScreen" />
    <div
      class="d-flex flex-grow-1 overflow-hidden fill-height"
      :class="classes"
    >
      <sidebar v-if="!fullScreen" />
      <tab-view
        class="flex-grow-1 overflow-hidden"
        style="min-height: 0; flex-basis: 0;"
        :index="0"
      />
      <div ref="resizer" class="resizer" vertical />
      <tab-view
        ref="content"
        class="flex-grow-0 overflow-hidden"
        :index="1"
        :style="{ width: `${width}px` }"
      />
      <shortcut-bar />
    </div>
  </v-container>
</template>

<script lang="ts">
import { Vue, Component, Ref } from 'vue-property-decorator'
import { layoutStore, settingsStore } from '~/store'
import ActivityBar from '~/components/ActivityBar.vue'
import ShortcutBar from '~/components/ShortcutBar.vue'
import Sidebar from '~/components/Sidebar.vue'
import TabView from '~/components/TabView.vue'

@Component({
  components: {
    ActivityBar,
    ShortcutBar,
    Sidebar,
    TabView
  }
})
export default class Index extends Vue {
  @Ref() readonly resizer!: HTMLDivElement
  @Ref() readonly content!: TabView

  resizing = false

  get classes() {
    return settingsStore.sidebarLocation === 'right'
      ? 'flex-row-reverse'
      : 'flex-row'
  }
  get fullScreen() {
    return layoutStore.fullScreen
  }
  get width() {
    return settingsStore.secondaryTabWidth
  }
  set width(value) {
    settingsStore.setSecondaryTabWidth({ secondaryTabWidth: value })
  }

  mounted() {
    const resize = (e: MouseEvent) => {
      const width =
        settingsStore.sidebarLocation === 'right'
          ? e.clientX - this.content.$el.getBoundingClientRect().left
          : -e.clientX + this.content.$el.getBoundingClientRect().right
      if (
        width < 256 ||
        width > window.innerWidth - 256 - settingsStore.sidebarWidth
      ) {
        return
      }
      ;(<HTMLElement>this.content.$el).style.width = width + 'px'
    }

    this.resizer.addEventListener('mousedown', () => {
      this.resizing = true
      layoutStore.setResizing({ resizing: true })
      document.body.style.cursor = 'ew-resize'
      document.addEventListener('mousemove', resize)
    })

    document.addEventListener('mouseup', () => {
      if (!this.resizing) {
        return
      }
      this.resizing = false
      layoutStore.setResizing({ resizing: false })
      this.width = Number(
        (<HTMLElement>this.content.$el).style.width!.slice(0, -2)
      )
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', resize)
    })
  }
}
</script>
<style lang="scss" scoped>
.index > div {
  position: relative;
  .shortcut-bar {
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    width: 600px;
    max-width: 100%;
    margin: 0 auto;
    z-index: 1;
  }
  .resizer {
    height: 100%;
    padding: 0 1px;
    margin: 0 -1px;
    z-index: 5;
    cursor: ew-resize;
  }
}
</style>
