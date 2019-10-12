<template>
  <div class="side-bar d-flex" :style="{ width: `${width}px` }">
    <div class="pane flex-grow-1">
      <component :is="component" class="fill-height" />
    </div>
    <div ref="resizer" class="resizer">
      <v-divider vertical />
    </div>
  </div>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import AppPanel from '~/components/AppPanel'
import SettingsPanel from '~/components/SettingsPanel'

export default {
  components: {
    AppPanel
  },
  props: {
    resizing: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    component() {
      return this.panelId === 'settings' ? SettingsPanel : AppPanel
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
    ...mapState('settings', ['sideBarWidth'])
  },
  mounted() {
    this.setupResizeHandler()
  },
  methods: {
    setupResizeHandler() {
      const direction = this.$el.classList.contains(
        'v-navigation-drawer--right'
      )
        ? 'right'
        : 'left'

      const resize = (e) => {
        document.body.style.cursor = 'ew-resize'
        const x = e.clientX - this.$el.getBoundingClientRect().left
        const width = direction === 'right' ? document.body.scrollWidth - x : x
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
    right: -5px;
    height: 100%;
    padding: 0 5px;
    z-index: 5;
    cursor: ew-resize;
  }
}
</style>
