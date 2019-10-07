<template>
  <v-navigation-drawer
    class="side-bar overflow-visible"
    permanent
    app
    clipped
    :width="width"
  >
    <div class="fill-height d-flex flex-column">
      <div class="content content--top flex-grow-1">
        <app-content class="fill-height" />
      </div>
      <div ref="resizer" class="py-1 resizer"><v-divider /></div>
      <div
        ref="bottom"
        class="content content--bottom"
        :style="{ height: `${bottom}px` }"
      >
        <temporary-app-content class="fill-height" />
      </div>
    </div>
  </v-navigation-drawer>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import AppContent from '~/components/AppContent'
import TemporaryAppContent from '~/components/TemporaryAppContent'

export default {
  components: {
    AppContent,
    TemporaryAppContent
  },
  props: {
    resizing: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      verticalResizing: false
    }
  },
  computed: {
    width: {
      get() {
        return this.sideBarWidth
      },
      set(value) {
        this.setSideBarWidth({ sideBarWidth: value })
      }
    },
    bottom: {
      get() {
        return this.sideBarBottom
      },
      set(value) {
        this.setSideBarBottom({ sideBarBottom: value })
      }
    },
    ...mapState('settings', ['sideBarWidth', 'sideBarBottom'])
  },
  mounted() {
    this.setupHorizonResizeHandler()
    this.setupVerticalResizeHandler()
  },
  methods: {
    setupHorizonResizeHandler() {
      const resizer = document.createElement('div')
      const border = this.$el.querySelector('.v-navigation-drawer__border')
      border.append(resizer)

      const direction = this.$el.classList.contains(
        'v-navigation-drawer--right'
      )
        ? 'right'
        : 'left'

      const resize = (e) => {
        document.body.style.cursor = 'ew-resize'
        const width =
          direction === 'right'
            ? document.body.scrollWidth - e.clientX
            : e.clientX
        if (width < 128 || width > window.innerWidth - 128) {
          return
        }
        this.$el.style.width = width + 'px'
      }

      resizer.addEventListener('mousedown', () => {
        this.$emit('update:resizing', true)
        this.$el.style.transition = 'initial'
        document.addEventListener('mousemove', resize, false)
      })

      document.addEventListener('mouseup', () => {
        if (!this.resizing) {
          return
        }
        this.$emit('update:resizing', false)
        this.$el.style.transition = ''
        this.width = Number(this.$el.style.width.slice(0, -2))
        document.body.style.cursor = ''
        document.removeEventListener('mousemove', resize, false)
      })
    },
    setupVerticalResizeHandler() {
      const resize = (e) => {
        document.body.style.cursor = 'ns-resize'
        const height = this.$el.offsetHeight - e.clientY + 61 - 4
        if (height < 128 || height > this.$el.offsetHeight - 128) {
          return
        }
        this.$refs.bottom.style.height = height + 'px'
      }

      this.$refs.resizer.addEventListener('mousedown', () => {
        this.verticalResizing = true
        document.addEventListener('mousemove', resize, false)
      })

      document.addEventListener('mouseup', () => {
        if (!this.verticalResizing) {
          return
        }
        this.verticalResizing = false
        this.bottom = Number(this.$refs.bottom.style.height.slice(0, -2))
        document.body.style.cursor = ''
        document.removeEventListener('mousemove', resize, false)
      })
    },
    ...mapMutations('settings', ['setSideBarWidth', 'setSideBarBottom'])
  }
}
</script>

<style lang="scss" scoped>
.side-bar {
  .resizer {
    cursor: ns-resize;
    z-index: 5;
  }
  ::v-deep .v-navigation-drawer__border {
    z-index: 5;
    > div {
      position: absolute;
      left: -5px;
      height: 100%;
      width: 11px;
      cursor: ew-resize;
    }
  }
}
</style>
