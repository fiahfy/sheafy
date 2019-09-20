<template>
  <v-navigation-drawer
    class="explorer-tab-bar"
    permanent
    app
    clipped
    :width="width"
    @drop.native.prevent="onDrop"
    @dragover.native.prevent="onDragover"
  >
    <v-app-bar fixed flat tile extension-height="1" dense>
      <v-list>
        <v-subheader class="px-0 font-weight-bold">
          TABS
        </v-subheader>
      </v-list>
      <v-card flat class="d-flex justify-center">
        <v-btn icon width="36" height="36" @click="newTab">
          <v-icon size="20">add_circle_outline</v-icon>
        </v-btn>
      </v-card>
      <v-divider slot="extension" />
    </v-app-bar>
    <v-list dense>
      <v-list-item-group v-model="active">
        <explorer-tab-bar-item v-for="tab in tabs" :key="tab.id" :tab="tab" />
      </v-list-item-group>
    </v-list>
  </v-navigation-drawer>
</template>

<script>
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import ExplorerTabBarItem from '~/components/ExplorerTabBarItem'

export default {
  components: {
    ExplorerTabBarItem
  },
  props: {
    resizing: {
      type: Boolean,
      required: true
    }
  },
  computed: {
    active: {
      get() {
        return this.activeTabId
      },
      set(value) {
        this.activateTab({ id: value })
      }
    },
    width: {
      get() {
        return this.tabBarWidth
      },
      set(value) {
        this.setTabBarWidth({ tabBarWidth: value })
      }
    },
    ...mapState('settings', ['tabBarWidth']),
    ...mapState('tab', ['tabs', 'activeTabId']),
    ...mapGetters('tab', ['getUrlWithQuery'])
  },
  mounted() {
    const resizer = document.createElement('div')
    const border = this.$el.querySelector('.v-navigation-drawer__border')
    border.append(resizer)

    const direction = this.$el.classList.contains('v-navigation-drawer--right')
      ? 'right'
      : 'left'

    const resize = (e) => {
      document.body.style.cursor = 'ew-resize'
      const width =
        direction === 'right'
          ? document.body.scrollWidth - e.clientX
          : e.clientX
      if (width < 55 || width > window.innerWidth - 55) {
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
      this.$emit('update:resizing', false)
      this.$el.style.transition = ''
      this.width = this.$el.style.width
      document.body.style.cursor = ''
      document.removeEventListener('mousemove', resize, false)
    })
  },
  methods: {
    onDragover(e) {
      e.dataTransfer.dropEffect = 'link'
    },
    onDrop(e) {
      const query = e.dataTransfer.getData('text')
      const url = this.getUrlWithQuery(query)
      if (url) {
        this.newTab({ url })
      }
    },
    ...mapMutations('settings', ['setTabBarWidth']),
    ...mapActions('tab', ['newTab', 'activateTab'])
  }
}
</script>

<style lang="scss" scoped>
.explorer-tab-bar {
  overflow: visible;
  .v-app-bar .v-card {
    position: absolute;
    right: 0;
    width: 55px;
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
  ::v-deep .v-toolbar__extension {
    padding: 0;
  }
}
</style>
