<template>
  <v-list class="app-tab-list primary--text py-0" dense>
    <app-tab-list-item v-if="app.tabs.length < 2" :tab="app.tabs[0]" />
    <v-list-group v-else v-model="expand">
      <template v-slot:activator>
        <v-list-item-icon class="mr-3 align-self-center">
          <favicon :url="app.favicon" />
        </v-list-item-icon>
        <v-list-item-content @contextmenu="onContextMenuItem">
          <v-list-item-title v-text="app.host" />
        </v-list-item-content>
        <badge v-if="app.tabs.length" class="ml-3" :num="app.tabs.length" />
        <v-list-item-action class="my-0 ml-4">
          <v-btn icon small title="Close App" @click.stop="onClickClose">
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

<script lang="ts">
import { Vue, Component, Prop, Watch } from 'vue-property-decorator'
import { tabStore } from '~/store'
import App from '~/models/app'
import Tab from '~/models/tab'
import AppTabListItem from '~/components/AppTabListItem.vue'
import Badge from '~/components/Badge.vue'
import Favicon from '~/components/Favicon.vue'

@Component({
  components: {
    AppTabListItem,
    Badge,
    Favicon
  }
})
export default class AppTabList extends Vue {
  @Prop({ type: Object, required: true }) readonly app!: App

  expand = true

  get tabs() {
    return this.app.tabs
  }
  set tabs(tabs) {
    const ids = tabs.map((tab) => tab.id)
    tabStore.sortTabs({ ids })
  }

  @Watch('activeTab')
  onActiveTabChanged(value: Tab) {
    if (this.app.host === value.host) {
      this.expand = true
    }
  }

  mounted() {
    this.$eventBus.$on('expandApps', this.expandApps)
    this.$eventBus.$on('collapseApps', this.collapseApps)
  }

  destroyed() {
    this.$eventBus.$off('expandApps', this.expandApps)
    this.$eventBus.$off('collapseApps', this.collapseApps)
  }

  expandApps() {
    this.expand = true
  }
  collapseApps() {
    this.expand = false
  }
  onClickClose() {
    tabStore.closeApp({ host: this.app.host })
  }
  onContextMenuItem() {
    this.$contextMenu.show([
      {
        label: 'Close App',
        click: () => tabStore.closeApp({ host: this.app.host })
      }
    ])
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
    min-height: 36px;
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
    .v-list-item__icon {
      min-width: unset;
    }
  }
}
</style>
