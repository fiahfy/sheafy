<template>
  <v-navigation-drawer
    class="explorer-tab-bar"
    permanent
    app
    clipped
    :width="width"
    @drop.native.prevent="onDrop"
    @dragover.native.prevent="onDragOver"
  >
    <v-app-bar fixed tile dense :flat="!scrolling">
      <v-list class="flex-grow-1">
        <v-subheader class="px-0 font-weight-bold">
          TABS
          <v-spacer />
          <v-btn icon width="36" height="36" title="New Tab" @click="newTab">
            <v-icon size="20">mdi-plus-circle-outline</v-icon>
          </v-btn>
        </v-subheader>
      </v-list>
    </v-app-bar>
    <explorer-tab-bar-list
      v-for="group in groups"
      :key="group.id"
      :group="group"
    />
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import ExplorerTabBarList from '~/components/ExplorerTabBarList'

export default {
  components: {
    ExplorerTabBarList
  },
  props: {
    resizing: {
      type: Boolean,
      required: true
    }
  },
  data() {
    return {
      scrolling: false
    }
  },
  computed: {
    width: {
      get() {
        return this.tabBarWidth
      },
      set(value) {
        this.setTabBarWidth({ tabBarWidth: value })
      }
    },
    ...mapState('settings', ['tabBarWidth']),
    ...mapGetters('tab', ['groups'])
  },
  mounted() {
    this.setupResizseHanlder()
    this.setupScrollHandler()
  },
  methods: {
    setupResizseHanlder() {
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
        this.width = this.$el.style.width
        document.body.style.cursor = ''
        document.removeEventListener('mousemove', resize, false)
      })
    },
    setupScrollHandler() {
      const content = this.$el.querySelector('.v-navigation-drawer__content')
      content.addEventListener('scroll', () => {
        this.scrolling = content.scrollTop > 0
      })
    },
    onDragOver(e) {
      e.dataTransfer.dropEffect = 'link'
    },
    onDrop(e) {
      const url = e.dataTransfer.getData('text')
      if (url) {
        this.newTab({ url })
      }
    },
    ...mapMutations('settings', ['setTabBarWidth']),
    ...mapActions('tab', ['newTab'])
  }
}
</script>

<style lang="scss" scoped>
.explorer-tab-bar {
  .v-app-bar {
    transition: none;
    .v-card {
      position: absolute;
      right: 0;
      width: 55px;
    }
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
  ::v-deep .v-navigation-drawer__content {
    margin-top: 48px;
  }
}
</style>
