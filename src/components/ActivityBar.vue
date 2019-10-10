<template>
  <v-navigation-drawer
    class="activity-bar"
    permanent
    app
    clipped
    mini-variant
    mini-variant-width="48"
  >
    <v-list dense class="py-0">
      <v-list-item
        v-for="item in items"
        :key="item.title"
        class="py-1"
        :title="item.title"
      >
        <v-list-item-icon>
          <v-icon v-text="item.icon" />
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="item.title" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapMutations, mapState } from 'vuex'

export default {
  data() {
    return {
      items: [
        { title: 'Apps', icon: 'mdi-tab' },
        { title: 'Settings', icon: 'mdi-settings' }
      ]
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
// .activity-bar .v-list-item:last-child {
//   position: absolute;
//   bottom: 0;
//   width: 100%;
// }
</style>
