<template>
  <v-list class="tab-list py-1 primary--text" dense>
    <tab-list-item v-if="group.tabs.length < 2" :tab="group.tabs[0]" />
    <v-list-group v-else v-model="expand">
      <template v-slot:activator>
        <tab-list-item-icon
          class="mr-4"
          :url="group.favicon"
          :host="group.host"
        />
        <v-list-item-content>
          <v-list-item-title v-text="group.host || '(Not Pinned)'" />
        </v-list-item-content>
        <v-chip class="caption ml-3 px-2" v-text="tabs.length" />
        <v-list-item-action class="my-0 ml-4">
          <v-btn
            icon
            small
            title="Close All"
            @click.stop="closeGroup({ host: group.host })"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
      <draggable v-model="tabs" animation="150">
        <v-sheet v-for="tab in tabs" :key="tab.id" tile>
          <tab-list-item :tab="tab" sub-group />
        </v-sheet>
      </draggable>
    </v-list-group>
  </v-list>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import TabListItem from '~/components/TabListItem'
import TabListItemIcon from '~/components/TabListItemIcon'

export default {
  components: {
    TabListItem,
    TabListItemIcon
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
    tabs: {
      get() {
        return this.group.tabs
      },
      set(tabs) {
        const ids = tabs.map((tab) => tab.id)
        this.sortTabs({ ids })
      }
    },
    ...mapState('tab', ['activeTabId'])
  },
  watch: {
    activeTabId(value) {
      if (this.group.tabs.find((tab) => tab.id === value)) {
        this.expand = true
      }
    }
  },
  methods: {
    ...mapActions('tab', ['sortTabs', 'unpinHost', 'closeGroup'])
  }
}
</script>

<style lang="scss" scoped>
.tab-list {
  ::v-deep .v-list-group__header {
    &:not(:hover) .v-list-item__action:not(:first-child) {
      display: none;
    }
    &:hover .v-list-group__header__append-icon {
      display: none;
    }
    .v-list-group__header__append-icon {
      margin-left: 16px;
      padding: 0 2px;
      min-width: unset;
    }
    .v-chip {
      pointer-events: none;
      height: 18px;
      padding: 0 6px !important;
    }
  }
  .v-sheet {
    color: inherit;
    &.sortable-ghost {
      opacity: 0;
    }
    .tab-list-item {
      padding-left: 32px;
    }
  }
}
</style>
