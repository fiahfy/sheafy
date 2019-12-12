<template>
  <v-navigation-drawer
    class="activity-bar"
    permanent
    app
    mini-variant
    mini-variant-width="48"
    :right="right"
  >
    <v-list dense class="py-0">
      <v-list-item
        v-for="item in items"
        :key="item.id"
        class="py-1"
        :title="item.title"
        :input-value="isActive(item)"
        @click="() => onClickItem(item)"
      >
        <v-list-item-icon>
          <v-badge color="red">
            <template v-slot:badge>
              <span v-if="hasBadge(item)">0</span>
            </template>
            <v-icon v-text="item.icon" />
          </v-badge>
        </v-list-item-icon>

        <v-list-item-content>
          <v-list-item-title v-text="item.title" />
        </v-list-item-content>
      </v-list-item>
    </v-list>
  </v-navigation-drawer>
</template>

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, settingsStore, tabStore } from '~/store'

@Component
export default class ActivityBar extends Vue {
  items = [
    { id: 'apps', title: 'Apps', icon: 'mdi-tab' },
    { id: 'history', title: 'History', icon: 'mdi-history' },
    { id: 'downloads', title: 'Downloads', icon: 'mdi-download-outline' },
    { id: 'settings', title: 'Settings', icon: 'mdi-settings-outline' }
  ]

  get right() {
    return settingsStore.sidebarLocation === 'right'
  }

  isActive({ id }: { id: string }) {
    return id === layoutStore.panelId
  }

  hasBadge({ id }: { id: string }) {
    if (id === 'apps') {
      return !!tabStore.totalBadges
    }
    return false
  }

  onClickItem({ id }: { id: string }) {
    layoutStore.selectPanel({ id })
  }
}
</script>

<style lang="scss" scoped>
.activity-bar {
  ::v-deep .v-navigation-drawer__border {
    background-color: unset !important;
  }
  .v-list-item {
    opacity: 0.5;
    &:hover,
    &.v-list-item--active {
      opacity: 1;
    }
    &:before {
      opacity: 0;
    }
    ::v-deep .v-badge__badge {
      font-size: 0;
      min-width: 8px;
      right: -3px;
      top: -1px;
      height: 8px;
    }
  }
}
</style>
