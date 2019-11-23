<template>
  <v-navigation-drawer
    class="activity-bar"
    permanent
    app
    mini-variant
    mini-variant-width="48"
    :right="right"
  >
    <v-list dense class="py-0 primary--text">
      <v-list-item
        v-for="item in items"
        :key="item.id"
        class="py-1"
        :title="item.title"
        :input-value="isActive(item)"
        @click="() => onClickItem(item)"
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

<script lang="ts">
import { Vue, Component } from 'vue-property-decorator'
import { layoutStore, settingsStore } from '~/store'

@Component
export default class ActivityBar extends Vue {
  items = [
    { id: 'apps', title: 'Apps', icon: 'mdi-tab' },
    { id: 'downloads', title: 'Downloads', icon: 'mdi-download-outline' },
    { id: 'settings', title: 'Settings', icon: 'mdi-settings-outline' }
  ]

  get right() {
    return settingsStore.sidebarLocation === 'right'
  }

  isActive({ id }: { id: string }) {
    return id === layoutStore.panelId
  }
  onClickItem({ id }: { id: string }) {
    layoutStore.setPanelId({ panelId: id })
  }
}
</script>

<style lang="scss" scoped>
.activity-bar {
  ::v-deep .v-navigation-drawer__border {
    background-color: unset !important;
  }
  .v-list-item {
    opacity: 0.66;
    &:hover,
    &.v-list-item--active {
      opacity: 1;
    }
    &:before {
      opacity: 0;
    }
  }
}
</style>
