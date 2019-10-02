<template>
  <v-list class="tab-list" dense>
    <v-list-group v-model="expand">
      <template v-slot:activator>
        <v-hover v-slot:default="{ hover }">
          <v-list-item-action class="my-0 mr-0">
            <v-btn
              icon
              small
              title="Unpin"
              :color="hover ? null : 'primary'"
              :disabled="!group.host"
              @click.stop="unpinHost({ host: group.host })"
            >
              <v-icon small>
                {{ group.host && !hover ? 'mdi-pin' : 'mdi-pin-off' }}
              </v-icon>
            </v-btn>
          </v-list-item-action>
        </v-hover>
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
          <tab-list-item :tab="tab" />
        </v-sheet>
      </draggable>
    </v-list-group>
  </v-list>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import TabListItem from '~/components/TabListItem'

export default {
  components: {
    TabListItem
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
    padding-left: 14px;
    &:not(:hover) .v-list-item__action:not(:first-child) {
      display: none;
    }
    &:hover .v-list-item__icon {
      display: none;
    }
    .v-list-item__content {
      margin-left: 14px;
    }
    .v-list-item__icon {
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
  }
}
</style>
