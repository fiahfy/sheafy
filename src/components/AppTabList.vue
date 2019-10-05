<template>
  <v-list class="app-tab-list primary--text py-1" dense>
    <app-tab-list-item v-if="app.tabs.length < 2" :tab="app.tabs[0]" />
    <v-list-group v-else v-model="expand">
      <template v-slot:activator>
        <app-tab-list-item-icon
          class="mr-2"
          :url="app.favicon"
          :host="app.host"
        />
        <v-list-item-content>
          <v-list-item-title v-text="app.host" />
        </v-list-item-content>
        <v-chip class="caption ml-3 px-2" v-text="app.tabs.length" />
        <v-list-item-action class="my-0 ml-4">
          <v-btn
            icon
            small
            title="Close App"
            @click.stop="closeApp({ host: app.host })"
          >
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
      <draggable v-model="tabs" animation="150">
        <v-sheet v-for="tab in tabs" :key="tab.id" tile>
          <app-tab-list-item :tab="tab" sub-group />
        </v-sheet>
      </draggable>
    </v-list-group>
  </v-list>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import AppTabListItem from '~/components/AppTabListItem'
import AppTabListItemIcon from '~/components/AppTabListItemIcon'

export default {
  components: {
    AppTabListItem,
    AppTabListItemIcon
  },
  props: {
    app: {
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
        return this.app.tabs
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
      if (this.app.tabs.find((tab) => tab.id === value)) {
        this.expand = true
      }
    }
  },
  methods: {
    ...mapActions('tab', ['sortTabs', 'closeApp'])
  }
}
</script>

<style lang="scss" scoped>
.app-tab-list {
  .v-sheet {
    color: inherit;
    &.sortable-ghost {
      opacity: 0;
    }
  }
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
}
</style>
