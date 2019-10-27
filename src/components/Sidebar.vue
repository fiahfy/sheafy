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

<script>
import { mapMutations, mapState } from 'vuex'
import AppPanel from '~/components/AppPanel'
import DownloadPanel from '~/components/DownloadPanel'
import SettingsPanel from '~/components/SettingsPanel'

export default {
  props: {
    resizing: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      panels: [
        { id: 'apps', component: AppPanel },
        { id: 'downloads', component: DownloadPanel },
        { id: 'settings', component: SettingsPanel }
      ]
    }
  },
  computed: {
    classes() {
      return this.sideBarLocation === 'right' ? 'resizer--right' : ''
    },
    width: {
      get() {
        return this.sideBarWidth
      },
      set(value) {
        this.setSideBarWidth({ sideBarWidth: value })
      }
    },
    ...mapState(['panelId']),
    ...mapState('tab', ['activeId']),
    ...mapState('settings', ['sideBarLocation', 'sideBarWidth'])
  },
  watch: {
    activeId(newValue, oldValue) {
      if (newValue !== oldValue) {
        this.setPanelId({ panelId: 'apps' })
      }
    }
  },
  mounted() {
    this.setupResizeHandler()
  },
  methods: {
    setupResizeHandler() {
      const resize = (e) => {
        document.body.style.cursor = 'ew-resize'
        const width =
          this.sideBarLocation === 'right'
            ? -e.clientX + this.$el.getBoundingClientRect().right
            : e.clientX - this.$el.getBoundingClientRect().left
        if (width < 256 || width > window.innerWidth - 256) {
          return
        }
        this.$el.style.width = width + 'px'
      }

      this.$refs.resizer.addEventListener('mousedown', () => {
        this.$emit('update:resizing', true)
        document.addEventListener('mousemove', resize, false)
      })

      document.addEventListener('mouseup', () => {
        if (!this.resizing) {
          return
        }
        this.$emit('update:resizing', false)
        this.width = Number(this.$el.style.width.slice(0, -2))
        document.body.style.cursor = ''
        document.removeEventListener('mousemove', resize, false)
      })
    },
    ...mapMutations(['setPanelId']),
    ...mapMutations('settings', ['setSideBarWidth'])
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
