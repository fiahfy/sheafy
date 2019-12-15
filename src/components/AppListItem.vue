<template>
  <v-list class="app-list-item py-0" dense>
    <tab-list-item v-if="app.tabs.length < 2" :tab="app.tabs[0]" app />
    <v-list-group v-else v-model="expand" :ripple="false">
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
      <draggable v-model="model" animation="150">
        <tab-list-item v-for="tab in model" :key="tab.id" :tab="tab" inset />
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
    this.$contextMenu.open(
      [
        {
          label: 'Close App',
          click: () => tabStore.closeApp({ host: this.app.host })
        }
      ],
      { vuetify: true }
    )
  }
}
</script>

<style lang="scss" scoped>
.app-list-item {
  .v-list-group {
    color: unset !important;
    ::v-deep .v-list-group__header {
      min-height: 36px;
      padding-right: 8px;
      &:not(:hover) > .v-list-item__action:not(:first-child) {
        display: none;
      }
      &:hover > .v-list-group__header__append-icon {
        display: none;
      }
      &:hover::before {
        opacity: 0.04;
      }
      > .v-list-group__header__append-icon {
        margin-left: 16px;
        padding: 0 2px;
        min-width: 28px !important;
        justify-content: center;
        i {
          font-size: 16px;
        }
      }
      > .v-list-item__icon {
        height: unset;
        min-width: unset;
      }
    }
  }
  .tab-list-item.sortable-ghost {
    opacity: 0;
  }
  .theme--light & {
    background: #eeeeee;
  }
  .theme--dark & {
    background: #212121;
  }
}
</style>
