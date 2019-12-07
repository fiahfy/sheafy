<template>
  <v-list-item
    class="tab-list-item pr-2"
    :class="{ inset }"
    :title="title"
    :input-value="active"
    @click="onClick"
    @contextmenu.stop="onContextMenu"
  >
    <v-list-item-icon class="my-0 mr-3 align-self-center">
      <favicon :url="tab.favicon" :loading="tab.loading" />
    </v-list-item-icon>
    <v-list-item-content>
      <v-list-item-title class="font-weight-regular caption" v-text="title" />
    </v-list-item-content>
    <chip v-if="tab.badge" class="ml-3" :num="badge" color="error" />
    <v-list-item-action class="my-0">
      <v-btn icon small title="Close" @click.stop="onClickClose">
        <v-icon small>mdi-close</v-icon>
      </v-btn>
    </v-list-item-action>
  </v-list-item>
</template>

<script lang="ts">
import { Vue, Component, Prop } from 'vue-property-decorator'
import { shell } from 'electron'
import { tabStore } from '~/store'
import Tab from '~/models/tab'
import Chip from '~/components/Chip.vue'
import Favicon from '~/components/Favicon.vue'

@Component({
  components: {
    Favicon,
    Chip
  }
})
export default class TabListItem extends Vue {
  @Prop({ type: Object, required: true }) readonly tab!: Tab
  @Prop({ type: Boolean, default: false }) readonly app!: boolean
  @Prop({ type: Boolean, default: false }) readonly inset!: boolean

  get active() {
    return tabStore.isActiveTab({ id: this.tab.id })
  }

  get title() {
    return this.app ? this.tab.host : this.tab.title
  }

  get badge() {
    return this.tab.badge > 99 ? '99+' : String(this.tab.badge)
  }

  onClick(e: MouseEvent) {
    const activeViewId = tabStore.activeViewId
    const inactiveViewId =
      activeViewId === 'secondary' ? 'primary' : 'secondary'
    tabStore.activateTab({
      id: this.tab.id,
      viewId: e.altKey ? inactiveViewId : activeViewId
    })
    tabStore.activateView({ id: e.altKey ? inactiveViewId : activeViewId })
  }

  onClickClose() {
    tabStore.closeTab({ id: this.tab.id })
  }

  onContextMenu() {
    this.$contextMenu.show([
      {
        label: 'Open to the Secondary View',
        click: () =>
          tabStore.activateTab({ id: this.tab.id, viewId: 'secondary' })
      },
      { type: 'separator' },
      {
        label: 'New Tab',
        click: () =>
          tabStore.newTab({ options: { srcId: this.tab.id, position: 'next' } })
      },
      { type: 'separator' },
      {
        label: 'Duplicate Tab',
        click: () => tabStore.duplicateTab({ id: this.tab.id })
      },
      {
        label: 'Open Current Page in a Default Browser',
        click: () => shell.openExternal(this.tab.url)
      },
      { type: 'separator' },
      {
        label: 'Close Tab',
        click: () => tabStore.closeTab({ id: this.tab.id })
      }
    ])
  }
}
</script>

<style lang="scss" scoped>
.tab-list-item {
  min-height: 36px;
  &.inset {
    padding-left: 32px;
  }
  &:not(.v-list-item--active):not(:hover) ::v-deep .v-list-item__action {
    opacity: 0;
  }
  .v-list-item__icon {
    height: unset;
    min-width: unset;
  }
}
</style>
