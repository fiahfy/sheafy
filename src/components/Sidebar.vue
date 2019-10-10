<template>
  <v-navigation-drawer
    class="side-bar overflow-visible"
    permanent
    app
    clipped
    :width="width"
  >
    <div class="fill-height d-flex flex-column">
      <app-content class="fill-height" />
    </div>
  </v-navigation-drawer>
</template>

<script>
import { mapMutations, mapState } from 'vuex'
import AppContent from '~/components/AppContent'

export default {
  components: {
    AppContent
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
    ...mapState('settings', ['sideBarWidth'])
  },
  mounted() {
    this.setupResizeHandler()
  },
  methods: {
    setupResizeHandler() {
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
        if (width < 256 || width > window.innerWidth - 256) {
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
    ...mapMutations('settings', ['setSideBarWidth'])
  }
}
</script>

<style lang="scss" scoped>
.side-bar ::v-deep .v-navigation-drawer__border {
  z-index: 5;
  > div {
    position: absolute;
    left: -5px;
    height: 100%;
    width: 11px;
    cursor: ew-resize;
  }
}
</style>
