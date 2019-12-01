<template>
  <v-list class="app-list-item primary--text py-0" dense>
    <tab-list-item v-if="app.tabs.length < 2" :tab="app.tabs[0]" app />
    <v-list-group v-else v-model="expand">
      <template v-slot:activator>
        <v-list-item-icon class="mr-3 align-self-center">
          <favicon :url="app.favicon" />
        </v-list-item-icon>
        <v-list-item-content @contextmenu="onContextMenuItem">
          <v-list-item-title v-text="app.host" />
        </v-list-item-content>
        <chip v-if="app.tabs.length" class="ml-3" :num="app.tabs.length" />
        <v-list-item-action class="my-0 ml-4">
          <v-btn icon small title="Close App" @click.stop="onClickClose">
            <v-icon small>mdi-close</v-icon>
          </v-btn>
        </v-list-item-action>
      </template>
      <draggable v-model="model" animation="150" @end="onEnd">
        <v-sheet v-for="tab in model" :key="tab.id" tile>
          <tab-list-item :tab="tab" inset />
        </v-sheet>
      </draggable>
    </v-list-group>
  </v-list>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { tabStore } from '~/store'
import App from '~/models/app'
import Chip from '~/components/Chip.vue'
import Favicon from '~/components/Favicon.vue'
import TabListItem from '~/components/TabListItem.vue'

@Component({
  components: {
    TabListItem,
    Chip,
    Favicon
  }
})
export default class AppListItem extends Vue {
  @Prop({ type: Object, required: true }) readonly app!: App

  expand = true

  get model() {
    return this.app.tabs
  }
  set model(value) {
    const ids = value.map((tab) => tab.id)
    tabStore.sortTabsOnApp({ ids, host: this.app.host })
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
  onEnd() {
    // Remove ripples if stop sorting
    this.$el.querySelectorAll('.v-ripple__container').forEach((el) => {
      ;(<HTMLSpanElement>el).style.display = 'none'
    })
  }
}
</script>

<style lang="scss" scoped>
.app-list-item {
  .v-sheet {
    color: inherit;
    &.sortable-ghost {
      opacity: 0;
    }
  }
  ::v-deep .v-list-group__header {
    min-height: 36px;
    padding-right: 8px;
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
