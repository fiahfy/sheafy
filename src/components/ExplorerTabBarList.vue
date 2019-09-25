<template>
  <v-list class="explorer-tab-bar-list" dense>
    <v-list-group v-model="expand">
      <template v-slot:activator>
        <v-list-item-action class="my-0 mr-3">
          <v-btn icon small @click.stop="unpinHost({ host: group.host })">
            <v-icon small>{{ group.host ? 'mdi-pin' : 'mdi-pin-off' }}</v-icon>
          </v-btn>
        </v-list-item-action>
        <v-list-item-content>
          <v-list-item-title v-text="group.host || 'Not Pinned'" />
        </v-list-item-content>
        <v-list-item-action class="my-0">
          <v-btn icon small @click.stop="closeGroup({ host: group.host })">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
      <explorer-tab-bar-list-item
        v-for="tab in group.tabs"
        :key="tab.id"
        :tab="tab"
        @contextmenu.native.stop="onContextMenu(tab)"
      />
    </v-list-group>
  </v-list>
</template>

<script>
import { remote } from 'electron'
import { mapActions, mapGetters, mapMutations, mapState } from 'vuex'
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
  data() {
    return {
      expand: true
    }
  },
  computed: {
    ...mapState('tab', ['activeTabId']),
    ...mapGetters('tab', ['isPinnedTab'])
  },
  watch: {
    activeTabId(value) {
      if (this.group.tabs.find((tab) => tab.id === value)) {
        this.expand = true
      }
    }
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
          label: this.isPinnedTab(tab) ? 'Unpin Host' : 'Pin Host',
          click: () =>
            this.isPinnedTab(tab)
              ? this.unpinHost({ host: tab.host })
              : this.pinHost({ host: tab.host })
        },
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
    ...mapActions('tab', [
      'newTab',
      'closeTab',
      'pinHost',
      'unpinHost',
      'closeGroup'
    ])
  }
}
</script>

<style lang="scss" scoped>
.explorer-tab-bar-list ::v-deep .v-list-group__header {
  &:not(:hover) .v-list-item__action:not(:first-child) {
    display: none;
  }
  &:hover .v-list-item__icon {
    display: none;
  }
  .v-list-item__icon {
    padding: 0 2px;
  }
}
</style>
