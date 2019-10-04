<template>
  <v-list class="app-list-item py-1 primary--text" dense>
    <tab-list-item v-if="app.tabs.length < 2" :tab="app.tabs[0]" />
    <v-list-group v-else v-model="expand">
      <template v-slot:activator>
        <tab-list-item-icon class="mr-2" :url="app.favicon" :host="app.host" />
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
      <tab-list :tabs="app.tabs" />
    </v-list-group>
  </v-list>
</template>

<script>
import { mapActions, mapState } from 'vuex'
import TabList from '~/components/TabList'
import TabListItem from '~/components/TabListItem'
import TabListItemIcon from '~/components/TabListItemIcon'

export default {
  components: {
    TabList,
    TabListItem,
    TabListItemIcon
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
    ...mapActions('tab', ['closeApp'])
  }
}
</script>

<style lang="scss" scoped>
.app-list-item {
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
