<template>
  <v-list class="explorer-tab-bar-list" dense>
    <v-subheader>
      {{ group.host || 'Not Grouped' }}
      <v-spacer />
      <v-btn
        icon
        small
        color="grey darken-1"
        @click="closeGroup({ host: group.host })"
      >
        <v-icon small>close</v-icon>
      </v-btn>
    </v-subheader>
    <v-list-item-group v-model="active">
      <explorer-tab-bar-list-item
        v-for="tab in group.tabs"
        :key="tab.id"
        :tab="tab"
        @contextmenu.native.stop="onContextMenu(tab)"
      />
    </v-list-item-group>
  </v-list>
</template>

<script>
import { remote } from 'electron'
import { mapActions, mapGetters, mapState, mapMutations } from 'vuex'
import ExplorerTabBarListItem from '~/components/ExplorerTabBarListItem'

export default {
  components: {
    ExplorerTabBarListItem
  },
  props: {
    group: {
      type: Object,
      required: true
    }
  },
  computed: {
    active: {
      get() {
        return this.activeTabId
      },
      set(value) {
        if (value) {
          this.activateTab({ id: value })
        }
      }
    },
    ...mapState('tab', ['activeTabId']),
    ...mapGetters('tab', ['groups'])
  },
  methods: {
    onContextMenu(tab) {
      this.$contextMenu.show([
        {
          label: 'New Tab',
          click: () =>
            this.newTab({ options: { baseId: tab.id, position: 'next' } })
        },
        { type: 'separator' },
        {
          label: 'Open Current Page in a Default Browser',
          click: () => remote.shell.openExternal(tab.url)
        },
        { type: 'separator' },
        {
          label: 'Close Tab',
          click: () => this.closeTab({ id: tab.id })
        }
      ])
    },
    ...mapMutations('settings', ['setTabBarWidth']),
    ...mapActions('tab', ['newTab', 'closeTab', 'activateTab', 'closeGroup'])
  }
}
</script>

<style lang="scss" scoped>
.explorer-tab-bar-list > .v-subheader:not(:hover) > .v-btn {
  display: none;
}
</style>
